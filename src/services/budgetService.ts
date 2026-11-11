import { AppException, FieldValidationException } from '../models/appException';
import type {
  BudgetCategory,
  BudgetCategoryDetailData,
  BudgetOverview,
  BudgetPeriod,
  BudgetSetting,
  BudgetStatus,
} from '../models/budget';
import { formatMoney } from '../models/money';
import type { CategoryInfo } from '../models/transaction';
import { Emitter, type Subscribable } from '../utils/events';
import type { BudgetRepository } from '../repositories/budgetRepository';
import { categoryById, primaryCategory, SPENDING_CATEGORIES } from './bankCategories';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import { addDays, daysBetween, isBefore, isoMonth } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { spendingIn } from './spendingService';
import { transactionItem } from './transactionService';
import { compactErrors, Validators } from './validators';

/**
 * BUSINESS RULES: a budget's limit carries over to every month, while the spending measured
 * against it is each month's own. Also: which period is current, spent/limit, status thresholds,
 * the pace projection text, and which budgets a user can create.
 *
 * A `periodId` is a BudgetPeriod.id ('2026-10'); an empty one means the current month.
 */
export interface BudgetService {
  getPeriods(): Promise<BudgetPeriod[]>;
  getOverview(periodId: string): Promise<BudgetOverview>;
  getCategoryDetail(categoryId: string, periodId: string): Promise<BudgetCategoryDetailData>;
  /** The signed-in user's budgets. */
  budgets(): Promise<BudgetSetting[]>;
  /** Spending categories without a budget yet, plus [editingCategoryId] if given. */
  availableCategories(editingCategoryId?: string): Promise<CategoryInfo[]>;
  /**
   * What the budget form needs: the categories it can use and, when editing [categoryId]'s budget,
   * that budget (undefined if it no longer exists).
   */
  formOptions(categoryId?: string): Promise<{ categories: CategoryInfo[]; existing?: BudgetSetting }>;
  /** [limit] as typed ("400", "$1,250.50"). Throws FieldValidationException ('category' / 'limit'). */
  createBudget(categoryId: string | undefined, limit: string): Promise<void>;
  /** Changes the limit, and optionally the category. Throws FieldValidationException ('category' / 'limit'). */
  updateBudget(categoryId: string, limit: string, newCategoryId?: string): Promise<void>;
  deleteBudget(categoryId: string): Promise<void>;
  hasBudget(categoryId: string): Promise<boolean>;
  /** Emits after every create / update / delete. */
  readonly changes: Subscribable;
}

const NEAR_LIMIT = 0.8;
const PERIOD_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * Parses what the user typed ("400", "$1,250.50"): an amount with at most 2 decimals, between $1
 * and $1,000,000.
 */
export function parseLimit(text: string): { value?: number; error?: string } {
  const r = Validators.money(text, { what: 'limit', min: 1, max: 1_000_000 });
  return r.error === 'Enter a limit' ? { error: 'Enter a monthly limit' } : r;
}

/** "2026-10" -> [Oct 1, Nov 1). */
function bounds(periodId: string): [Date, Date] {
  const m = PERIOD_PATTERN.exec(periodId)!;
  const start = new Date(Number(m[1]), Number(m[2]) - 1, 1);
  return [start, new Date(start.getFullYear(), start.getMonth() + 1, 1)];
}

/**
 * [BudgetService]: the user's own monthly limits per category (via [BudgetRepository]), with
 * "spent" from the linked banks' transactions in Plaid (sandbox).
 * BUSINESS RULES: periods are calendar months (this month + the two before); a budget's limit
 * applies to every month, while "spent" only counts that month's transactions; status thresholds
 * (over = above the limit, near = 80%+ used or on pace to go over); the pace projection; one
 * budget per spending category, with a limit between $1 and $1,000,000.
 */
export class PlaidBudgetService extends BankDataService implements BudgetService {
  readonly changes = new Emitter();
  private readonly store: BudgetRepository;

  constructor(deps: BankServiceDeps & { budgets: BudgetRepository }) {
    super(deps);
    this.store = deps.budgets;
  }

  /** The signed-in user's limits by category id (the same for every month; empty when signed out). */
  private async limits(): Promise<Map<string, number>> {
    const userId = this.currentUserId();
    return userId === undefined ? new Map() : this.store.limitsFor(userId);
  }

  async getPeriods(): Promise<BudgetPeriod[]> {
    const now = this.currentTime();
    return [0, 1, 2].map((i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { id: isoMonth(month), label: DateLabels.monthName(month.getMonth() + 1), isCurrent: i === 0 };
    });
  }

  async getOverview(periodId: string): Promise<BudgetOverview> {
    const [start, end] = bounds(this.resolve(periodId));
    const spentBy = await this.spentByCategory(start, end);
    const categories: BudgetCategory[] = [...(await this.limits()).entries()]
      .map(([id, limit]) => {
        const spent = spentBy.get(id) ?? 0;
        const c = categoryById(id);
        return { id, name: c.name, iconKey: c.iconKey, spent, limit, status: this.status(spent, limit, start, end) };
      })
      .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
    const spent = categories.reduce((s, c) => s + c.spent, 0);
    const limit = categories.reduce((s, c) => s + c.limit, 0);
    const status = this.status(spent, limit, start, end);
    const pct = limit <= 0 ? 0 : Math.round((spent / limit) * 100);
    return {
      summary: {
        periodLabel: DateLabels.monthName(start.getMonth() + 1),
        spent,
        limit,
        status,
        statusLabel: categories.length ? `${status === 'over' ? 'Over budget' : 'Under budget'} · ${pct}% used` : 'No budgets yet',
      },
      categories,
    };
  }

  async getCategoryDetail(categoryId: string, periodId: string): Promise<BudgetCategoryDetailData> {
    const [start, end] = bounds(this.resolve(periodId));
    const category = categoryById(categoryId);
    const limit = (await this.limits()).get(category.id) ?? 0;
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const txs = spendingIn(snap, overrides, start, end).filter((t) => primaryCategory(t, overrides).id === category.id);
    const spent = txs.reduce((s, t) => s + t.amount, 0);
    const pace = this.pace(spent, limit, start, end);
    return {
      name: category.name,
      periodLabel: `Spent in ${DateLabels.monthName(start.getMonth() + 1)}`,
      spent,
      limit,
      status: this.status(spent, limit, start, end),
      paceHeadline: pace?.[0],
      paceBody: pace?.[1],
      recent: txs.slice(0, 5).map((t) => transactionItem(t, snap, overrides)),
    };
  }

  // ── Managing budgets ──────────────────────────────────────────────────────

  async budgets(): Promise<BudgetSetting[]> {
    return [...(await this.limits()).entries()].map(([id, monthlyLimit]) => ({
      categoryId: id,
      name: categoryById(id).name,
      iconKey: categoryById(id).iconKey,
      monthlyLimit,
    }));
  }

  async availableCategories(editingCategoryId?: string): Promise<CategoryInfo[]> {
    const taken = new Set((await this.limits()).keys());
    if (editingCategoryId !== undefined) taken.delete(editingCategoryId);
    return SPENDING_CATEGORIES.filter((c) => !taken.has(c.id));
  }

  async formOptions(categoryId?: string) {
    return {
      categories: await this.availableCategories(categoryId),
      existing: categoryId === undefined ? undefined : (await this.budgets()).find((b) => b.categoryId === categoryId),
    };
  }

  private categoryError(target: string | undefined, taken: boolean): string | undefined {
    if (!target) return 'Choose a category';
    if (taken) return 'This category already has a budget';
    if (!SPENDING_CATEGORIES.some((c) => c.id === target)) return 'Budgets can only be set for spending categories';
    return undefined;
  }

  async createBudget(categoryId: string | undefined, limit: string) {
    const userId = this.requireUser();
    const current = await this.limits();
    const amount = parseLimit(limit);
    const errors = compactErrors({
      category: this.categoryError(categoryId, !!categoryId && current.has(categoryId)),
      limit: amount.error,
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);
    await this.store.save(userId, categoryId!, amount.value!);
    this.changes.emit();
  }

  async updateBudget(categoryId: string, limit: string, newCategoryId?: string) {
    const userId = this.requireUser();
    const current = await this.limits();
    if (!current.has(categoryId)) throw new AppException('That budget no longer exists.');
    const target = newCategoryId ?? categoryId;
    const amount = parseLimit(limit);
    const errors = compactErrors({
      category: this.categoryError(target, target !== categoryId && current.has(target)),
      limit: amount.error,
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);
    await this.store.replace(userId, categoryId, target, amount.value!);
    this.changes.emit();
  }

  async deleteBudget(categoryId: string) {
    await this.store.delete(this.requireUser(), categoryId);
    this.changes.emit();
  }

  async hasBudget(categoryId: string) {
    return (await this.limits()).has(categoryId);
  }

  private requireUser(): string {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to manage your budgets.');
    return userId;
  }

  private async spentByCategory(start: Date, end: Date): Promise<Map<string, number>> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const out = new Map<string, number>();
    for (const t of spendingIn(snap, overrides, start, end)) {
      const id = primaryCategory(t, overrides).id;
      out.set(id, (out.get(id) ?? 0) + t.amount);
    }
    return out;
  }

  // ── Periods ───────────────────────────────────────────────────────────────

  /** '' -> this month's id; otherwise [periodId] itself, which must look like '2026-10'. */
  private resolve(periodId: string): string {
    if (!periodId) return isoMonth(this.currentTime());
    if (!PERIOD_PATTERN.test(periodId)) throw new AppException(`"${periodId}" is not a month.`);
    return periodId;
  }

  /** How far through [start, end) today is (1 for past months). */
  private elapsed(start: Date, end: Date): number {
    const now = this.currentTime();
    if (!isBefore(now, end)) return 1;
    return Math.min(1, Math.max(0, (daysBetween(start, now) + 1) / daysBetween(start, end)));
  }

  /** Over = above the limit; near = 80%+ used or on pace to go over. Shared with the dashboard. */
  status(spent: number, limit: number, start: Date, end: Date): BudgetStatus {
    if (limit <= 0) return 'onTrack';
    if (spent > limit) return 'over';
    const elapsed = this.elapsed(start, end);
    const projected = elapsed <= 0 ? spent : spent / elapsed;
    return spent >= limit * NEAR_LIMIT || projected > limit ? 'nearLimit' : 'onTrack';
  }

  /** Headline + body about the pace, for the current month only. */
  private pace(spent: number, limit: number, start: Date, end: Date): [string, string] | undefined {
    const now = this.currentTime();
    if (limit <= 0 || isBefore(now, start) || !isBefore(now, end)) return undefined;
    const days = daysBetween(start, end);
    const perDay = spent / now.getDate();
    const plannedPerDay = limit / days;
    const projected = perDay * days;
    const monthEnd = DateLabels.long(addDays(end, -1)).split(',')[0];
    if (projected > limit) {
      return [
        `You're spending ${formatMoney(perDay - plannedPerDay)} more per day than planned.`,
        `At this pace, you'll be ${formatMoney(projected - limit, 0)} over budget by ${monthEnd}.`,
      ];
    }
    return [
      "You're on pace to stay within budget.",
      `At this pace, you'll spend about ${formatMoney(projected, 0)} of ${formatMoney(limit, 0)} by ${monthEnd}.`,
    ];
  }
}
