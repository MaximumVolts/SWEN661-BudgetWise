import type { CategoryInfo } from './transaction';

/** What kind of recurring expense it is. */
export type RecurringKind = 'subscription' | 'bill';
export const RECURRING_KINDS: RecurringKind[] = ['subscription', 'bill'];
export const RECURRING_KIND_LABEL: Record<RecurringKind, string> = { subscription: 'Subscription', bill: 'Bill' };

/** How often a recurring expense is paid. [code] is Plaid's name for it (also how it's stored). */
export interface RecurringFrequency {
  code: 'WEEKLY' | 'BIWEEKLY' | 'SEMI_MONTHLY' | 'MONTHLY' | 'ANNUALLY' | 'UNKNOWN';
  label: string;
  /** As in "$15.99 monthly". */
  adverb: string;
}

export const Frequency = {
  weekly: { code: 'WEEKLY', label: 'Weekly', adverb: 'weekly' },
  biweekly: { code: 'BIWEEKLY', label: 'Every 2 weeks', adverb: 'every 2 weeks' },
  semiMonthly: { code: 'SEMI_MONTHLY', label: 'Twice a month', adverb: 'twice a month' },
  monthly: { code: 'MONTHLY', label: 'Monthly', adverb: 'monthly' },
  yearly: { code: 'ANNUALLY', label: 'Yearly', adverb: 'yearly' },
  unknown: { code: 'UNKNOWN', label: 'Recurring', adverb: 'recurring' },
} as const satisfies Record<string, RecurringFrequency>;

const ALL_FREQUENCIES: RecurringFrequency[] = Object.values(Frequency);

/** The frequencies a user can choose for an expense they add. */
export const CHOOSABLE_FREQUENCIES: RecurringFrequency[] = [Frequency.weekly, Frequency.biweekly, Frequency.monthly, Frequency.yearly];

export const frequencyFromCode = (code: string): RecurringFrequency =>
  ALL_FREQUENCIES.find((f) => f.code === code) ?? Frequency.unknown;

/** A recurring expense the user added themselves (rent paid by cheque, a yearly membership…). */
export interface RecurringExpense {
  /** Empty for one that isn't saved yet. */
  id: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  /** The first payment; later ones follow every [frequency]. */
  firstDue: Date;
  categoryId: string;
  kind: RecurringKind;
}

/** What the user can do with a recurring expense from its menu. */
export type RecurringAction = 'details' | 'markPaid' | 'pause' | 'resume' | 'edit' | 'delete';

/** One payment of a recurring expense, from the bank's transactions. */
export interface BillPayment {
  transactionId: string;
  /** "Oct 3, 2026" */
  dateLabel: string;
  /** The app's sign: negative = money out. */
  amount: number;
}

/** One recurring expense in full (the details page). */
export interface BillDetailData {
  id: string;
  name: string;
  iconKey: string;
  kind: RecurringKind;
  /** True when the user added it (it can be edited / deleted); false when the bank detected it. */
  isManual: boolean;
  isPaused: boolean;
  /** "$15.99 monthly" */
  amountLabel: string;
  /** "$191.88 a year" */
  yearlyLabel: string;
  /** "Next payment Oct 29", "Overdue · was due Oct 2", "Paused". */
  nextLabel: string;
  categoryName: string;
  /** "Detected in Plaid Checking - 0000" / "Added by you". */
  sourceLabel: string;
  /** e.g. "Price went up from $9.99 to $12.99". */
  priceChangeLabel?: string;
  /** The next payment can be marked as paid. */
  canMarkPaid: boolean;
  /** Payments the bank matched to it, newest first (none for ones the user added). */
  history: BillPayment[];
}

/** The choices on the add / edit recurring expense form. */
export interface RecurringFormOptions {
  categories: CategoryInfo[];
  frequencies: RecurringFrequency[];
  kinds: RecurringKind[];
  /** The expense being edited, if any. */
  editing?: RecurringExpense;
}
