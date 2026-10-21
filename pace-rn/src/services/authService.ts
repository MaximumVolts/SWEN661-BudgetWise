import { AppException, FieldValidationException } from '../models/appException';
import type { FlowStep } from '../models/navigation';
import type { UserAccount } from '../models/userAccount';
import { Emitter, type Subscribable } from '../utils/events';
import type { PlaidKeyRepository } from '../repositories/plaidKeyRepository';
import type { UserAccountRepository } from '../repositories/userAccountRepository';
import { PasswordHasher } from './passwordHasher';
import { compactErrors, Validators } from './validators';

export interface NewAccountInput {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  plaidClientId: string;
  plaidSecret: string;
}

export interface ResetPasswordInput {
  username: string;
  securityAnswer: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Authentication & session.
 *
 * BUSINESS RULES THAT LIVE HERE (not in screens): credential validation (FieldValidationException
 * with 'username' / 'password' messages), reset lockout, and where the user goes next: signing in
 * goes straight home; only a newly created account starts onboarding.
 */
export interface AuthService {
  readonly isSignedIn: boolean;
  /** The signed-in account's id, or undefined when signed out. */
  readonly currentUserId: string | undefined;
  /** Emits whenever the session changes (sign-in, sign-out). */
  readonly signedInChanges: Subscribable<boolean>;
  signIn(username: string, password: string): Promise<FlowStep>;
  /** Questions offered at sign-up; one is asked before a password reset. */
  readonly securityQuestions: readonly string[];
  /**
   * Creates a Pace account (with the user's Plaid sandbox keys), signs the user in and returns
   * the first step of sign-up (onboarding). Throws FieldValidationException with 'name' /
   * 'username' / 'password' / 'confirmPassword' / 'securityQuestion' / 'securityAnswer' /
   * 'plaidClientId' / 'plaidSecret' messages.
   */
  createAccount(input: NewAccountInput): Promise<FlowStep>;
  /** Step 1 of a password reset. Throws FieldValidationException ('username'). */
  securityQuestionFor(username: string): Promise<string>;
  /**
   * Step 2: checks the answer, sets the new password and signs the user in. Throws
   * FieldValidationException ('securityAnswer' / 'password' / 'confirmPassword'), or
   * AppException after too many wrong answers.
   */
  resetPassword(input: ResetPasswordInput): Promise<FlowStep>;
  signOut(): Promise<void>;
  /** Deletes the signed-in account and everything it owns, then signs out. */
  deleteAccount(): Promise<void>;
}

/** Same message for an unknown username and a wrong password, so sign-in doesn't reveal accounts. */
const BAD_CREDENTIALS = 'Username or password is incorrect';
const LOCKED = 'Too many incorrect answers. Try again in a few minutes.';

export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the name of your first school?',
  'What is your oldest sibling’s middle name?',
  'What was the make of your first car?',
  'What street did you grow up on?',
] as const;

/** Wrong security answers allowed per account before resets are locked for LOCKOUT_MS. */
const MAX_RESET_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60_000;

/** Answers match ignoring case and repeated / surrounding whitespace ("New  York " = "new york"). */
const normaliseAnswer = (a: string) => a.trim().toLowerCase().replace(/\s+/g, ' ');

/**
 * [AuthService] backed by a [UserAccountRepository] and a [PasswordHasher]. Everything happens on
 * the device: there is no backend.
 */
export class RepositoryAuthService implements AuthService {
  readonly securityQuestions = SECURITY_QUESTIONS;
  private readonly changes = new Emitter<boolean>();
  /** Per-username (lower-cased) wrong-answer count and lock expiry, for this app session. */
  private readonly resetFailures = new Map<string, { count: number; lockedUntil?: number }>();
  private current?: UserAccount;

  private readonly accounts: UserAccountRepository;
  private readonly plaidKeys: PlaidKeyRepository;
  private readonly hasher: PasswordHasher;
  private readonly now: () => Date;

  constructor(opts: { accounts: UserAccountRepository; plaidKeys: PlaidKeyRepository; hasher?: PasswordHasher; now?: () => Date }) {
    this.accounts = opts.accounts;
    this.plaidKeys = opts.plaidKeys;
    this.hasher = opts.hasher ?? new PasswordHasher();
    this.now = opts.now ?? (() => new Date());
  }

  get signedInChanges(): Subscribable<boolean> {
    return this.changes;
  }
  get isSignedIn() {
    return this.current !== undefined;
  }
  get currentUserId() {
    return this.current?.id;
  }

  private setCurrent(account: UserAccount | undefined) {
    this.current = account;
    this.changes.emit(account !== undefined);
  }

  async signIn(username: string, password: string): Promise<FlowStep> {
    const errors = compactErrors({
      username: Validators.requiredText(username, 'Enter your username'),
      password: password ? undefined : 'Enter your password',
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);

    const account = await this.accounts.fetchByUsername(username);
    if (!account || !(await this.hasher.verify(password, account.passwordHash))) {
      throw new FieldValidationException({ password: BAD_CREDENTIALS }, BAD_CREDENTIALS);
    }
    this.setCurrent(account);
    return 'home';
  }

  async createAccount(input: NewAccountInput): Promise<FlowStep> {
    const errors = compactErrors({
      name: Validators.requiredText(input.name, 'Enter your name'),
      username: Validators.newUsername(input.username),
      password: Validators.newPassword(input.password),
      confirmPassword: Validators.passwordsMatch(input.password, input.confirmPassword),
      securityQuestion: (SECURITY_QUESTIONS as readonly string[]).includes(input.securityQuestion) ? undefined : 'Choose a security question',
      securityAnswer: Validators.securityAnswer(input.securityAnswer),
      plaidClientId: Validators.plaidClientId(input.plaidClientId),
      plaidSecret: Validators.plaidSandboxSecret(input.plaidSecret),
    });
    if (!errors.username && (await this.accounts.fetchByUsername(input.username))) {
      errors.username = 'An account with this username already exists';
    }
    if (Object.keys(errors).length) throw new FieldValidationException(errors);

    const account = await this.accounts.create({
      username: input.username.trim(),
      displayName: input.name.trim(),
      passwordHash: await this.hasher.hash(input.password),
      securityQuestion: input.securityQuestion,
      securityAnswerHash: await this.hasher.hash(normaliseAnswer(input.securityAnswer)),
    });
    await this.plaidKeys.save(account.id, { clientId: input.plaidClientId.trim(), sandboxSecret: input.plaidSecret.trim() });
    this.setCurrent(account);
    return 'onboarding';
  }

  async securityQuestionFor(username: string) {
    return (await this.resettableAccount(username)).securityQuestion!;
  }

  async resetPassword(input: ResetPasswordInput): Promise<FlowStep> {
    const account = await this.resettableAccount(input.username);
    const key = account.username.toLowerCase();
    const lockedUntil = this.resetFailures.get(key)?.lockedUntil;
    if (lockedUntil !== undefined && this.now().getTime() < lockedUntil) throw new AppException(LOCKED);

    const errors = compactErrors({
      securityAnswer: input.securityAnswer.trim() ? undefined : 'Enter your answer',
      password: Validators.newPassword(input.newPassword),
      confirmPassword: Validators.passwordsMatch(input.newPassword, input.confirmPassword),
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);

    if (!(await this.hasher.verify(normaliseAnswer(input.securityAnswer), account.securityAnswerHash!))) {
      const failures = (this.resetFailures.get(key)?.count ?? 0) + 1;
      if (failures >= MAX_RESET_ATTEMPTS) {
        this.resetFailures.set(key, { count: 0, lockedUntil: this.now().getTime() + LOCKOUT_MS });
        throw new AppException(LOCKED);
      }
      this.resetFailures.set(key, { count: failures });
      throw new FieldValidationException({ securityAnswer: "That answer doesn't match" });
    }

    this.resetFailures.delete(key);
    const updated = { ...account, passwordHash: await this.hasher.hash(input.newPassword) };
    await this.accounts.save(updated);
    this.setCurrent(updated);
    return 'home';
  }

  /** The account for [username] if its password can be reset; otherwise a 'username' field error. */
  private async resettableAccount(username: string): Promise<UserAccount> {
    const missing = Validators.requiredText(username, 'Enter your username');
    if (missing) throw new FieldValidationException({ username: missing });
    const account = await this.accounts.fetchByUsername(username);
    if (!account) throw new FieldValidationException({ username: 'No account on this device uses that username' });
    if (!account.securityQuestion || !account.securityAnswerHash) {
      throw new FieldValidationException({ username: 'This account has no security question, so its password can’t be reset' });
    }
    return account;
  }

  async signOut() {
    this.setCurrent(undefined);
  }

  async deleteAccount() {
    if (this.current) await this.accounts.delete(this.current.id);
    await this.signOut();
  }
}
