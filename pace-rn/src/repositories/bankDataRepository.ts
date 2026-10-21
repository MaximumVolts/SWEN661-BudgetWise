import { type BankSnapshot, type BankTransaction, emptySnapshot, type RecurringStream } from '../models/bankData';
import type { LinkedBankAccount } from '../models/linkedBank';
import { Emitter, type Subscribable } from '../utils/events';
import type { LinkedBankRepository } from './linkedBankRepository';
import type { PlaidApi } from './plaidApi';

/**
 * Bank data (balances, transactions, recurring streams) for the signed-in user's linked banks.
 * Every screen that shows bank information reads it from here.
 */
export interface BankDataRepository {
  /** The latest data, cached briefly so several screens share one fetch; [refresh] forces a new one. */
  load(options?: { refresh?: boolean }): Promise<BankSnapshot>;
  /** Emits when newer data arrives on its own (e.g. a just-linked bank's transactions). */
  readonly updates: Subscribable;
  /** Stops any background re-checks (when the app goes away). */
  stopRetrying(): void;
}

interface Fetched {
  snapshot: BankSnapshot;
  complete: boolean;
}

/**
 * [BankDataRepository] that reads everything live from Plaid (**sandbox only**) using the access
 * tokens of the user's linked Items.
 *
 * Right after a bank is linked, Plaid prepares the data in stages: recent transactions first, then
 * the full history, then recurring streams. An incomplete snapshot is never cached as fresh: while
 * it's incomplete this re-checks Plaid every [retryEveryMs] (up to [maxRetries] times), and emits on
 * [updates] each time a fetch brings different data, so screens fill in stage by stage.
 */
export class PlaidBankDataRepository implements BankDataRepository {
  private readonly emitter = new Emitter();
  readonly updates: Subscribable = this.emitter;

  private readonly plaid: PlaidApi;
  private readonly banks: LinkedBankRepository;
  private readonly currentUserId: () => string | undefined;
  private readonly now: () => Date;
  private readonly maxAgeMs: number;
  private readonly retryEveryMs: number;
  private readonly maxRetries: number;

  /** Which user + linked Items the cached snapshot belongs to. */
  private cacheKey?: string;
  private cached?: Promise<Fetched>;
  private cachedAt?: Date;
  private cachedComplete = false;
  /** What the last fetch for [cacheKey] returned, to tell when new data has arrived. */
  private lastShape?: string;
  private retry?: ReturnType<typeof setTimeout>;
  private retries = 0;

  constructor(options: {
    plaid: PlaidApi;
    banks: LinkedBankRepository;
    currentUserId: () => string | undefined;
    now?: () => Date;
    maxAgeMs?: number;
    retryEveryMs?: number;
    maxRetries?: number;
  }) {
    this.plaid = options.plaid;
    this.banks = options.banks;
    this.currentUserId = options.currentUserId;
    this.now = options.now ?? (() => new Date());
    this.maxAgeMs = options.maxAgeMs ?? 120_000;
    this.retryEveryMs = options.retryEveryMs ?? 3_000;
    this.maxRetries = options.maxRetries ?? 40;
  }

  async load(options: { refresh?: boolean } = {}): Promise<BankSnapshot> {
    const userId = this.currentUserId();
    if (!userId) return emptySnapshot(this.now());
    const items = await this.banks.itemsFor(userId);
    if (items.length === 0) return emptySnapshot(this.now());

    const key = `${userId}|${items.map((i) => i.itemId).join(',')}`;
    const sameItems = key === this.cacheKey && this.cached !== undefined;
    const fresh = this.cachedAt !== undefined && this.now().getTime() - this.cachedAt.getTime() < this.maxAgeMs;
    // An incomplete snapshot is only reused while its fetch is still in flight.
    if (!options.refresh && sameItems && (this.cachedAt === undefined || (fresh && this.cachedComplete))) {
      return (await this.cached!).snapshot;
    }
    if (key !== this.cacheKey) {
      this.stopRetrying();
      this.retries = 0;
      this.lastShape = undefined;
    }

    this.cacheKey = key;
    this.cachedAt = undefined; // in flight
    const pending = this.fetch(new Map(items.map((i) => [i.itemId, { token: i.accessToken, name: i.institutionName }])));
    this.cached = pending;
    try {
      const fetched = await pending;
      if (this.cached === pending) {
        this.cachedAt = this.now();
        this.cachedComplete = fetched.complete;
        this.announceIfChanged(fetched);
        this.scheduleRetry(key, fetched.complete);
      }
      return fetched.snapshot;
    } catch (e) {
      // Don't cache failures: the next load tries the bank again.
      if (this.cached === pending) {
        this.cached = undefined;
        this.cachedAt = undefined;
      }
      throw e;
    }
  }

  /** Stops any pending re-check (e.g. when the app closes, or in tests). */
  stopRetrying() {
    if (this.retry !== undefined) clearTimeout(this.retry);
    this.retry = undefined;
  }

  /**
   * Tells screens to reload when this fetch brought different data than the previous one for the
   * same user and banks. The first fetch isn't announced: whoever asked for it gets it directly.
   */
  private announceIfChanged({ snapshot: s, complete }: Fetched) {
    const shape = [s.accounts.length, s.transactions.length, s.recurring.length, s.transactionsReady, complete].join('|');
    const changed = this.lastShape !== undefined && shape !== this.lastShape;
    this.lastShape = shape;
    if (changed) this.emitter.emit();
  }

  /** While Plaid is still preparing data, fetch again shortly. */
  private scheduleRetry(key: string, complete: boolean) {
    this.stopRetrying();
    if (complete) {
      this.retries = 0;
      return;
    }
    if (this.retries >= this.maxRetries) return;
    this.retries++;
    this.retry = setTimeout(async () => {
      if (key !== this.cacheKey) return; // signed out, or banks changed: a new load takes over
      try {
        await this.load({ refresh: true });
      } catch {
        // Keep trying on the same schedule; screens show their own error if they load meanwhile.
        if (key === this.cacheKey) this.scheduleRetry(key, false);
      }
    }, this.retryEveryMs);
  }

  private async fetch(items: Map<string, { token: string; name: string }>): Promise<Fetched> {
    const accounts: LinkedBankAccount[] = [];
    const transactions: BankTransaction[] = [];
    const recurring: RecurringStream[] = [];
    let transactionsReady = true;
    let historyComplete = true;
    let recurringReady = true;
    for (const [itemId, { token }] of items) {
      const [balances, tx, rec] = await Promise.all([
        this.plaid.getBalances({ accessToken: token, itemId }),
        this.plaid.syncTransactions(token),
        this.plaid.getRecurringStreams(token),
      ]);
      accounts.push(...balances);
      transactions.push(...tx.transactions);
      recurring.push(...rec.streams);
      transactionsReady &&= tx.ready;
      historyComplete &&= tx.complete;
      recurringReady &&= rec.ready;
    }
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first
    return {
      snapshot: {
        institutions: Object.fromEntries([...items].map(([id, { name }]) => [id, name])),
        accounts,
        transactions,
        recurring,
        transactionsReady,
        fetchedAt: this.now(),
      },
      complete: transactionsReady && historyComplete && recurringReady,
    };
  }
}
