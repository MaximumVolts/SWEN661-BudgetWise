import { AppException, FieldValidationException } from '../models/appException';
import { type RecurringStream, streamName } from '../models/bankData';
import type { BreakdownLine, CashFlowData } from '../models/cashFlow';
import { formatMoney } from '../models/money';
import { frequencyFromCode } from '../models/recurring';
import { Emitter, type Subscribable } from '../utils/events';
import type { ExpectedIncomeRepository } from '../repositories/expectedIncomeRepository';
import { isSpending } from './bankCategories';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import { addDays, dateOnly, daysBetween, isAfter, isBefore } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { RecurringSchedule } from './recurringSchedule';
import { compactErrors, Validators } from './validators';

export interface CashFlowService {
  /** Range (30/60/90 days) and scenario (Low/Expected/High) are indices into the returned label lists. */
  getProjection(rangeIndex: number, scenarioIndex: number): Promise<CashFlowData>;
  /** [amount] as typed. Throws FieldValidationException ('name', 'amount', 'date'). */
  addExpectedIncome(input: { name: string; amount: string; date?: Date }): Promise<void>;
  /** Removes income the user added (a BreakdownLine.expectedIncomeId). */
  removeExpectedIncome(id: string): Promise<void>;
  /** The earliest date expected income can have (today: it can't be in the past). */
  earliestIncomeDate(): Date;
  /** Emits after expected income is added or removed. */
  readonly changes: Subscribable;
}

const RANGES: [string, number][] = [['30 days', 30], ['60 days', 60], ['90 days', 90]];
const SCENARIOS: [string, number][] = [['Low', 0.85], ['Expected', 1], ['High', 1.15]];
const MAX_NAME = 40;
const MAX_AMOUNT = 1_000_000;

const clampIndex = (i: number, length: number) => Math.min(length - 1, Math.max(0, i));

/** Predicted dates of [s] within [from, until]. */
function occurrences(s: RecurringStream, from: Date, until: Date): Date[] {
  let date = s.nextDate ?? undefined;
  if (!date) return [];
  const step = RecurringSchedule.periodDays(frequencyFromCode(s.frequency));
  while (isBefore(date, from)) date = addDays(date, step);
  const out: Date[] = [];
  while (!isAfter(date, until)) {
    out.push(date);
    date = addDays(date, step);
  }
  return out;
}

function niceStep(raw: number): number {
  let magnitude = 1;
  while (magnitude * 10 <= raw) magnitude *= 10;
  for (const m of [1, 2, 5, 10]) if (raw <= m * magnitude) return m * magnitude;
  return 10 * magnitude;
}

/** Three round gridline values spanning [values]. */
function grid(values: number[]): number[] {
  if (!values.length) return [];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = Math.abs(hi - lo) < 1 ? 1000 : hi - lo;
  const step = niceStep(span / 2);
  const base = Math.floor(lo / step) * step;
  return [base, base + step, base + 2 * step];
}

/**
 * [CashFlowService] projecting cash from the linked banks in Plaid (sandbox).
 * BUSINESS RULES: cash today = checking + savings balances; recurring income and bills are projected
 * on their predicted dates; everyday spending = the last 90 days' non-recurring average per day; the
 * income scenario scales the bank's recurring income (Low 85% / Expected / High 115%). One-off income
 * the user adds counts in full on its date, when that's within the range: a name of up to 40
 * characters, $0.01–$1,000,000, dated today to a year from now.
 */
export class PlaidCashFlowService extends BankDataService implements CashFlowService {
  readonly changes = new Emitter();
  private readonly incomes: ExpectedIncomeRepository;

  constructor(deps: BankServiceDeps & { incomes: ExpectedIncomeRepository }) {
    super(deps);
    this.incomes = deps.incomes;
  }

  private async added() {
    const userId = this.currentUserId();
    return userId === undefined ? [] : this.incomes.listFor(userId);
  }

  async addExpectedIncome(input: { name: string; amount: string; date?: Date }) {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to add expected income.');
    const name = input.name.trim();
    const parsed = Validators.money(input.amount, { what: 'amount', min: 0.01, max: MAX_AMOUNT });
    const today = this.currentDate();
    const day = input.date ? dateOnly(input.date) : undefined;
    const errors = compactErrors({
      name: !name ? 'Enter what the income is' : name.length > MAX_NAME ? `Keep the name under ${MAX_NAME} characters` : undefined,
      amount: parsed.error,
      date: !day
        ? 'Choose when you expect it'
        : isBefore(day, today)
          ? "Choose a date that isn't in the past"
          : isAfter(day, new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()))
            ? 'Choose a date within the next year'
            : undefined,
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);
    await this.incomes.add(userId, { id: '', name, amount: parsed.value!, date: day! });
    this.changes.emit();
  }

  earliestIncomeDate(): Date {
    return this.currentDate();
  }

  async removeExpectedIncome(id: string) {
    const userId = this.currentUserId();
    if (userId === undefined) return;
    await this.incomes.delete(userId, id);
    this.changes.emit();
  }

  async getProjection(rangeIndex: number, scenarioIndex: number): Promise<CashFlowData> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const r = clampIndex(rangeIndex, RANGES.length);
    const sc = clampIndex(scenarioIndex, SCENARIOS.length);
    const [, days] = RANGES[r];
    const [scenarioName, scenarioFactor] = SCENARIOS[sc];
    const today = this.currentDate();
    const end = addDays(today, days);

    const cashAccounts = snap.accounts.filter((a) => a.type === 'depository' && (a.subtype === 'checking' || a.subtype === 'savings'));
    const cashToday = cashAccounts.reduce((s, a) => s + (a.availableBalance ?? a.currentBalance ?? 0), 0);

    // Each projected recurring payment: day offset → signed amount.
    const events: { day: number; amount: number; name: string }[] = [];
    const paused = await this.pausedSubscriptions();
    for (const s of snap.recurring.filter((x) => x.isActive && !paused.has(x.streamId))) {
      for (const date of occurrences(s, today, end)) {
        events.push({ day: daysBetween(today, date), amount: s.isInflow ? s.averageAmount * scenarioFactor : -s.averageAmount, name: streamName(s) });
      }
    }
    const income = events.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
    const outgoing = events.filter((e) => e.amount < 0);
    const bills = -outgoing.reduce((s, e) => s + e.amount, 0);
    // Income the user added, within the range.
    const added = (await this.added()).filter((i) => !isBefore(i.date, today) && !isAfter(i.date, end));
    for (const i of added) events.push({ day: daysBetween(today, i.date), amount: i.amount, name: i.name });

    // Everyday spending: last 90 days, excluding transactions Plaid tied to recurring streams.
    const recurringTx = new Set(snap.recurring.flatMap((s) => s.transactionIds));
    const since = addDays(today, -90);
    const everyday = snap.transactions
      .filter((t) => !recurringTx.has(t.transactionId) && isSpending(t, overrides) && !isBefore(t.date, since))
      .reduce((s, t) => s + t.amount, 0);
    const perDay = everyday / 90;

    // Daily balance, sampled weekly for the chart (plus the last day).
    const balances: number[] = [];
    let balance = cashToday;
    for (let d = 0; d <= days; d++) {
      if (d > 0) balance -= perDay;
      for (const e of events) if (e.day === d) balance += e.amount;
      balances.push(balance);
    }
    const sampleDays: number[] = [];
    for (let d = 0; d <= days; d += 7) sampleDays.push(d);
    if (sampleDays[sampleDays.length - 1] !== days) sampleDays.push(days);
    const values = sampleDays.map((d) => balances[d]);
    let lowDay = 0;
    for (let d = 1; d <= days; d++) if (balances[d] < balances[lowDay]) lowDay = d;
    const lowSample = clampIndex(sampleDays.findIndex((d) => d >= lowDay), values.length);
    const lowCause = events.find((e) => e.day === lowDay && e.amount < 0)?.name;
    const projected = balances[balances.length - 1];

    const breakdown: BreakdownLine[] = [
      {
        title: 'Cash today',
        subtitle: cashAccounts.length ? cashAccounts.map((a) => a.name).join(', ') : 'No checking or savings linked',
        amount: cashToday,
        tone: 'neutral',
      },
      { title: 'Expected income', subtitle: `${scenarioName} · recurring deposits from your bank`, amount: income, tone: 'positive' },
      ...added.map(
        (i): BreakdownLine => ({
          title: i.name,
          subtitle: `Expected ${DateLabels.short(i.date)} · added by you`,
          amount: i.amount,
          tone: 'positive',
          expectedIncomeId: i.id,
        }),
      ),
      { title: 'Bills & recurring', subtitle: `${outgoing.length} payments in the next ${days} days`, amount: bills, tone: 'negative' },
      { title: 'Everyday spending', subtitle: `Your 90-day average (${formatMoney(perDay)} a day)`, amount: perDay * days, tone: 'negative' },
    ];

    return {
      rangeLabels: RANGES.map(([label]) => label),
      selectedRange: r,
      scenarioLabels: SCENARIOS.map(([label]) => label),
      selectedScenario: sc,
      projectedDateLabel: `Projected cash on ${DateLabels.short(end)}`,
      projectedAmount: projected,
      lowestAmount: balances[lowDay],
      lowestDescription: `around ${DateLabels.short(addDays(today, lowDay))}${lowCause ? `, after ${lowCause}` : ''}`,
      chartTitle: `Cash over the next ${days} days`,
      chart: {
        values,
        xLabels: [0, 1, 2, 3, 4].map((i) => DateLabels.short(addDays(today, Math.round((days * i) / 4)))),
        gridValues: grid(values),
        lowIndex: lowSample,
        lowLabel: `Low ${formatMoney(balances[lowDay], 0)}`,
        endLabel: formatMoney(projected, 0),
      },
      breakdown,
    };
  }
}
