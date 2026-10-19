import { AppException, FieldValidationException } from '../models/appException';
import { accountIn, type BankSnapshot, type RecurringStream, signedAmount, streamName } from '../models/bankData';
import type { BillItem, BillSection, BillsUpcomingData, RecurringData, RecurringGroup, RecurringItem } from '../models/bill';
import { formatMoney } from '../models/money';
import {
  type BillDetailData,
  type BillPayment,
  CHOOSABLE_FREQUENCIES,
  frequencyFromCode,
  RECURRING_KINDS,
  type RecurringAction,
  type RecurringExpense,
  type RecurringFormOptions,
  type RecurringFrequency,
  type RecurringKind,
} from '../models/recurring';
import type { CategoryInfo } from '../models/transaction';
import { Emitter, type Subscribable } from '../utils/events';
import type { RecurringExpenseRepository } from '../repositories/recurringExpenseRepository';
import { categoryById, categoryForPlaid, SPENDING_CATEGORIES } from './bankCategories';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import { addDays, dateOnly, isBefore } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { RecurringSchedule } from './recurringSchedule';
import { compactErrors, Validators } from './validators';

export interface RecurringInput {
  /** undefined adds a new one; otherwise the id of one the user added. */
  editingId?: string;
  name: string;
  /** As typed. */
  amount: string;
  frequency?: RecurringFrequency;
  firstDue?: Date;
  categoryId?: string;
  kind?: RecurringKind;
}

/** An upcoming bill with its due date (for the dashboard, notifications and reminders). */
export interface UpcomingBill {
  bill: BillItem;
  due: Date;
}

/**
 * Bills and subscriptions: the recurring payments the bank detects plus the ones the user adds.
 * BUSINESS RULES: what counts as a bill vs a subscription, upcoming / overdue / paid, monthly and
 * yearly costs, price changes, which actions an item allows, and validating what the user adds.
 */
export interface BillService {
  getUpcoming(): Promise<BillsUpcomingData>;
  getRecurring(): Promise<RecurringData>;
  getDetail(id: string): Promise<BillDetailData>;
  /** What the user can do with [item] (its menu). */
  actionsFor(item: RecurringItem): RecurringAction[];
  markPaid(billId: string): Promise<void>;
  setSubscriptionPaused(id: string, paused: boolean): Promise<void>;
  /** The add / edit form's choices; [editingId] pre-fills one the user added. */
  formOptions(editingId?: string): Promise<RecurringFormOptions>;
  /** Throws FieldValidationException ('name', 'amount', 'frequency', 'firstDue', 'category', 'kind'). */
  saveRecurring(input: RecurringInput): Promise<void>;
  /** Deletes a recurring expense the user added. */
  deleteRecurring(id: string): Promise<void>;
  /** Upcoming (and overdue) bills with their due dates, soonest first. */
  upcomingWithDates(): Promise<UpcomingBill[]>;
  /** Emits after anything changes (added, edited, deleted, paid, paused). */
  readonly changes: Subscribable;
}

const WINDOW_DAYS = 30;
const MAX_NAME = 40;
const MANUAL_PREFIX = 'manual-';
/** Categories whose recurring payments are bills rather than subscriptions. */
export const BILL_CATEGORIES = new Set(['utilities', 'loans', 'home', 'medical', 'services', 'fees', 'transfers']);

const kindOf = (c: CategoryInfo): RecurringKind => (BILL_CATEGORIES.has(c.id) ? 'bill' : 'subscription');

// ── The two kinds of recurring payment, behind one interface ────────────────

/** A recurring payment, whichever source it comes from. */
interface Recurring {
  id: string;
  name: string;
  /** A typical payment. */
  amount: number;
  frequency: RecurringFrequency;
  category: CategoryInfo;
  kind: RecurringKind;
  isManual: boolean;
  sourceLabel: string;
  /** e.g. "Price went up from $9.99 to $12.99"; undefined when it hasn't changed. */
  priceChange?: string;
  priceWentUp: boolean;
  monthlyCost: number;
  /** The next payment to make, as of [today], after the one marked paid ([paid]). */
  nextDue(today: Date, paid: Date | undefined): Date | undefined;
  /** Payments made, newest first. */
  history: BillPayment[];
  /** Set for ones the user added. */
  expense?: RecurringExpense;
}

/** Detected by Plaid in the linked bank's transactions. */
function bankRecurring(s: RecurringStream, snap: BankSnapshot): Recurring {
  const frequency = frequencyFromCode(s.frequency);
  const category = categoryForPlaid(s.categoryPrimary);
  const txs = snap.transactions.filter((t) => s.transactionIds.includes(t.transactionId)).sort((a, b) => a.date.getTime() - b.date.getTime());
  // The stream's charges, oldest first.
  const charges = txs.map((t) => Math.abs(t.amount));
  const [before, last] = charges.length >= 2 ? [charges[charges.length - 2], charges[charges.length - 1]] : [undefined, undefined];
  const account = accountIn(snap, s.accountId);
  return {
    id: s.streamId,
    name: streamName(s),
    amount: s.lastAmount,
    frequency,
    category,
    kind: kindOf(category),
    isManual: false,
    sourceLabel: account ? `Detected in ${account.name}${account.mask ? ` - ${account.mask}` : ''}` : 'Detected by your bank',
    priceChange:
      before === undefined || Math.abs(last! - before) < 0.01
        ? undefined
        : `Price went ${last! > before ? 'up' : 'down'} from ${formatMoney(before)} to ${formatMoney(last!)}`,
    priceWentUp: before !== undefined && last! > before + 0.005,
    monthlyCost: s.averageAmount * RecurringSchedule.perMonth(frequency),
    /** Plaid's predicted next date; once that one is marked paid, the one after it. */
    nextDue(_today, paid) {
      const next = s.nextDate ?? undefined;
      if (!next) return undefined;
      return paid && !isBefore(paid, next) ? RecurringSchedule.occurrence(next, frequency, 1) : next;
    },
    history: [...txs]
      .reverse()
      .map((t) => ({ transactionId: t.transactionId, dateLabel: DateLabels.long(t.date), amount: signedAmount(t) })),
  };
}

/** Added by the user: payments fall on its firstDue, then every frequency after. */
function manualRecurring(e: RecurringExpense): Recurring {
  return {
    id: `${MANUAL_PREFIX}${e.id}`,
    name: e.name,
    amount: e.amount,
    frequency: e.frequency,
    category: categoryById(e.categoryId),
    kind: e.kind,
    isManual: true,
    sourceLabel: 'Added by you',
    priceWentUp: false,
    monthlyCost: e.amount * RecurringSchedule.perMonth(e.frequency),
    /** The first payment from today on, or after the one marked paid if that's later. */
    nextDue(today, paid) {
      const from = paid && !isBefore(paid, today) ? addDays(paid, 1) : today;
      return RecurringSchedule.firstOnOrAfter(e.firstDue, e.frequency, from);
    },
    history: [],
    expense: e,
  };
}

/** A price increase is the most useful thing to point out; otherwise the biggest cost. */
function insight(all: Recurring[], paused: Set<string>): string {
  const active = all.filter((r) => !paused.has(r.id));
  if (!active.length) return 'No recurring payments yet. Add one with + or link a bank to detect them.';
  const increased = active.find((r) => r.priceWentUp);
  if (increased) return `${increased.name}: ${increased.priceChange!.toLowerCase()}.`;
  const biggest = [...active].sort((a, b) => b.monthlyCost - a.monthlyCost)[0];
  return `Your biggest recurring payment is ${biggest.name} at about ${formatMoney(biggest.monthlyCost)} a month.`;
}

/**
 * [BillService] over the recurring payments Plaid (sandbox) detects in the linked banks, plus the
 * recurring expenses the user adds (via [RecurringExpenseRepository]).
 *
 * BUSINESS RULES: bills are recurring payments in BILL_CATEGORIES; the rest are subscriptions (the
 * user picks for ones they add). "Upcoming" = next payment within 30 days (or overdue, for detected
 * ones); paid / paused are Pace's own marks (the bank isn't changed); monthly cost normalises each
 * frequency; a price change is the last charge differing from the one before; only expenses the
 * user added can be edited or deleted.
 */
export class PlaidBillService extends BankDataService implements BillService {
  readonly changes = new Emitter();
  private readonly expenses: RecurringExpenseRepository;

  constructor(deps: BankServiceDeps & { recurring: RecurringExpenseRepository }) {
    super(deps);
    this.expenses = deps.recurring;
  }

  // ── Everything recurring, from both sources ───────────────────────────────

  /** Active recurring payments: the bank's (money out) and the user's own. */
  private async all(): Promise<Recurring[]> {
    const snap = await this.bankData.load();
    const userId = this.currentUserId();
    return [
      ...snap.recurring.filter((s) => !s.isInflow && s.isActive).map((s) => bankRecurring(s, snap)),
      ...(userId === undefined ? [] : (await this.expenses.listFor(userId)).map(manualRecurring)),
    ];
  }

  private async find(id: string): Promise<Recurring> {
    const r = (await this.all()).find((x) => x.id === id);
    if (!r) throw new AppException('That bill or subscription is no longer tracked.');
    return r;
  }

  /** The next payment still to make: after the one marked paid, if any. */
  private nextDue(r: Recurring, paid: Map<string, Date>) {
    return r.nextDue(this.currentDate(), paid.get(r.id));
  }

  private requireUser(): string {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to track bills and subscriptions.');
    return userId;
  }

  async upcomingWithDates(): Promise<UpcomingBill[]> {
    const today = this.currentDate();
    const paid = await this.paidBills();
    const paused = await this.pausedSubscriptions();
    const upcoming: UpcomingBill[] = [];
    for (const r of await this.all()) {
      const due = this.nextDue(r, paid);
      if (!due || paused.has(r.id) || !isBefore(due, addDays(today, WINDOW_DAYS))) continue;
      const overdue = isBefore(due, today);
      upcoming.push({
        due,
        bill: {
          id: r.id,
          title: r.name,
          subtitle: overdue ? `Overdue · was due ${DateLabels.short(due)}` : `Due ${DateLabels.short(due)}`,
          amount: r.amount,
          iconKey: r.category.iconKey,
          isOverdue: overdue,
        },
      });
    }
    return upcoming.sort((a, b) => a.due.getTime() - b.due.getTime());
  }

  async getUpcoming(): Promise<BillsUpcomingData> {
    const upcoming = await this.upcomingWithDates();
    const weekEnd = addDays(this.currentDate(), 7);
    const soon = upcoming.filter((u) => isBefore(u.due, weekEnd)).map((u) => u.bill);
    const later = upcoming.filter((u) => !isBefore(u.due, weekEnd)).map((u) => u.bill);
    const n = upcoming.length;
    const sections: BillSection[] = [];
    if (soon.length) sections.push({ title: 'This week', items: soon });
    if (later.length) sections.push({ title: 'Later', items: later });
    return {
      summaryLabel: 'Due in the next 30 days',
      summaryAmount: upcoming.reduce((s, u) => s + u.bill.amount, 0),
      summaryDetail: n ? `${n} bill${n === 1 ? '' : 's'} scheduled` : 'No bills due in the next 30 days',
      sections,
    };
  }

  async getRecurring(): Promise<RecurringData> {
    const all = await this.all();
    const paid = await this.paidBills();
    const paused = await this.pausedSubscriptions();
    let monthly = 0;
    let subscriptions = 0;
    const rows = all.map((r) => {
      const isPaused = paused.has(r.id);
      if (!isPaused) {
        monthly += r.monthlyCost;
        if (r.kind === 'subscription') subscriptions += r.monthlyCost;
      }
      const due = this.nextDue(r, paid);
      const item: RecurringItem = {
        id: r.id,
        name: r.name,
        iconKey: r.category.iconKey,
        detailLine: [`${formatMoney(r.amount)} ${r.frequency.adverb}`, isPaused ? 'paused' : due ? `next ${DateLabels.short(due)}` : undefined]
          .filter(Boolean)
          .join(' · '),
        yearlyLine: isPaused ? '$0 a year while paused' : `${formatMoney(r.monthlyCost * 12)} a year`,
        status: isPaused ? 'paused' : 'active',
        kind: r.kind,
        isManual: r.isManual,
        priceChangeLine: r.priceChange,
      };
      return { item, due };
    });
    // Active ones first, soonest payment first.
    const FAR = Number.MAX_SAFE_INTEGER;
    rows.sort((a, b) => {
      const ap = a.item.status === 'paused';
      const bp = b.item.status === 'paused';
      if (ap !== bp) return ap ? 1 : -1;
      return (a.due?.getTime() ?? FAR) - (b.due?.getTime() ?? FAR);
    });
    const items = rows.map((r) => r.item);
    const groups: RecurringGroup[] = [
      { kind: 'subscription' as const, title: 'Subscriptions', items: items.filter((i) => i.kind === 'subscription'), monthly: subscriptions },
      { kind: 'bill' as const, title: 'Bills', items: items.filter((i) => i.kind === 'bill'), monthly: monthly - subscriptions },
    ].filter((g) => g.items.length > 0);
    return {
      monthlyTotal: monthly,
      yearlyTotal: monthly * 12,
      subscriptionsMonthly: subscriptions,
      items,
      groups,
      insight: insight(all, paused),
    };
  }

  async getDetail(id: string): Promise<BillDetailData> {
    const r = await this.find(id);
    const due = this.nextDue(r, await this.paidBills());
    const isPaused = (await this.pausedSubscriptions()).has(id);
    const today = this.currentDate();
    return {
      id: r.id,
      name: r.name,
      iconKey: r.category.iconKey,
      kind: r.kind,
      isManual: r.isManual,
      isPaused,
      amountLabel: `${formatMoney(r.amount)} ${r.frequency.adverb}`,
      yearlyLabel: isPaused ? '$0 a year while paused' : `${formatMoney(r.monthlyCost * 12)} a year`,
      nextLabel: isPaused
        ? 'Paused · not counted in your totals'
        : !due
          ? 'No upcoming payment'
          : isBefore(due, today)
            ? `Overdue · was due ${DateLabels.long(due)}`
            : `Next payment ${DateLabels.long(due)}`,
      categoryName: r.category.name,
      sourceLabel: r.sourceLabel,
      priceChangeLabel: r.priceChange,
      canMarkPaid: !isPaused && !!due && isBefore(due, addDays(today, WINDOW_DAYS)),
      history: r.history,
    };
  }

  actionsFor(item: RecurringItem): RecurringAction[] {
    return ['details', item.status === 'paused' ? 'resume' : 'pause', ...(item.isManual ? (['edit', 'delete'] as const) : [])];
  }

  async markPaid(billId: string) {
    const userId = this.requireUser();
    const r = await this.find(billId);
    const due = this.nextDue(r, await this.paidBills());
    if (!due) throw new AppException('There is no upcoming payment to mark as paid.');
    await this.annotations.markBillPaid(userId, billId, due);
    this.changes.emit();
  }

  async setSubscriptionPaused(id: string, paused: boolean) {
    await this.annotations.setSubscriptionPaused(this.requireUser(), id, paused);
    this.changes.emit();
  }

  // ── Recurring expenses the user adds ──────────────────────────────────────

  async formOptions(editingId?: string): Promise<RecurringFormOptions> {
    let editing: RecurringExpense | undefined;
    if (editingId !== undefined) {
      editing = (await this.find(editingId)).expense;
      if (!editing) throw new AppException('Only bills and subscriptions you added can be edited.');
    }
    return { categories: SPENDING_CATEGORIES, frequencies: CHOOSABLE_FREQUENCIES, kinds: RECURRING_KINDS, editing };
  }

  async saveRecurring(input: RecurringInput) {
    const userId = this.requireUser();
    let storedId: string | undefined;
    if (input.editingId !== undefined) {
      if (!input.editingId.startsWith(MANUAL_PREFIX)) throw new AppException('Only bills and subscriptions you added can be edited.');
      storedId = input.editingId.slice(MANUAL_PREFIX.length);
    }
    const parsed = Validators.money(input.amount, { what: 'amount', min: 0.01, max: 100_000 });
    const name = input.name.trim();
    const errors = compactErrors({
      name: !name ? 'Enter a name' : name.length > MAX_NAME ? `Keep the name under ${MAX_NAME} characters` : undefined,
      amount: parsed.error,
      frequency: input.frequency && CHOOSABLE_FREQUENCIES.some((f) => f.code === input.frequency!.code) ? undefined : "Choose how often it's paid",
      firstDue: input.firstDue ? undefined : 'Choose the date of the next payment',
      category: input.categoryId && SPENDING_CATEGORIES.some((c) => c.id === input.categoryId) ? undefined : 'Choose a category',
      kind: input.kind ? undefined : 'Choose bill or subscription',
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);
    await this.expenses.save(userId, {
      id: storedId ?? '',
      name,
      amount: parsed.value!,
      frequency: input.frequency!,
      firstDue: dateOnly(input.firstDue!),
      categoryId: input.categoryId!,
      kind: input.kind!,
    });
    this.changes.emit();
  }

  async deleteRecurring(id: string) {
    const userId = this.requireUser();
    if (!id.startsWith(MANUAL_PREFIX)) throw new AppException('Bills your bank detected can be paused, not deleted.');
    await this.expenses.delete(userId, id.slice(MANUAL_PREFIX.length));
    await this.annotations.setSubscriptionPaused(userId, id, false);
    this.changes.emit();
  }
}
