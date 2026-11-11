import type { BankSnapshot, BankTransaction } from '../models/bankData';
import type { BarDatum, SpendingCategory, SpendingCategoryDetailData, SpendingData } from '../models/spending';
import { categoryById, type CategoryOverrides, isSpending, primaryCategory } from './bankCategories';
import { BankDataService } from './bankDataService';
import { addDays, dateOnly, daysBetween, isBefore } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { transactionItem } from './transactionService';

export interface SpendingService {
  /** [rangeIndex] indexes SpendingData.rangeLabels (Month / 3 months / Year). */
  getSpending(rangeIndex: number): Promise<SpendingData>;
  /** One category over the same period as getSpending with [rangeIndex]. */
  getCategoryDetail(categoryId: string, rangeIndex: number): Promise<SpendingCategoryDetailData>;
}

const RANGES = ['Month', '3 months', 'Year'];

/** Everyday spending transactions dated in [start, end), newest first. Shared with budgets & trends. */
export const spendingIn = (snap: BankSnapshot, overrides: CategoryOverrides, start: Date, end: Date) =>
  snap.transactions.filter((t) => isSpending(t, overrides) && !isBefore(t.date, start) && isBefore(t.date, end));

export const sumAmounts = (ts: BankTransaction[]) => ts.reduce((s, t) => s + t.amount, 0);

/** % change from [before] to [after]; undefined when there's nothing to compare with. */
export const percentChange = (before: number | undefined, after: number) =>
  before === undefined || before <= 0 ? undefined : ((after - before) / before) * 100;

/** Bars over [start, end): weeks for the Month range, months for the longer ranges. */
function bars(rangeIndex: number, txs: BankTransaction[], start: Date, end: Date): BarDatum[] {
  const out: BarDatum[] = [];
  const between = (a: Date, b: Date) => sumAmounts(txs.filter((t) => !isBefore(t.date, a) && isBefore(t.date, b)));
  if (rangeIndex === 0) {
    for (let week = start; isBefore(week, end); week = addDays(week, 7)) {
      out.push({ label: `${week.getDate()}`, value: between(week, addDays(week, 7)), semanticLabel: `Week of ${DateLabels.short(week)}` });
    }
  } else {
    for (let m = start; isBefore(m, end); m = new Date(m.getFullYear(), m.getMonth() + 1, 1)) {
      const next = new Date(m.getFullYear(), m.getMonth() + 1, 1);
      out.push({ label: DateLabels.monthAbbr(m.getMonth() + 1), value: between(m, next), semanticLabel: DateLabels.monthName(m.getMonth() + 1) });
    }
  }
  return out;
}

/** The latest bar with any spending, to highlight. */
function lastWithData(bs: BarDatum[]): number | undefined {
  for (let i = bs.length - 1; i >= 0; i--) if (bs[i].value > 0) return i;
  return undefined;
}

function totalsByCategory(txs: BankTransaction[], overrides: CategoryOverrides): Map<string, number> {
  const out = new Map<string, number>();
  for (const t of txs) {
    const id = primaryCategory(t, overrides).id;
    out.set(id, (out.get(id) ?? 0) + t.amount);
  }
  return out;
}

/**
 * [SpendingService] over the linked banks' transactions from Plaid (sandbox).
 * BUSINESS RULES: spending = everyday money out (see isSpending); periods are this month / last 3
 * months / this year, compared with the period of the same length just before. A transaction
 * counts toward its primary category only.
 */
export class PlaidSpendingService extends BankDataService implements SpendingService {
  /** [start, end) up to today, the start of the equally long period before it, and its title. */
  private period(rangeIndex: number) {
    const now = this.currentTime();
    const end = addDays(dateOnly(now), 1); // exclusive
    const start =
      rangeIndex === 1
        ? new Date(now.getFullYear(), now.getMonth() - 2, 1)
        : rangeIndex === 2
          ? new Date(now.getFullYear(), 0, 1)
          : new Date(now.getFullYear(), now.getMonth(), 1);
    const title =
      rangeIndex === 1
        ? `${DateLabels.monthAbbr(start.getMonth() + 1)}–${DateLabels.monthAbbr(now.getMonth() + 1)} spending`
        : rangeIndex === 2
          ? `${now.getFullYear()} spending`
          : `${DateLabels.monthName(now.getMonth() + 1)} spending`;
    return { start, end, previousStart: addDays(start, -daysBetween(start, end)), title };
  }

  async getSpending(rangeIndex: number): Promise<SpendingData> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const p = this.period(rangeIndex);

    const current = spendingIn(snap, overrides, p.start, p.end);
    const total = sumAmounts(current);
    const previousTotal = sumAmounts(spendingIn(snap, overrides, p.previousStart, p.start));
    const bs = bars(rangeIndex, current, p.start, p.end);

    const byCategory = totalsByCategory(current, overrides);
    const previousByCategory = totalsByCategory(spendingIn(snap, overrides, p.previousStart, p.start), overrides);
    const top = Math.max(0, ...byCategory.values());
    const categories: SpendingCategory[] = [...byCategory.entries()]
      .map(([id, amount]) => ({
        id,
        name: categoryById(id).name,
        iconKey: categoryById(id).iconKey,
        amount,
        share: top <= 0 ? 0 : amount / top,
        changePercent: percentChange(previousByCategory.get(id), amount),
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      rangeLabels: RANGES,
      selectedRange: Math.min(2, Math.max(0, rangeIndex)),
      periodTitle: p.title,
      total,
      changePercent: percentChange(previousTotal, total),
      bars: bs,
      highlightedBar: lastWithData(bs),
      categories,
    };
  }

  async getCategoryDetail(categoryId: string, rangeIndex: number): Promise<SpendingCategoryDetailData> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const p = this.period(rangeIndex);
    const category = categoryById(categoryId);
    const inCategory = (t: BankTransaction) => primaryCategory(t, overrides).id === category.id;

    const all = spendingIn(snap, overrides, p.start, p.end);
    const current = all.filter(inCategory);
    const amount = sumAmounts(current);
    const totalSpending = sumAmounts(all);
    const bs = bars(rangeIndex, current, p.start, p.end);

    return {
      id: category.id,
      name: category.name,
      iconKey: category.iconKey,
      periodTitle: p.title,
      amount,
      changePercent: percentChange(sumAmounts(spendingIn(snap, overrides, p.previousStart, p.start).filter(inCategory)), amount),
      shareOfTotal: totalSpending <= 0 ? 0 : amount / totalSpending,
      bars: bs,
      highlightedBar: lastWithData(bs),
      transactionCount: current.length,
      averageAmount: current.length ? amount / current.length : undefined,
      largestAmount: current.length ? Math.max(...current.map((t) => t.amount)) : undefined,
      transactions: current.map((t) => transactionItem(t, snap, overrides)),
    };
  }
}
