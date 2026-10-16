import type { BankTransaction, RecurringStream } from '../models/bankData';
import type { LinkedBankAccount, SandboxTestCredentials } from '../models/linkedBank';

/**
 * The Plaid API calls Pace needs. The only implementation is SandboxPlaidApi: this prototype never
 * talks to Plaid's development or production environments.
 */
export interface PlaidApi {
  /**
   * Sandbox-only shortcut that skips Plaid Link: creates a public token for a test institution,
   * signed in as one of Plaid's published sandbox test users.
   */
  createSandboxPublicToken(args: { institutionId: string; products: string[]; credentials: SandboxTestCredentials }): Promise<string>;

  /** Swaps a public token for a long-lived access token. */
  exchangePublicToken(publicToken: string): Promise<{ accessToken: string; itemId: string }>;

  /** The Item's accounts (with itemId set to [itemId]) and institution name. */
  getAccounts(args: { accessToken: string; itemId: string }): Promise<{ institutionName?: string; accounts: LinkedBankAccount[] }>;

  /** Live balances for every account in the Item (`/accounts/balance/get`). */
  getBalances(args: { accessToken: string; itemId: string }): Promise<LinkedBankAccount[]>;

  /**
   * All of the Item's transactions (`/transactions/sync`, following every page). After a new link
   * Plaid delivers them in two steps: `ready` is false until the first (recent ~30 days) batch is
   * available, and `complete` is false until the full history has arrived as well.
   */
  syncTransactions(accessToken: string): Promise<{ transactions: BankTransaction[]; ready: boolean; complete: boolean }>;

  /** The Item's recurring streams. `ready` is false while Plaid is still preparing them. */
  getRecurringStreams(accessToken: string): Promise<{ streams: RecurringStream[]; ready: boolean }>;

  /** Disconnects the Item at Plaid; succeeds if Plaid no longer knows it. */
  removeItem(accessToken: string): Promise<void>;
}
