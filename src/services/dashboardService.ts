import { isLinked } from '../models/bankData';
import type { DashboardAccount, DashboardData } from '../models/dashboard';
import { formatMoney } from '../models/money';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import type { BillService } from './billService';
import type { BudgetService } from './budgetService';
import { addDays, daysBetween, isBefore, isoMonth } from '../utils/calendar';
import type { CashFlowService } from './cashFlowService';
import { DateLabels } from '../utils/dateLabels';
import { spendingIn, sumAmounts } from './spendingService';
import { transactionItem } from './transactionService';
import type { TrendService } from './trendService';

/**
 * BUSINESS RULES: everything on Home is derived here: this month's spending vs the same days last
 * month, the projection, payday estimate, which trend is featured, which bills are "upcoming".
 */
export interface DashboardService {
  load(): Promise<DashboardData>;
  /** Pulls fresh data from linked institutions. */
  sync(): Promise<void>;
}

/**
 * [DashboardService] for Home, built from the linked banks' data in Plaid (sandbox).
 * BUSINESS RULES: this month's spending vs the same days last month, account summary tiles, what's
 * featured (recent transactions, budgets most used, next bills, the biggest rising trend).
 */
export class PlaidDashboardService extends BankDataService implements DashboardService {
  private readonly budgets: BudgetService;
  private readonly bills: BillService;
  private readonly trends: TrendService;
  private readonly cashFlow: CashFlowService;

  constructor(
    deps: BankServiceDeps & { budgets: BudgetService; bills: BillService; trends: TrendService; cashFlow: CashFlowService },
  ) {
    super(deps);
    this.budgets = deps.budgets;
    this.bills = deps.bills;
    this.trends = deps.trends;
    this.cashFlow = deps.cashFlow;
  }

  async sync() {
    await this.bankData.load({ refresh: true });
  }

  async load(): Promise<DashboardData> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    const now = this.currentTime();
    const today = this.currentDate();
    const y = now.getFullYear();
    const m = now.getMonth();
    const dayOfMonth = today.getDate();
    const monthStart = new Date(y, m, 1);
    const lastStart = new Date(y, m - 1, 1);
    const nextMonth = new Date(y, m + 1, 1);
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const lastDays = new Date(y, m, 0).getDate();

    // Cumulative spending by day: this month so far and all of last month.
    const cumulative = (start: Date, days: number) => {
      const out: number[] = [];
      let total = 0;
      for (let d = 0; d < days; d++) {
        const day = addDays(start, d);
        total += sumAmounts(spendingIn(snap, overrides, day, addDays(day, 1)));
        out.push(total);
      }
      return out;
    };
    const actual = cumulative(monthStart, dayOfMonth);
    const previous = cumulative(lastStart, lastDays);
    const spent = actual.length ? actual[actual.length - 1] : 0;
    const previousSoFar = previous.length ? previous[Math.min(previous.length - 1, Math.max(0, dayOfMonth - 1))] : 0;
    const perDay = spent / dayOfMonth;
    const projected: number[] = [];
    for (let d = dayOfMonth + 1; d <= daysInMonth; d++) projected.push(perDay * d);

    // Account tiles.
    const sum = (test: (type: string, subtype?: string | null) => boolean, available = false) =>
      snap.accounts
        .filter((a) => test(a.type, a.subtype))
        .reduce((s, a) => s + ((available ? a.availableBalance : undefined) ?? a.currentBalance ?? 0), 0);
    const isChecking = (t: string, s?: string | null) => t === 'depository' && s === 'checking';
    const checking = sum(isChecking);
    const checkingAvailable = sum(isChecking, true);
    const savings = sum((t, s) => t === 'depository' && s !== 'checking');
    const cards = sum((t) => t === 'credit');
    const upcoming = await this.bills.upcomingWithDates();
    const dueThisMonth = upcoming.filter((u) => isBefore(u.due, nextMonth)).reduce((s, u) => s + u.bill.amount, 0);

    const overview = await this.budgets.getOverview(isoMonth(now));
    const trends = await this.trends.getTrends();
    const rising = trends.trends.find((t) => t.direction === 'rising');
    const recurring = await this.bills.getRecurring();
    const projection = await this.cashFlow.getProjection(0, 1);
    const weekAgo = addDays(today, -7);
    const newThisWeek = snap.transactions.filter((t) => !isBefore(t.date, weekAgo)).length;
    const payday = snap.recurring
      .filter((s) => s.isInflow && s.isActive && s.nextDate && !isBefore(s.nextDate, today))
      .map((s) => s.nextDate!)
      .reduce<Date | undefined>((a, b) => (!a || isBefore(b, a) ? b : a), undefined);
    const paydayIn = payday ? daysBetween(today, payday) : undefined;

    const accounts: DashboardAccount[] = !isLinked(snap)
      ? []
      : [
          { id: 'checking', name: 'Checking', iconKey: 'person', balance: checking, tone: 'neutral', hasInfo: false },
          {
            id: 'cards',
            name: 'Card balance',
            iconKey: 'card',
            balance: cards,
            subtitle: cards > 0 ? 'Owed on credit cards' : undefined,
            tone: cards > checking ? 'alert' : 'neutral',
            hasInfo: false,
          },
          {
            id: 'available',
            name: 'Available balance',
            iconKey: 'wallet',
            balance: checkingAvailable - dueThisMonth,
            subtitle: 'After bills due this month',
            tone: 'neutral',
            hasInfo: true,
          },
          { id: 'savings', name: 'Savings', iconKey: 'wallet', balance: savings, tone: 'accent', hasInfo: false },
        ];

    return {
      dateLabel: DateLabels.weekdayShort(now),
      hasUnreadNotifications: upcoming.some((u) => u.bill.isOverdue) || overview.categories.some((c) => c.status === 'over'),
      reviewBanner: newThisWeek ? { title: 'Review transactions', subtitle: `${newThisWeek} new this week · See where your money's going` } : undefined,
      spend: {
        title: 'Spent this month',
        amount: spent,
        deltaAmount: Math.abs(spent - previousSoFar),
        deltaIsAbove: spent >= previousSoFar,
        deltaPeriodLabel: `${DateLabels.monthAbbr(lastStart.getMonth() + 1)} 1–${Math.min(lastDays, Math.max(1, dayOfMonth))}`,
        currentLegend: DateLabels.monthName(m + 1),
        previousLegend: DateLabels.monthName(lastStart.getMonth() + 1),
        chart: { actual, projected, previous },
      },
      paydayLabel: paydayIn === undefined ? undefined : paydayIn === 0 ? 'Deposit expected today' : `Next deposit in ${paydayIn} days`,
      accounts,
      lastSyncLabel: isLinked(snap) ? DateLabels.ago(snap.fetchedAt, now) : undefined,
      recentTransactions: snap.transactions.slice(0, 4).map((t) => transactionItem(t, snap, overrides)),
      budget: isLinked(snap) ? overview.summary : undefined,
      budgetCategories: overview.categories.filter((c) => c.spent > 0).slice(0, 2),
      upcomingBills: upcoming.slice(0, 3).map((u) => u.bill),
      featuredTrend: rising,
      featuredTrendSource: rising ? `From your ${rising.title.split(' spending')[0]} transactions` : undefined,
      tools: [
        {
          id: 'recurring',
          iconKey: 'subscriptions',
          title: 'Recurring & Subscriptions',
          subtitle: recurring.items.length
            ? `${formatMoney(recurring.yearlyTotal, 0)} a year in recurring payments`
            : 'No recurring payments found',
        },
        { id: 'savings-goals', iconKey: 'wallet', title: 'Savings Goals', subtitle: 'Track what you’re saving for', accent: true },
        {
          id: 'cash-flow',
          iconKey: 'chart',
          title: 'Cash Flow Projection',
          subtitle: `${formatMoney(projection.projectedAmount)} projected by ${projection.projectedDateLabel.split(' on ').pop()}`,
        },
      ],
    };
  }
}
