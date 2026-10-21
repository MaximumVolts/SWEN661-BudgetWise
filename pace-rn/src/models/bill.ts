import type { RecurringKind } from './recurring';

export type SubscriptionStatus = 'active' | 'paused';

export interface BillItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  iconKey: string;
  isOverdue: boolean;
}

export interface BillSection {
  title: string;
  items: BillItem[];
}

export interface BillsUpcomingData {
  summaryLabel: string;
  summaryAmount: number;
  summaryDetail: string;
  sections: BillSection[];
}

export interface RecurringItem {
  id: string;
  name: string;
  iconKey: string;
  /** "$2.99 monthly · next Oct 29" */
  detailLine: string;
  /** "$35.88 a year" */
  yearlyLine: string;
  status: SubscriptionStatus;
  kind: RecurringKind;
  /** True when the user added it; false when the bank detected it. */
  isManual: boolean;
  /** e.g. "Price went up from $9.99 to $12.99". */
  priceChangeLine?: string;
}

export interface RecurringData {
  monthlyTotal: number;
  yearlyTotal: number;
  items: RecurringItem[];
  insight?: string;
  /** Of [monthlyTotal], how much is subscriptions (the rest is bills). */
  subscriptionsMonthly: number;
  /** [items] split into subscriptions, then bills; empty groups are left out. */
  groups: RecurringGroup[];
}

/** One kind of recurring expense on Bills → Recurring, with what it costs a month. */
export interface RecurringGroup {
  kind: RecurringItem['kind'];
  /** "Subscriptions" / "Bills". */
  title: string;
  items: RecurringItem[];
  monthly: number;
}
