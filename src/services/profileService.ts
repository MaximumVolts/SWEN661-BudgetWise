import { AppException, FieldValidationException } from '../models/appException';
import type { PlaidKeys } from '../models/plaidKeys';
import type { ProfileData } from '../models/profile';
import type { UserAccount } from '../models/userAccount';
import { Emitter, type Subscribable } from '../utils/events';
import type { PlaidKeyRepository } from '../repositories/plaidKeyRepository';
import type { UserAccountRepository } from '../repositories/userAccountRepository';
import { compactErrors, Validators } from './validators';

/**
 * The signed-in user's profile.
 * BUSINESS RULES: name validation, initials and sign-in labels, and the Plaid sandbox keys' format.
 * The username is the account's sign-in identity and can't be changed from the profile.
 */
export interface ProfileService {
  /** Throws AppException when nobody is signed in. */
  load(): Promise<ProfileData>;
  /**
   * Saves a new name and the Plaid sandbox keys (not the username). An empty [plaidSecret] keeps
   * the stored secret. Throws FieldValidationException ('name', 'plaidClientId', 'plaidSecret').
   */
  update(input: { name: string; plaidClientId: string; plaidSecret: string }): Promise<ProfileData>;
  /** Emits after every successful update, so other screens (e.g. Settings) can refresh. */
  readonly changes: Subscribable;
}

/** First letters of the first and last words of [name]; else the username's first letter; else "?". */
export function initialsFor(name: string | undefined, username: string | undefined): string {
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length) return `${words[0][0]}${words.length > 1 ? words[words.length - 1][0] : ''}`.toUpperCase();
  const u = (username ?? '').trim();
  return u ? u[0].toUpperCase() : '?';
}

const toProfile = (a: UserAccount, keys: PlaidKeys | undefined): ProfileData => ({
  name: a.displayName ?? '',
  username: a.username,
  initials: initialsFor(a.displayName, a.username),
  signInMethod: 'Username & password',
  plaidClientId: keys?.clientId ?? '',
  hasPlaidSecret: !!keys?.sandboxSecret,
});

/** [ProfileService] over the users table plus the user's Plaid sandbox keys. */
export class RepositoryProfileService implements ProfileService {
  readonly changes = new Emitter();
  private readonly accounts: UserAccountRepository;
  private readonly plaidKeys: PlaidKeyRepository;
  private readonly currentUserId: () => string | undefined;

  constructor(opts: { accounts: UserAccountRepository; plaidKeys: PlaidKeyRepository; currentUserId: () => string | undefined }) {
    this.accounts = opts.accounts;
    this.plaidKeys = opts.plaidKeys;
    this.currentUserId = opts.currentUserId;
  }

  private async current(): Promise<UserAccount> {
    const id = this.currentUserId();
    const account = id === undefined ? undefined : await this.accounts.fetchById(id);
    if (!account) throw new AppException('Sign in to see your profile.');
    return account;
  }

  async load() {
    const account = await this.current();
    return toProfile(account, await this.plaidKeys.load(account.id));
  }

  async update({ name, plaidClientId, plaidSecret }: { name: string; plaidClientId: string; plaidSecret: string }) {
    const account = await this.current();
    const stored = await this.plaidKeys.load(account.id);
    // A blank secret keeps the stored one, so it never has to be shown or retyped.
    const keepSecret = !plaidSecret.trim() && !!stored?.sandboxSecret;
    // Keys are checked once there are some: saved ones, or ones being entered. Someone without
    // keys can still rename themselves (they're asked for keys when they connect a bank).
    const hasKeys = stored !== undefined || !!plaidClientId.trim() || !!plaidSecret.trim();
    const errors = compactErrors({
      name: Validators.requiredText(name, 'Enter your name'),
      plaidClientId: hasKeys ? Validators.plaidClientId(plaidClientId) : undefined,
      plaidSecret: hasKeys && !keepSecret ? Validators.plaidSandboxSecret(plaidSecret) : undefined,
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);

    const updated = { ...account, displayName: name.trim() };
    await this.accounts.save(updated);
    let keys = stored;
    if (hasKeys) {
      keys = { clientId: plaidClientId.trim(), sandboxSecret: keepSecret ? stored!.sandboxSecret : plaidSecret.trim() };
      await this.plaidKeys.save(account.id, keys);
    }
    this.changes.emit();
    return toProfile(updated, keys);
  }
}
