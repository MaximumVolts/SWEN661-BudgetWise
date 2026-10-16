import type { LinkedBankAccount } from './linkedBank';

/** One transaction from Plaid's /transactions/sync. */
export interface BankTransaction {
  transactionId: string;
  accountId: string;
  /** Plaid's sign convention: positive = money out of the account, negative = money in. */
  amount: number;
  date: Date;
  /** Raw bank descriptor, e.g. "Uber 063015 SF**POOL**". */
  name: string;
  merchantName?: string | null;
  pending: boolean;
  /** Plaid personal_finance_category.primary, e.g. "FOOD_AND_DRINK". */
  categoryPrimary?: string | null;
}

/** The app's sign convention: negative = money out, positive = money in. */
export const signedAmount = (t: BankTransaction) => -t.amount;

/** The merchant's name when Plaid knows it, else the bank's descriptor. */
export const displayName = (t: { merchantName?: string | null; name: string }) => (t.merchantName ? t.merchantName : t.name);

/** A recurring stream from Plaid's /transactions/recurring/get (a bill, subscription or paycheck). */
export interface RecurringStream {
  streamId: string;
  accountId: string;
  description: string;
  merchantName?: string | null;
  /** WEEKLY, BIWEEKLY, SEMI_MONTHLY, MONTHLY, ANNUALLY or UNKNOWN. */
  frequency: string;
  /** Always positive; [isInflow] says which direction. */
  averageAmount: number;
  lastAmount: number;
  lastDate?: Date | null;
  nextDate?: Date | null;
  isActive: boolean;
  isInflow: boolean;
  categoryPrimary?: string | null;
  /** Transactions Plaid grouped into this stream. */
  transactionIds: string[];
}

export const streamName = (s: RecurringStream) => (s.merchantName ? s.merchantName : s.description);

/** Everything Plaid returned for the signed-in user's linked banks, fetched together. */
export interface BankSnapshot {
  /** itemId -> institution name, for every linked bank. */
  institutions: Record<string, string>;
  accounts: LinkedBankAccount[];
  transactions: BankTransaction[];
  recurring: RecurringStream[];
  /** False while Plaid is still preparing transactions after a new link. */
  transactionsReady: boolean;
  fetchedAt: Date;
}

export const emptySnapshot = (now: Date): BankSnapshot => ({
  institutions: {},
  accounts: [],
  transactions: [],
  recurring: [],
  transactionsReady: true,
  fetchedAt: now,
});

export const isLinked = (s: BankSnapshot) => Object.keys(s.institutions).length > 0;

export const accountIn = (s: BankSnapshot, accountId: string) => s.accounts.find((a) => a.accountId === accountId);
