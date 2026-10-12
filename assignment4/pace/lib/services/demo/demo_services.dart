// DEV ONLY – in-memory demo services so the whole navigation graph can be clicked through
// before real services exist. Nothing in lib/ imports this file except main.dart.
// Delete lib/services/demo/ (and the import in main.dart) once your real services are in place.
import '../app_services.dart' show AppServices;
import '../../models/account.dart' show AccountGroup, AccountsData, LinkedAccount, ReconnectBanner;
import '../../models/bill.dart'
    show BillItem, BillSection, BillsUpcomingData, RecurringData, RecurringItem, SubscriptionStatus;
import '../../models/budget.dart'
    show BudgetCategory, BudgetCategoryDetailData, BudgetOverview, BudgetPeriod, BudgetStatus, BudgetSummary;
import '../../models/cash_flow.dart' show AmountTone, BreakdownLine, CashFlowChartData, CashFlowData;
import '../../models/dashboard.dart'
    show AccountTone, DashboardAccount, DashboardData, ReviewBanner, SpendChartData, SpendSummary, ToolLink;
import '../../models/navigation.dart' show DeepLinkTarget, FlowStep, LinkOutcome, TargetKind;
import '../../models/notification.dart' show NotificationItem, NotificationKind, NotificationsData, SyncStatus;
import '../../models/onboarding.dart' show IncomeOption, OnboardingOptions, PriorityOption;
import '../../models/settings.dart' show SettingsData;
import '../../models/spending.dart' show BarDatum, SpendingCategory, SpendingData;
import '../../models/transaction.dart'
    show CategoryInfo, FilterChoice, FilterKind, TransactionDetailBundle, TransactionDetailData, TransactionGroup,
        TransactionItem, TransactionQuery;
import '../../models/trend.dart' show TrendDirection, TrendItem, TrendsData;
import '../account_service.dart' show AccountService;
import '../bank_link_service.dart' show BankLinkService;
import '../bill_service.dart' show BillService;
import '../budget_service.dart' show BudgetService;
import '../cash_flow_service.dart' show CashFlowService;
import '../dashboard_service.dart' show DashboardService;
import '../google_account_service.dart' show GoogleAccountService;
import '../google_sign_in_account_service.dart' show GoogleSignInAccountService;
import '../../repositories/goal_repository.dart' show InMemoryGoalRepository;
import '../../repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import '../notification_service.dart' show NotificationService;
import '../onboarding_service.dart' show OnboardingService;
import '../repository_auth_service.dart' show RepositoryAuthService;
import '../repository_goal_service.dart' show RepositoryGoalService;
import '../settings_service.dart' show SettingsService;
import '../spending_service.dart' show SpendingService;
import '../transaction_service.dart' show TransactionService;
import '../trend_service.dart' show TrendService;

Future<void> _latency() => Future<void>.delayed(const Duration(milliseconds: 150));

/// [google] defaults to the real Google Sign-In plugin; tests pass a fake.
AppServices demoServices({GoogleAccountService? google}) {
  final session = _Session();
  return AppServices(
    // Real service over an in-memory repository: swap InMemoryUserAccountRepository for your storage.
    auth: RepositoryAuthService(accounts: InMemoryUserAccountRepository(), google: google ?? GoogleSignInAccountService()),
    onboarding: _DemoOnboarding(session),
    bankLink: _DemoBankLink(session),
    accounts: _DemoAccounts(),
    dashboard: _DemoDashboard(),
    transactions: _DemoTransactions(),
    budgets: _DemoBudgets(),
    spending: _DemoSpending(),
    bills: _DemoBills(),
    // Real service over an empty repository: swap InMemoryGoalRepository for your storage.
    goals: RepositoryGoalService(InMemoryGoalRepository()),
    notifications: _DemoNotifications(),
    settings: _DemoSettings(),
    cashFlow: _DemoCashFlow(),
    trends: _DemoTrends(),
  );
}

/// Onboarding / bank-link progress shared by the demo onboarding and bank-link services.
class _Session {
  bool onboarded = false;
  bool linked = false;
  FlowStep get next => !onboarded ? FlowStep.onboarding : (!linked ? FlowStep.connectBank : FlowStep.home);
}

class _DemoOnboarding implements OnboardingService {
  final _Session s;
  _DemoOnboarding(this.s);
  @override
  Future<OnboardingOptions> loadOptions() async => const OnboardingOptions(
        priorities: [
          PriorityOption(id: 'spend', label: 'See where my money goes'),
          PriorityOption(id: 'bills', label: 'Stay on top of bills'),
          PriorityOption(id: 'budget', label: 'Stick to a budget'),
          PriorityOption(id: 'subs', label: 'Track subscriptions'),
          PriorityOption(id: 'goal', label: 'Save for a goal'),
        ],
        incomeOptions: [
          IncomeOption(id: 'steady', title: 'Steady paycheck', subtitle: 'Same amount on a regular schedule'),
          IncomeOption(id: 'variable', title: 'Changes month to month', subtitle: 'Freelance, tips or variable pay'),
        ],
      );
  @override
  Future<FlowStep> savePreferences({required Set<String> priorityIds, required String? incomeId}) async {
    s.onboarded = true;
    return s.next;
  }
}

class _DemoBankLink implements BankLinkService {
  final _Session s;
  _DemoBankLink(this.s);
  @override
  Future<LinkOutcome> startLink() async {
    await _latency();
    s.linked = true;
    return const LinkOutcome(linked: true, next: FlowStep.home);
  }

  @override
  Future<FlowStep> skipLinking() async => FlowStep.home;
}

class _DemoAccounts implements AccountService {
  bool _expired = true;
  @override
  Future<AccountsData> getAccounts() async {
    await _latency();
    return AccountsData(
      banner: _expired
          ? const ReconnectBanner(title: 'Reconnect Tartan Bank', message: 'Your connection has expired. Reconnect to keep your balances up to date.')
          : null,
      groups: const [
        AccountGroup(title: 'Checking & savings', institution: 'Tartan Bank', accounts: [
          LinkedAccount(id: 'chk', name: 'Everyday Checking', subtitle: 'Checking •0000', balance: 3248.60, iconKey: 'bank', syncLabel: 'Connected · synced 5 min ago'),
          LinkedAccount(id: 'sav', name: 'Rainy Day Savings', subtitle: 'Savings •1111', balance: 6120.00, iconKey: 'savings', syncLabel: 'Connected · synced 5 min ago'),
        ]),
      ],
    );
  }

  @override
  Future<void> reconnect() async => _expired = false;
  @override
  Future<void> dismissReconnectBanner() async => _expired = false;
}

class _DemoDashboard implements DashboardService {
  @override
  Future<void> sync() async => _latency();

  @override
  Future<DashboardData> load() async {
    await _latency();
    return const DashboardData(
      dateLabel: 'Sun, Oct 18',
      hasUnreadNotifications: true,
      reviewBanner: ReviewBanner(title: 'Review transactions', subtitle: "7 new since Friday · See where your money's going"),
      spend: SpendSummary(
        title: 'Cannot spend this month',
        amount: 2462,
        deltaAmount: 143.46,
        deltaIsAbove: true,
        deltaPeriodLabel: 'Sep 1–18',
        currentLegend: 'October',
        previousLegend: 'September',
        chart: SpendChartData(
          actual: [60, 120, 150, 560, 880, 1000, 1500, 2462],
          projected: [2700, 2600, 3000],
          previous: [100, 300, 500, 900, 1300, 1700, 2100, 2318, 2500, 2800],
        ),
      ),
      paydayLabel: 'Payday in 12 days',
      accounts: [
        DashboardAccount(id: 'chk', name: 'Checking', iconKey: 'person', balance: 3248.40),
        DashboardAccount(id: 'card', name: 'Card balance', iconKey: 'card', balance: 412.37, subtitle: 'Needs attention', tone: AccountTone.alert),
        DashboardAccount(id: 'avail', name: 'Available balance', iconKey: 'wallet', balance: 2739.05, subtitle: 'After bills due before monthly', hasInfo: true),
        DashboardAccount(id: 'sav', name: 'Savings', iconKey: 'wallet', balance: 6120.00, tone: AccountTone.accent),
      ],
      lastSyncLabel: '3 minutes ago',
      recentTransactions: [
        TransactionItem(id: 't1', title: 'Juniper Coffee', subtitle: 'October 18 · Pending', amount: -6.45, iconKey: 'coffee'),
        TransactionItem(id: 't2', title: 'Fresh Fields Grocery', subtitle: 'October 17', amount: -84.12, iconKey: 'groceries'),
        TransactionItem(id: 't3', title: 'CityRide', subtitle: 'October 17', amount: -23.80, iconKey: 'car'),
        TransactionItem(id: 't4', title: 'Ardent Systems', subtitle: 'October 18 · Income', amount: 2145.00, iconKey: 'work', highlight: true),
      ],
      budget: BudgetSummary(periodLabel: 'October', spent: 2462.05, limit: 3200, status: BudgetStatus.nearLimit, statusLabel: 'Under budget · 77% used'),
      budgetCategories: [
        BudgetCategory(id: 'transport', name: 'Transportation', iconKey: 'transit', spent: 148.60, limit: 120, status: BudgetStatus.over),
        BudgetCategory(id: 'food', name: 'Food', iconKey: 'food', spent: 362.18, limit: 450, status: BudgetStatus.nearLimit),
      ],
      upcomingBills: [
        BillItem(id: 'b1', title: 'City Water & Sewer', subtitle: 'Due Oct 16', amount: 32.18, iconKey: 'water', isOverdue: true),
        BillItem(id: 'b2', title: 'Brightwave Internet', subtitle: 'Scheduled · Oct 22', amount: 65.00, iconKey: 'internet'),
        BillItem(id: 'b3', title: 'Platypus Credit Card', subtitle: 'Due Oct 31', amount: 412.37, iconKey: 'card'),
      ],
      featuredTrend: TrendItem(
        id: 'tr1',
        direction: TrendDirection.rising,
        title: 'Food spending is going up',
        body: "At this pace you'll spend about \$625 on food in October, more than your \$490 budget.",
        actionLabel: 'View transactions',
      ),
      featuredTrendSource: 'From Food Transactions',
      tools: [
        ToolLink(id: 'recurring', iconKey: 'subscriptions', title: 'Recurring & Subscriptions', subtitle: '\$339 a year in subscriptions'),
        ToolLink(id: 'savings-goals', iconKey: 'wallet', title: 'Savings Goals', subtitle: 'On track! Saved 41% there', accent: true),
        ToolLink(id: 'cash-flow', iconKey: 'chart', title: 'Cash Flow Projection', subtitle: '\$4,093.12 prepared by Nov 17'),
      ],
    );
  }
}

class _DemoTransactions implements TransactionService {
  final Map<String, String> _cat = {'t5': 'food'};
  static const _categories = [
    CategoryInfo(id: 'food', name: 'Food', iconKey: 'food'),
    CategoryInfo(id: 'bills', name: 'Bills', iconKey: 'bills'),
    CategoryInfo(id: 'transport', name: 'Transportation', iconKey: 'transit'),
    CategoryInfo(id: 'subs', name: 'Subscriptions', iconKey: 'subscriptions'),
    CategoryInfo(id: 'utilities', name: 'Utilities', iconKey: 'utilities'),
  ];

  @override
  Future<List<TransactionGroup>> getGroups(TransactionQuery query) async {
    await _latency();
    return const [
      TransactionGroup(dayLabel: 'Oct 16', total: 2145, items: [
        TransactionItem(id: 't4', title: 'Ardent Systems payroll', subtitle: 'Income · Everyday Checking', amount: 2145, iconKey: 'payroll', highlight: true),
      ]),
      TransactionGroup(dayLabel: 'Oct 15', total: -40, items: [
        TransactionItem(id: 't6', title: 'Northline Transit', subtitle: 'Transportation · Everyday Checking', amount: -40, iconKey: 'transit'),
      ]),
      TransactionGroup(dayLabel: 'Oct 14', total: -15.99, items: [
        TransactionItem(id: 't7', title: 'StreamBox', subtitle: 'Subscriptions · Platypus Card', amount: -15.99, iconKey: 'streaming'),
      ]),
      TransactionGroup(dayLabel: 'Oct 13', total: -82.40, items: [
        TransactionItem(id: 't5', title: 'Greenmarket Grocery', subtitle: 'Food · Platypus Card', amount: -82.40, iconKey: 'food'),
      ]),
    ];
  }

  @override
  Future<List<FilterChoice>> getFilterChoices(FilterKind kind) async => switch (kind) {
        FilterKind.account => const [FilterChoice(id: 'chk', label: 'Everyday Checking'), FilterChoice(id: 'card', label: 'Platypus Card')],
        FilterKind.category => [for (final c in _categories) FilterChoice(id: c.id, label: c.name)],
        FilterKind.date => const [FilterChoice(id: '7d', label: 'Last 7 days'), FilterChoice(id: '30d', label: 'Last 30 days')],
      };

  @override
  Future<TransactionDetailBundle> getDetail(String id) async {
    await _latency();
    return TransactionDetailBundle(
      transaction: TransactionDetailData(
        id: id,
        title: 'Greenmarket Grocery',
        iconKey: 'shopping_bag',
        amount: -82.40,
        dateLabel: 'October 13, 2026',
        accountLabel: 'Platypus Credit Card ••3333',
        statusLabel: 'Posted Oct 18',
        merchantLabel: 'GREENMARKET #042',
        selectedCategoryId: _cat[id] ?? 'food',
      ),
      categories: _categories,
    );
  }

  @override
  Future<List<CategoryInfo>> getCategories() async => _categories;
  @override
  Future<void> setCategory({required String transactionId, required String categoryId}) async => _cat[transactionId] = categoryId;
  @override
  Future<void> setNote({required String transactionId, required String note}) async {}
}

class _DemoBudgets implements BudgetService {
  @override
  Future<List<BudgetPeriod>> getPeriods() async =>
      const [BudgetPeriod(id: 'oct', label: 'October', isCurrent: true), BudgetPeriod(id: 'sep', label: 'September')];

  @override
  Future<BudgetOverview> getOverview(String periodId) async {
    await _latency();
    return const BudgetOverview(
      summary: BudgetSummary(periodLabel: 'October', spent: 2462.05, limit: 3200, status: BudgetStatus.nearLimit),
      categories: [
        BudgetCategory(id: 'transport', name: 'Transportation', iconKey: 'transit', spent: 148.60, limit: 120, status: BudgetStatus.over),
        BudgetCategory(id: 'food', name: 'Food', iconKey: 'food', spent: 362.18, limit: 450, status: BudgetStatus.nearLimit),
        BudgetCategory(id: 'bills', name: 'Bills', iconKey: 'bills', spent: 735, limit: 1200, status: BudgetStatus.onTrack),
      ],
    );
  }

  @override
  Future<BudgetCategoryDetailData> getCategoryDetail({required String categoryId, required String periodId}) async {
    await _latency();
    return const BudgetCategoryDetailData(
      name: 'Food',
      periodLabel: 'Spent in October',
      spent: 362.18,
      limit: 450,
      status: BudgetStatus.nearLimit,
      paceHeadline: "You're spending \$4.10 more per day than planned.",
      paceBody: "At this pace, you'll be \$42 over budget by October 31.",
      recent: [
        TransactionItem(id: 't5', title: 'Greenmarket Grocery', subtitle: 'Oct 13', amount: -82.40, iconKey: 'shopping_bag'),
        TransactionItem(id: 't8', title: 'Harbor Cafe', subtitle: 'Oct 11', amount: -28.50, iconKey: 'food'),
        TransactionItem(id: 't9', title: 'Market Hall', subtitle: 'Oct 8', amount: -63.20, iconKey: 'store'),
      ],
    );
  }
}

class _DemoSpending implements SpendingService {
  @override
  Future<SpendingData> getSpending({required int rangeIndex}) async {
    await _latency();
    return SpendingData(
      rangeLabels: const ['Month', '3 months', 'Year'],
      selectedRange: rangeIndex,
      periodTitle: 'October spending',
      total: 1083.42,
      changePercent: 14.8,
      highlightedBar: 5,
      bars: const [
        BarDatum(label: '1', value: 42, semanticLabel: 'October 1'),
        BarDatum(label: '5', value: 62, semanticLabel: 'October 5'),
        BarDatum(label: '10', value: 36, semanticLabel: 'October 10'),
        BarDatum(label: '15', value: 78, semanticLabel: 'October 15'),
        BarDatum(label: '20', value: 55, semanticLabel: 'October 20'),
        BarDatum(label: '25', value: 88, semanticLabel: 'October 25'),
        BarDatum(label: '31', value: 66, semanticLabel: 'October 31'),
      ],
      categories: const [
        SpendingCategory(id: 'food', name: 'Food', iconKey: 'food', amount: 362.18, share: 0.7, changePercent: 22.1),
        SpendingCategory(id: 'savings', name: 'Savings', iconKey: 'wallet', amount: 300, share: 0.6),
        SpendingCategory(id: 'transport', name: 'Transportation', iconKey: 'transit', amount: 148.60, share: 0.3, changePercent: 54.5),
        SpendingCategory(id: 'utilities', name: 'Utilities', iconKey: 'utilities', amount: 84.30, share: 0.15, changePercent: 17.2),
        SpendingCategory(id: 'subs', name: 'Subscriptions', iconKey: 'subscriptions', amount: 31.97, share: 0.1, changePercent: 89.2),
      ],
    );
  }
}

class _DemoBills implements BillService {
  bool _paused = true;
  @override
  Future<BillsUpcomingData> getUpcoming() async {
    await _latency();
    return const BillsUpcomingData(
      summaryLabel: 'Due in the next 30 days',
      summaryAmount: 734.29,
      summaryDetail: '6 bills scheduled',
      sections: [
        BillSection(title: 'This week', items: [
          BillItem(id: 'b4', title: 'Oak Street Rent', subtitle: 'Due Oct 20 · Autopay', amount: 560, iconKey: 'home'),
          BillItem(id: 'b5', title: 'Metro Electric', subtitle: 'Due Oct 22', amount: 84.30, iconKey: 'utilities'),
        ]),
        BillSection(title: 'Later', items: [
          BillItem(id: 'b6', title: 'CloudVault Storage', subtitle: 'Due Oct 29 · Autopay', amount: 2.99, iconKey: 'cloud'),
          BillItem(id: 'b7', title: 'StreamBox', subtitle: 'Due Nov 14', amount: 15.99, iconKey: 'play'),
          BillItem(id: 'b8', title: 'Pulse Fitness', subtitle: 'Paused', amount: 39, iconKey: 'fitness'),
        ]),
      ],
    );
  }

  @override
  Future<RecurringData> getRecurring() async => RecurringData(
        monthlyTotal: 57.98,
        yearlyTotal: 695.76,
        insight: 'Your recurring costs are \$15.99 higher than last month.',
        items: [
          const RecurringItem(id: 'b6', name: 'CloudVault Storage', iconKey: 'cloud', detailLine: '\$2.99 monthly · next Oct 29', yearlyLine: '\$35.88 a year', status: SubscriptionStatus.active),
          const RecurringItem(id: 'b7', name: 'StreamBox', iconKey: 'play', detailLine: '\$15.99 monthly · next Nov 14', yearlyLine: '\$191.88 a year', status: SubscriptionStatus.active),
          RecurringItem(
            id: 'b8',
            name: 'Pulse Fitness',
            iconKey: 'fitness',
            detailLine: '\$39.00 monthly · paused Sep 30',
            yearlyLine: '\$0 a year while paused',
            status: _paused ? SubscriptionStatus.paused : SubscriptionStatus.active,
          ),
        ],
      );

  @override
  Future<void> markPaid(String billId) async {}
  @override
  Future<void> setSubscriptionPaused({required String id, required bool paused}) async => _paused = paused;
}

class _DemoNotifications implements NotificationService {
  late List<NotificationItem> _items = [
    const NotificationItem(
      id: 'n1', kind: NotificationKind.overdue, isNew: true, metaLabel: 'Bill overdue · 2h ago',
      title: 'City Water & Sewer is overdue', body: '\$32.18 was due Oct 16.',
      primaryActionLabel: 'Mark as paid', secondaryActionLabel: 'View bill',
    ),
    const NotificationItem(id: 'n2', kind: NotificationKind.overBudget, isNew: true, metaLabel: 'Over budget · 5h ago', title: 'Transportation is \$28.60 over', body: "You've spent \$148.60 of your \$120 limit."),
    const NotificationItem(id: 'n3', kind: NotificationKind.nearLimit, isNew: true, metaLabel: 'Near limit · Yesterday', title: 'Food is near its limit', body: '\$87.82 left for October.'),
    const NotificationItem(id: 'n4', kind: NotificationKind.reminder, metaLabel: 'Bill reminder · Yesterday', title: 'Brightwave Internet is due in 3 days', body: '\$65.00 on Oct 22. Autopay is on.'),
  ];

  @override
  Future<NotificationsData> getNotifications({required int filterIndex}) async {
    final unread = _items.where((n) => n.isNew).length;
    return NotificationsData(
      filterLabels: ['All · $unread new', 'Bills', 'Budgets', 'Goals'],
      selectedFilter: filterIndex,
      sync: const SyncStatus(label: 'Syncing accounts... 2 of 3', progress: 0.66),
      items: switch (filterIndex) {
        1 => _items.where((n) => n.kind == NotificationKind.overdue || n.kind == NotificationKind.reminder).toList(),
        2 => _items.where((n) => n.kind == NotificationKind.overBudget || n.kind == NotificationKind.nearLimit).toList(),
        3 => const [],
        _ => _items,
      },
    );
  }

  NotificationItem _read(NotificationItem n) => NotificationItem(
        id: n.id, kind: n.kind, title: n.title, body: n.body, metaLabel: n.metaLabel, isNew: false,
        primaryActionLabel: n.primaryActionLabel, secondaryActionLabel: n.secondaryActionLabel,
      );

  @override
  Future<void> markAllRead() async => _items = [for (final n in _items) _read(n)];
  @override
  Future<void> runPrimaryAction(String id) async => _items = _items.where((n) => n.id != id).toList();

  @override
  Future<DeepLinkTarget?> open(String id) async {
    final n = _items.firstWhere((n) => n.id == id);
    _items = [for (final x in _items) x.id == id ? _read(x) : x];
    return switch (n.kind) {
      NotificationKind.overdue => const DeepLinkTarget(TargetKind.bill, 'b1'),
      NotificationKind.overBudget => const DeepLinkTarget(TargetKind.budgetCategory, 'transport'),
      NotificationKind.nearLimit => const DeepLinkTarget(TargetKind.budgetCategory, 'food'),
      NotificationKind.reminder => const DeepLinkTarget(TargetKind.bills),
    };
  }
}

class _DemoSettings implements SettingsService {
  bool hc = false, patterns = true, values = true, alerts = true;
  @override
  Future<SettingsData> load() async => SettingsData(
        name: 'Von Lycaon',
        email: 'von.lycaon@email.com',
        initials: 'VL',
        connectedAccountCount: 3,
        accountsNeedingAttention: 1,
        billReminderLabel: '3 days before',
        highContrast: hc,
        chartPatterns: patterns,
        showChartValues: values,
        budgetAlerts: alerts,
        footerLabel: 'PROTOTYPE · DEMO DATA',
      );
  @override
  Future<void> setHighContrast(bool v) async => hc = v;
  @override
  Future<void> setChartPatterns(bool v) async => patterns = v;
  @override
  Future<void> setShowChartValues(bool v) async => values = v;
  @override
  Future<void> setBudgetAlerts(bool v) async => alerts = v;
}

class _DemoCashFlow implements CashFlowService {
  @override
  Future<CashFlowData> getProjection({required int rangeIndex, required int scenarioIndex}) async {
    await _latency();
    final bonus = (scenarioIndex - 1) * 400.0;
    return CashFlowData(
      rangeLabels: const ['30 days', '60 days', '90 days'],
      selectedRange: rangeIndex,
      scenarioLabels: const ['Low', 'Expected', 'High'],
      selectedScenario: scenarioIndex,
      projectedDateLabel: 'Projected cash on Nov 17',
      projectedAmount: 4034.08 + bonus,
      lowestAmount: 2494.05,
      lowestDescription: 'around Oct 25, after your card payment',
      chartTitle: 'Cash over the next 30 days',
      chart: CashFlowChartData(
        values: [3248, 3000, 2494, 2900, 3300 + bonus / 2, 2950, 3300 + bonus, 4034 + bonus],
        xLabels: const ['Oct 18', 'Oct 25', 'Nov 1', 'Nov 8', 'Nov 15'],
        gridValues: const [2000, 3000, 4000],
        lowIndex: 2,
        lowLabel: 'Low \$2,494',
        endLabel: '\$4,034',
      ),
      breakdown: const [
        BreakdownLine(title: 'Cash today', subtitle: 'Everyday Checking', amount: 3248.60),
        BreakdownLine(title: 'Expected income', subtitle: 'Ardent Systems payroll · Oct 30, Nov 13', amount: 4290, tone: AmountTone.positive),
        BreakdownLine(title: 'Bills & recurring', subtitle: '9 payments incl. rent on Nov 1', amount: 2154.52, tone: AmountTone.negative),
        BreakdownLine(title: 'Planned savings', subtitle: 'Emergency fund · Nov 10', amount: 300, tone: AmountTone.negative),
        BreakdownLine(title: 'Everyday spending', subtitle: 'Your 3-month average', amount: 1050, tone: AmountTone.negative),
      ],
    );
  }
}

class _DemoTrends implements TrendService {
  @override
  Future<TrendsData> getTrends() async => const TrendsData(
        headline: '4 trends in your accounts',
        aboutText: 'Insights come from Plaid TrendScore, which looks at patterns in your connected accounts over time. Demo data only.',
        trends: [
          TrendItem(id: 'tr1', direction: TrendDirection.rising, title: 'Food spending is going up', body: "You've spent \$362.18 on food so far in October. At this pace you'll reach about \$620 by month end, more than your \$450 budget.", actionLabel: 'View transactions'),
          TrendItem(id: 'tr2', direction: TrendDirection.rising, title: 'Ride costs are climbing', body: 'CityRide charges are \$55.20 so far this month, up from \$18.40 over the same days in September.', actionLabel: 'View transactions'),
          TrendItem(id: 'tr3', direction: TrendDirection.steady, title: 'Your income is steady', body: 'Ardent Systems has paid you \$2,145.00 twice a month for the last 6 months.', actionLabel: 'View deposits'),
          TrendItem(id: 'tr4', direction: TrendDirection.falling, title: 'Subscription costs went down', body: 'Pausing Pulse Fitness on Sep 30 saves you \$39.00 a month.', actionLabel: 'View subscriptions'),
        ],
      );
}
