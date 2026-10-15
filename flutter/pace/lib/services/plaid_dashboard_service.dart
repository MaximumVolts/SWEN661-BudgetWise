import '../models/budget.dart' show BudgetCategory, BudgetStatus;
import 'bank_data_service.dart' show AnnotatedBankDataService;
import '../models/dashboard.dart'
    show AccountTone, DashboardAccount, DashboardData, ReviewBanner, SpendChartData, SpendSummary, ToolLink;
import '../models/trend.dart' show TrendDirection;
import 'calendar.dart' show Calendar;
import 'dashboard_service.dart' show DashboardService;
import 'date_labels.dart' show DateLabels;
import '../models/money.dart' show Money;
import 'bill_service.dart' show BillService;
import 'budget_service.dart' show BudgetService;
import 'cash_flow_service.dart' show CashFlowService;
import 'plaid_spending_service.dart' show PlaidSpendingService;
import 'plaid_transaction_service.dart' show PlaidTransactionService;
import 'trend_service.dart' show TrendService;

/// [DashboardService] for Home, built from the linked banks' data in Plaid (sandbox).
/// BUSINESS RULES: this month's spending vs the same days last month, account summary tiles,
/// what's featured (recent transactions, budgets most used, next bills, the biggest rising trend).
class PlaidDashboardService extends AnnotatedBankDataService implements DashboardService {
  final BudgetService _budgets;
  final BillService _bills;
  final TrendService _trends;
  final CashFlowService _cashFlow;

  PlaidDashboardService(
    super.bankData,
    super.annotations, {
    required BudgetService budgets,
    required BillService bills,
    required TrendService trends,
    required CashFlowService cashFlow,
    super.now,
  })  : _budgets = budgets,
        _bills = bills,
        _trends = trends,
        _cashFlow = cashFlow;

  /// Pulls fresh data from the linked banks.
  @override
  Future<void> sync() async => bankData.load(refresh: true);

  @override
  Future<DashboardData> load() async {
    final snap = await bankData.load();
    final overrides = await annotations.categoryOverrides();
    final now = currentTime();
    final today = Calendar.dateOnly(now);
    final monthStart = DateTime(now.year, now.month, 1);
    final lastStart = DateTime(now.year, now.month - 1, 1);
    final daysInMonth = DateTime(now.year, now.month + 1, 0).day;
    final lastDays = DateTime(now.year, now.month, 0).day;

    // Cumulative spending by day: this month so far and all of last month.
    List<double> cumulative(DateTime start, int days) {
      final out = <double>[];
      var total = 0.0;
      for (var d = 0; d < days; d++) {
        final day = Calendar.addDays(start, d);
        total += PlaidSpendingService.spending(snap, overrides, day, Calendar.addDays(day, 1))
            .fold(0.0, (s, t) => s + t.amount);
        out.add(total);
      }
      return out;
    }

    final actual = cumulative(monthStart, today.day);
    final previous = cumulative(lastStart, lastDays);
    final spent = actual.isEmpty ? 0.0 : actual.last;
    final previousSoFar = previous.isEmpty ? 0.0 : previous[(today.day - 1).clamp(0, previous.length - 1)];
    final perDay = today.day == 0 ? 0.0 : spent / today.day;
    final projected = [for (var d = today.day + 1; d <= daysInMonth; d++) perDay * d];

    // Account tiles.
    double sum(bool Function(String type, String? subtype) test, {bool available = false}) => snap.accounts
        .where((a) => test(a.type, a.subtype))
        .fold(0.0, (s, a) => s + ((available ? a.availableBalance : null) ?? a.currentBalance ?? 0));
    final checking = sum((t, s) => t == 'depository' && s == 'checking');
    final checkingAvailable = sum((t, s) => t == 'depository' && s == 'checking', available: true);
    final savings = sum((t, s) => t == 'depository' && s != 'checking');
    final cards = sum((t, _) => t == 'credit');
    final upcoming = await _bills.upcomingWithDates();
    final dueThisMonth = upcoming
        .where((u) => u.due.isBefore(DateTime(now.year, now.month + 1, 1)))
        .fold(0.0, (s, u) => s + u.bill.amount);

    final overview = await _budgets.getOverview('${now.year}-${now.month.toString().padLeft(2, '0')}');
    final usedBudgets = [for (final c in overview.categories) if (c.spent > 0) c];
    final trends = await _trends.getTrends();
    final rising = trends.trends.where((t) => t.direction == TrendDirection.rising).firstOrNull;
    final recurring = await _bills.getRecurring();
    final projection = await _cashFlow.getProjection(rangeIndex: 0, scenarioIndex: 1);
    final weekAgo = Calendar.addDays(today, -7);
    final newThisWeek = snap.transactions.where((t) => !t.date.isBefore(weekAgo)).length;
    final payday = snap.recurring
        .where((s) => s.isInflow && s.isActive && s.nextDate != null && !s.nextDate!.isBefore(today))
        .map((s) => s.nextDate!)
        .fold<DateTime?>(null, (a, b) => a == null || b.isBefore(a) ? b : a);

    return DashboardData(
      dateLabel: DateLabels.weekdayShort(now),
      hasUnreadNotifications: upcoming.any((u) => u.bill.isOverdue) || overview.categories.any((c) => c.status == BudgetStatus.over),
      reviewBanner: newThisWeek == 0
          ? null
          : ReviewBanner(title: 'Review transactions', subtitle: "$newThisWeek new this week · See where your money's going"),
      spend: SpendSummary(
        title: 'Spent this month',
        amount: spent,
        deltaAmount: (spent - previousSoFar).abs(),
        deltaIsAbove: spent >= previousSoFar,
        deltaPeriodLabel: '${DateLabels.monthAbbr(lastStart.month)} 1–${today.day.clamp(1, lastDays)}',
        currentLegend: DateLabels.monthName(now.month),
        previousLegend: DateLabels.monthName(lastStart.month),
        chart: SpendChartData(actual: actual, projected: projected, previous: previous),
      ),
      paydayLabel: payday == null
          ? null
          : (Calendar.daysBetween(today, payday) == 0 ? 'Deposit expected today' : 'Next deposit in ${Calendar.daysBetween(today, payday)} days'),
      accounts: !snap.isLinked
          ? const []
          : [
              DashboardAccount(id: 'checking', name: 'Checking', iconKey: 'person', balance: checking),
              DashboardAccount(
                id: 'cards',
                name: 'Card balance',
                iconKey: 'card',
                balance: cards,
                subtitle: cards > 0 ? 'Owed on credit cards' : null,
                tone: cards > checking ? AccountTone.alert : AccountTone.neutral,
              ),
              DashboardAccount(
                id: 'available',
                name: 'Available balance',
                iconKey: 'wallet',
                balance: checkingAvailable - dueThisMonth,
                subtitle: 'After bills due this month',
                hasInfo: true,
              ),
              DashboardAccount(id: 'savings', name: 'Savings', iconKey: 'wallet', balance: savings, tone: AccountTone.accent),
            ],
      lastSyncLabel: snap.isLinked ? DateLabels.ago(snap.fetchedAt, now) : null,
      recentTransactions: [for (final t in snap.transactions.take(4)) PlaidTransactionService.itemFor(t, snap, overrides)],
      budget: snap.isLinked ? overview.summary : null,
      budgetCategories: <BudgetCategory>[...usedBudgets.take(2)],
      upcomingBills: [for (final u in upcoming.take(3)) u.bill],
      featuredTrend: rising,
      featuredTrendSource: rising == null ? null : 'From your ${rising.title.split(' spending').first} transactions',
      tools: [
        ToolLink(
          id: 'recurring',
          iconKey: 'subscriptions',
          title: 'Recurring & Subscriptions',
          subtitle: recurring.items.isEmpty
              ? 'No recurring payments found'
              : '${Money.format(recurring.yearlyTotal, decimals: 0)} a year in recurring payments',
        ),
        const ToolLink(
          id: 'savings-goals',
          iconKey: 'wallet',
          title: 'Savings Goals',
          subtitle: 'Track what you’re saving for',
          accent: true,
        ),
        ToolLink(
          id: 'cash-flow',
          iconKey: 'chart',
          title: 'Cash Flow Projection',
          subtitle: '${Money.format(projection.projectedAmount)} projected by ${projection.projectedDateLabel.split(' on ').last}',
        ),
      ],
    );
  }
}
