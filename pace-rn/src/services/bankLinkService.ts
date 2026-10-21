import { AppException } from '../models/appException';
import { type BankConnection, SIMPLE_SANDBOX_CREDENTIALS, type SandboxInstitution } from '../models/linkedBank';
import type { LinkOutcome } from '../models/navigation';
import { Emitter, type Subscribable } from '../utils/events';
import type { LinkedBankRepository } from '../repositories/linkedBankRepository';
import type { PlaidApi } from '../repositories/plaidApi';
import { DateLabels } from '../utils/dateLabels';

/**
 * Bank linking. BUSINESS RULES: token exchange, duplicate-institution handling, what happens next
 * ([LinkOutcome.next]), and removing a connection.
 */
export interface BankLinkService {
  /** The banks that can be linked, with the ones the signed-in user already has marked. */
  institutions(): Promise<SandboxInstitution[]>;
  /**
   * Links [institutionId] (one of [institutions]), or the first one not linked yet when omitted.
   * Throws AppException when it's already linked.
   */
  startLink(institutionId?: string): Promise<LinkOutcome>;
  /** The signed-in user's linked banks (empty when none, or when signed out). */
  connections(): Promise<BankConnection[]>;
  /** Disconnects [itemId] at the provider and deletes it (and its accounts) from the device. */
  removeConnection(itemId: string): Promise<void>;
  /**
   * Emits when the linked banks' data changes: a bank was linked or removed, or a just-linked
   * bank's transactions finished loading. Screens that show bank data reload on it.
   */
  readonly dataUpdates: Subscribable;
}

/** Plaid's sandbox test institution "First Platypus Bank", linked first (e.g. during sign-up). */
export const TEST_INSTITUTION_ID = 'ins_109508';
export const TEST_INSTITUTION_NAME = 'First Platypus Bank';

/**
 * Plaid's sandbox test banks (https://plaid.com/docs/sandbox/institutions/). They all hold Plaid's
 * sample data, never real accounts.
 */
export const TEST_INSTITUTIONS = [
  { id: TEST_INSTITUTION_ID, name: TEST_INSTITUTION_NAME },
  { id: 'ins_109509', name: 'First Gingham Credit Union' },
  { id: 'ins_109510', name: 'Tattersall Federal Credit Union' },
  { id: 'ins_109511', name: 'Tartan Bank' },
  { id: 'ins_109512', name: 'Houndstooth Bank' },
] as const;

const PRODUCTS = ['transactions'];

/**
 * [BankLinkService] that links a Plaid **Sandbox** test bank. The user never enters bank
 * credentials: the Item is created for a test institution with Plaid's published "simple" sandbox
 * test credentials (user_good / pass_good).
 * BUSINESS RULES: which test institutions can be linked (each once per user), which products,
 * storing the result for the signed-in user, removing a connection (revoked at Plaid first), and
 * where the user goes next.
 */
export class PlaidSandboxBankLinkService implements BankLinkService {
  private readonly emitter = new Emitter();
  private readonly plaid: PlaidApi;
  private readonly banks: LinkedBankRepository;
  private readonly currentUserId: () => string | undefined;
  private readonly now: () => Date;

  /** [dataUpdates]: the bank data repository's updates (BankDataRepository.updates). */
  constructor(opts: {
    plaid: PlaidApi;
    banks: LinkedBankRepository;
    currentUserId: () => string | undefined;
    now?: () => Date;
    dataUpdates?: Subscribable;
  }) {
    this.plaid = opts.plaid;
    this.banks = opts.banks;
    this.currentUserId = opts.currentUserId;
    this.now = opts.now ?? (() => new Date());
    opts.dataUpdates?.subscribe(() => this.emitter.emit());
  }

  /** The bank data's own updates, plus one whenever a bank is linked or removed here. */
  get dataUpdates(): Subscribable {
    return this.emitter;
  }

  async institutions(): Promise<SandboxInstitution[]> {
    const userId = this.currentUserId();
    const linked = new Set(userId === undefined ? [] : (await this.banks.itemsFor(userId)).map((i) => i.institutionId));
    return TEST_INSTITUTIONS.map((i) => ({ id: i.id, name: i.name, isLinked: linked.has(i.id) }));
  }

  async startLink(institutionId?: string): Promise<LinkOutcome> {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in before connecting a bank.');
    const options = await this.institutions();
    let institution: SandboxInstitution | undefined;
    if (institutionId === undefined) {
      institution = options.find((i) => !i.isLinked);
      if (!institution) throw new AppException("All of Plaid's test banks are already connected.");
    } else {
      institution = options.find((i) => i.id === institutionId);
      if (!institution) throw new AppException("That isn't one of Plaid's test banks.");
      if (institution.isLinked) throw new AppException(`${institution.name} is already connected.`);
    }

    const publicToken = await this.plaid.createSandboxPublicToken({
      institutionId: institution.id,
      products: PRODUCTS,
      credentials: SIMPLE_SANDBOX_CREDENTIALS,
    });
    const exchanged = await this.plaid.exchangePublicToken(publicToken);
    const result = await this.plaid.getAccounts(exchanged);

    await this.banks.saveItem(
      {
        itemId: exchanged.itemId,
        userId,
        institutionId: institution.id,
        institutionName: institution.name, // the test bank chosen (one of TEST_INSTITUTIONS)
        accessToken: exchanged.accessToken,
        sandboxCredentialsLabel: SIMPLE_SANDBOX_CREDENTIALS.label,
        linkedAt: this.now(),
      },
      result.accounts,
    );
    this.emitter.emit();
    return { linked: true, next: 'home' };
  }

  async connections(): Promise<BankConnection[]> {
    const userId = this.currentUserId();
    if (userId === undefined) return [];
    const accounts = await this.banks.accountsFor(userId);
    return (await this.banks.itemsFor(userId)).map((item) => ({
      itemId: item.itemId,
      institutionName: item.institutionName,
      accountCount: accounts.filter((a) => a.itemId === item.itemId).length,
      linkedOnLabel: DateLabels.short(item.linkedAt),
      isSandbox: true,
    }));
  }

  /**
   * Only the signed-in user's own connection can be removed. Plaid is told first, so the access
   * token is revoked before the device forgets it; if Plaid can't be reached, nothing is deleted
   * and the user can try again.
   */
  async removeConnection(itemId: string) {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to manage your bank connection.');
    const item = (await this.banks.itemsFor(userId)).find((i) => i.itemId === itemId);
    if (!item) throw new AppException('That bank connection no longer exists.');
    await this.plaid.removeItem(item.accessToken);
    await this.banks.deleteItem(itemId);
    this.emitter.emit();
  }
}
