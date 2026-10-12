import 'dart:convert' show jsonDecode, jsonEncode;
import 'dart:io' show File;
import 'package:flutter/material.dart' show Text, TextField;
import 'package:flutter_test/flutter_test.dart'
    show
        closeTo,
        contains,
        expect,
        expectLater,
        fail,
        find,
        findsNothing,
        findsOneWidget,
        findsWidgets,
        greaterThan,
        hasLength,
        group,
        isA,
        isEmpty,
        isFalse,
        isNot,
        isNotEmpty,
        lessThanOrEqualTo,
        isTrue,
        setUp,
        startsWith,
        test,
        testWidgets,
        throwsA;
import 'package:http/http.dart' as http show Request, Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/budget.dart' show BudgetOverview;
import 'package:pace_app/models/linked_bank.dart' show LinkedItem;
import 'package:pace_app/models/navigation.dart' show TargetKind;
import 'package:pace_app/models/notification.dart' show NotificationKind;
import 'package:pace_app/models/transaction.dart' show FilterChoice, FilterKind, TransactionItem, TransactionQuery;
import 'package:pace_app/repositories/bank_data_repository.dart' show PlaidBankDataRepository;
import 'package:pace_app/repositories/budget_repository.dart' show InMemoryBudgetRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/transaction_annotation_repository.dart' show InMemoryTransactionAnnotationRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/plaid_account_service.dart' show PlaidAccountService;
import 'package:pace_app/services/plaid_bill_service.dart' show PlaidBillService;
import 'package:pace_app/services/plaid_budget_service.dart' show PlaidBudgetService;
import 'package:pace_app/services/plaid_cash_flow_service.dart' show PlaidCashFlowService;
import 'package:pace_app/services/plaid_dashboard_service.dart' show PlaidDashboardService;
import 'package:pace_app/services/plaid_notification_service.dart' show PlaidNotificationService;
import 'package:pace_app/services/plaid_spending_service.dart' show PlaidSpendingService;
import 'package:pace_app/services/plaid_transaction_service.dart' show PlaidTransactionService;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/plaid_trend_service.dart' show PlaidTrendService;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/transactions_screen.dart' show TransactionsScreen;

import 'helpers.dart' show createAda;
/// Replays real responses captured from Plaid's sandbox (test/fixtures/plaid_sandbox), which
/// were taken on 2026-10-12, so tests use that date as "today".
class SandboxReplay {
  static final today = DateTime(2026, 10, 12, 9);
  static String _fixture(String name) => File('test/fixtures/plaid_sandbox/$name.json').readAsStringSync();

  final requests = <http.Request>[];
  bool transactionsReady = true;
  /// False: Plaid has only sent its first batch (the last ~30 days), like right after linking.
  bool historyReady = true;

  /// The first batch Plaid sends after linking: transactions from the last 30 days only.
  static String _initialBatch() {
    final j = jsonDecode(_fixture('transactions_sync')) as Map<String, dynamic>;
    final cutoff = today.subtract(const Duration(days: 30));
    j['added'] = [
      for (final t in j['added'] as List<dynamic>)
        if (!DateTime.parse((t as Map<String, dynamic>)['date'] as String).isBefore(cutoff)) t,
    ];
    j['transactions_update_status'] = 'INITIAL_UPDATE_COMPLETE';
    return jsonEncode(j);
  }

  late final client = MockClient((req) async {
    requests.add(req);
    if (req.url.host != 'sandbox.plaid.com' || req.url.scheme != 'https') fail('Non-sandbox request: ${req.url}');
    final body = jsonDecode(req.body) as Map<String, dynamic>;
    if (body['access_token'] != 'access-sandbox-test') fail('Missing/wrong access token for ${req.url.path}');
    return switch (req.url.path) {
      '/accounts/balance/get' => http.Response(_fixture('accounts_balance_get'), 200),
      '/transactions/sync' => transactionsReady
          ? http.Response(historyReady ? _fixture('transactions_sync') : _initialBatch(), 200)
          : http.Response(
              jsonEncode({
                'added': [], 'modified': [], 'removed': [], 'accounts': [],
                'has_more': false, 'next_cursor': '', 'transactions_update_status': 'NOT_READY',
              }),
              200),
      '/transactions/recurring/get' => transactionsReady
          ? http.Response(_fixture('transactions_recurring_get'), 200)
          : http.Response(jsonEncode({'error_type': 'ITEM_ERROR', 'error_code': 'PRODUCT_NOT_READY'}), 400),
      _ => http.Response(jsonEncode({'error_code': 'NOT_FOUND'}), 404),
    };
  });

  int calls(String path) => requests.where((r) => r.url.path == path).length;
}

void main() {
  late SandboxReplay plaid;
  late InMemoryLinkedBankRepository banks;
  late PlaidBankDataRepository data;
  late InMemoryTransactionAnnotationRepository notes;
  String? userId;
  late InMemoryBudgetRepository budgetStore;
  PlaidBudgetService budgetService(DateTime Function() clock) =>
      PlaidBudgetService(data, notes, budgets: budgetStore, currentUserId: () => userId, now: clock);
  DateTime now() => SandboxReplay.today;

  Future<void> linkTestBank() => banks.saveItem(
        LinkedItem(
          itemId: 'item-1',
          userId: 'u1',
          institutionName: 'First Platypus Bank',
          accessToken: 'access-sandbox-test',
          sandboxCredentialsLabel: 'simple',
          linkedAt: SandboxReplay.today,
        ),
        const [],
      );

  setUp(() async {
    plaid = SandboxReplay();
    banks = InMemoryLinkedBankRepository();
    userId = 'u1';
    notes = InMemoryTransactionAnnotationRepository();
    // The test user's budgets (what they would create in the budgets manager); they apply to every month.
    budgetStore = InMemoryBudgetRepository();
    for (final e in {'food': 400.0, 'shopping': 600.0, 'transport': 150.0, 'travel': 600.0, 'utilities': 1200.0, 'personal': 120.0}.entries) {
      await budgetStore.save('u1', e.key, e.value);
    }
    data = PlaidBankDataRepository(
      plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
      banks: banks,
      currentUserId: () => userId,
      now: now,
      retryEvery: const Duration(milliseconds: 20), // re-checks while Plaid prepares data
    );
    await linkTestBank();
  });

  group('PlaidBankDataRepository', () {
    test('reads balances, transactions and recurring streams from the sandbox', () async {
      final snap = await data.load();
      expect(snap.isLinked, isTrue);
      expect(snap.accounts.length, 14);
      expect(snap.transactions.length, 48);
      expect(snap.recurring.where((s) => !s.isInflow).length, 7);
      expect(snap.transactionsReady, isTrue);
      expect(plaid.calls('/accounts/balance/get'), 1);
      expect(plaid.calls('/transactions/sync'), 1);
      expect(plaid.calls('/transactions/recurring/get'), 1);
    });

    test('screens opening together share one fetch; refresh fetches again', () async {
      await Future.wait([data.load(), data.load(), data.load()]);
      expect(plaid.calls('/accounts/balance/get'), 1);
      await data.load(refresh: true);
      expect(plaid.calls('/accounts/balance/get'), 2);
    });

    test('no linked bank (or nobody signed in) makes no Plaid calls', () async {
      userId = 'someone-else';
      expect((await data.load()).isLinked, isFalse);
      userId = null;
      expect((await data.load()).isLinked, isFalse);
      expect(plaid.requests, isEmpty);
    });

    test('just after linking, transactions are reported as not ready', () async {
      plaid.transactionsReady = false;
      final snap = await data.load();
      expect(snap.transactionsReady, isFalse);
      expect(snap.recurring, isEmpty);
      expect(snap.accounts.length, 14); // balances are available immediately
    });

    test('an incomplete snapshot is not cached: the next load asks Plaid again', () async {
      plaid.transactionsReady = false;
      expect((await data.load()).transactionsReady, isFalse);
      plaid.transactionsReady = true;
      final snap = await data.load(); // no refresh needed
      expect(snap.transactionsReady, isTrue);
      expect(snap.transactions, isNotEmpty);
      expect(snap.recurring, isNotEmpty);
    });

    test('the first ~30-day batch is usable, but it keeps checking until the full history arrives', () async {
      plaid.historyReady = false;
      final bills = PlaidBillService(data, notes, now: now);
      final home = PlaidDashboardService(data, notes,
          budgets: budgetService(now),
          bills: bills,
          trends: PlaidTrendService(data, notes, now: now),
          cashFlow: PlaidCashFlowService(data, notes, now: now),
          now: now);
      var updates = 0;
      final sub = data.updates.listen((_) => updates++);

      final first = await data.load();
      expect(first.transactionsReady, isTrue); // recent transactions can be shown already
      final partialChart = (await home.load()).spend.chart;
      final partialCount = first.transactions.length;

      plaid.historyReady = true; // Plaid finishes the historical update
      await Future<void>.delayed(const Duration(milliseconds: 70));
      expect(updates, 1); // screens (the Home trend chart) are told to reload
      final full = await data.load();
      expect(full.transactions.length, greaterThan(partialCount));
      // The chart's "last month" line now covers all of September, not just its last few days.
      expect((await home.load()).spend.chart.previous.last, greaterThan(partialChart.previous.last));
      await sub.cancel();
    });

    test('while Plaid prepares data it re-checks, then announces the update and stops', () async {
      plaid.transactionsReady = false;
      var updates = 0;
      final sub = data.updates.listen((_) => updates++);
      await data.load();
      await Future<void>.delayed(const Duration(milliseconds: 70));
      expect(plaid.calls('/transactions/sync'), greaterThan(1)); // re-checked on its own
      expect(updates, 0);
      plaid.transactionsReady = true;
      await Future<void>.delayed(const Duration(milliseconds: 70));
      expect(updates, 1);
      final syncs = plaid.calls('/transactions/sync');
      await Future<void>.delayed(const Duration(milliseconds: 70));
      expect(plaid.calls('/transactions/sync'), syncs); // complete: no more polling
      expect((await data.load()).transactions, isNotEmpty); // served from the cache
      expect(plaid.calls('/transactions/sync'), syncs);
      await sub.cancel();
    });
  });

  test('Accounts: one group per linked bank, live balances, money owed is negative', () async {
    final accounts = await PlaidAccountService(data, now: now).getAccounts();
    final group = accounts.groups.single;
    expect(group.title, 'First Platypus Bank');
    final checking = group.accounts.firstWhere((a) => a.name == 'Plaid Checking');
    expect(checking.balance, 110);
    expect(checking.subtitle, 'Checking ••0000');
    expect(group.accounts.firstWhere((a) => a.name == 'Plaid Credit Card').balance, -410);
    expect(checking.syncLabel, contains('Plaid Sandbox'));

    userId = 'nobody';
    final empty = await PlaidAccountService(data, now: now).getAccounts();
    expect(empty.groups, isEmpty);
    expect(empty.emptyMessage, PlaidAccountService.noBankMessage);
  });

  group('Transactions', () {
    late PlaidTransactionService service;
    setUp(() => service = PlaidTransactionService(data, notes, now: now));

    test('all 48 sandbox transactions, grouped by day with daily totals', () async {
      final groups = await service.getGroups(const TransactionQuery());
      expect(groups.expand((g) => g.items).length, 48);
      expect(groups.first.dayLabel, 'Oct 11');
      for (final g in groups) {
        expect(g.total, closeTo(g.items.fold(0.0, (s, i) => s + i.amount), 0.001));
      }
      // Plaid's money-out (positive) becomes the app's negative.
      final uber = groups.expand((g) => g.items).firstWhere((i) => i.title == 'Uber');
      expect(uber.amount, -5.4);
    });

    test('filters by category, account and date; category override moves a transaction', () async {
      final food = await service.getGroups(const TransactionQuery(category: FilterChoice(id: 'food', label: 'Food & drink')));
      expect(food.expand((g) => g.items).length, 9);
      final week = await service.getGroups(const TransactionQuery(date: FilterChoice(id: '7d', label: 'Last 7 days')));
      expect(week.expand((g) => g.items), isNotEmpty);
      expect(week.length, lessThanOrEqualTo(7));
      final accounts = await service.getFilterChoices(FilterKind.account);
      final firstAccount = accounts.first;
      final byAccount = await service.getGroups(TransactionQuery(account: firstAccount));
      expect(byAccount.expand((g) => g.items), isNotEmpty);

      final uberId = (await service.getGroups(const TransactionQuery()))
          .expand((g) => g.items)
          .firstWhere((i) => i.title == 'Uber')
          .id;
      await service.setCategories(transactionId: uberId, categoryIds: ['food']);
      final detail = await service.getDetail(uberId);
      expect(detail.transaction.selectedCategoryIds, ['food']);
      expect(detail.transaction.accountLabel, contains('••'));
    });

    test('a transaction can have several categories; only the first (primary) counts in totals', () async {
      final all = (await service.getGroups(const TransactionQuery())).expand((g) => g.items).toList();
      final uber = all.firstWhere((i) => i.title == 'Uber'); // Plaid: Transportation, $5.40 on Oct 11
      expect((await service.getDetail(uber.id)).transaction.selectedCategoryIds, ['transport']);

      final spending = PlaidSpendingService(data, notes, now: now);
      double inCategory(String id, List<dynamic> cats) =>
          (cats.where((c) => c.id == id).firstOrNull?.amount as double?) ?? 0;
      final before = (await spending.getSpending(rangeIndex: 0)).categories;

      // Order kept (first = primary); duplicates and unknown ids dropped.
      await service.setCategories(transactionId: uber.id, categoryIds: ['travel', 'transport', 'travel', 'nope']);
      expect((await service.getDetail(uber.id)).transaction.selectedCategoryIds, ['travel', 'transport']);

      // The row lists both, primary first.
      final row = (await service.getGroups(const TransactionQuery())).expand((g) => g.items).firstWhere((i) => i.id == uber.id);
      expect(row.subtitle, startsWith('Travel + Transportation'));

      // Filtering finds it under either category.
      for (final id in ['travel', 'transport']) {
        final hits = (await service.getGroups(TransactionQuery(category: FilterChoice(id: id, label: id)))).expand((g) => g.items);
        expect(hits.any((i) => i.id == uber.id), isTrue, reason: id);
      }

      // Totals: the full $5.40 moved to Travel (primary) and left Transportation; nothing double-counted.
      final after = await spending.getSpending(rangeIndex: 0);
      expect(inCategory('travel', after.categories), closeTo(inCategory('travel', before) + 5.4, 0.001));
      expect(inCategory('transport', after.categories), closeTo(inCategory('transport', before) - 5.4, 0.001));
      expect(after.total, closeTo(before.fold(0.0, (s, c) => s + c.amount), 0.001));

      await expectLater(service.setCategories(transactionId: uber.id, categoryIds: const []), throwsA(isA<AppException>()));
    });

    test('a friendly message while transactions are still loading', () async {
      plaid.transactionsReady = false;
      await expectLater(service.getGroups(const TransactionQuery()), throwsA(isA<AppException>()));
    });

    group('search', () {
      Future<List<TransactionItem>> searchFor(String text, {TransactionQuery base = const TransactionQuery()}) async =>
          (await service.getGroups(base.withSearch(text))).expand((g) => g.items).toList();

      test('by merchant, ignoring case and extra spaces', () async {
        final hits = await searchFor('  uBeR ');
        expect(hits, isNotEmpty);
        expect(hits.every((i) => i.title == 'Uber'), isTrue);
        expect(await searchFor(''), hasLength(48)); // no search: everything
      });

      test('by category name, account last digits, and the user\'s own notes', () async {
        final travel = await searchFor('travel');
        expect(travel, isNotEmpty);
        expect(travel.every((i) => i.subtitle.toLowerCase().contains('travel')), isTrue);

        expect(await searchFor('0000'), isNotEmpty); // Plaid Checking ••0000

        final target = (await searchFor('uber')).first;
        await service.setNote(transactionId: target.id, note: 'Ride to the airport');
        final noted = await searchFor('airport');
        expect(noted.single.id, target.id);
      });

      test('by amount: exact with cents, or whole dollars', () async {
        final target = (await searchFor('uber')).first;
        final dollars = target.amount.abs();
        final exact = await searchFor('\$${dollars.toStringAsFixed(2)}');
        expect(exact.map((i) => i.id), contains(target.id));
        expect(exact.every((i) => (i.amount.abs() - dollars).abs() < 0.005), isTrue);
        final whole = await searchFor('${dollars.floor()}');
        expect(whole.map((i) => i.id), contains(target.id));
        expect(whole.every((i) => i.amount.abs().floor() == dollars.floor()), isTrue);
      });

      test('every word must match; combines with the filters', () async {
        final uber = await searchFor('uber');
        final uberTravel = await searchFor('uber travel');
        expect(uberTravel.length, lessThanOrEqualTo(uber.length));
        expect(await searchFor('uber zzzz-nothing'), isEmpty);
        const lastWeek = TransactionQuery(date: FilterChoice(id: '7d', label: 'Last 7 days'));
        final recentUber = await searchFor('uber', base: lastWeek);
        expect(recentUber.length, lessThanOrEqualTo(uber.length));
        expect(recentUber.every((i) => i.title == 'Uber'), isTrue);
      });
    });
  });

  group('Bills & recurring', () {
    late PlaidBillService bills;
    setUp(() => bills = PlaidBillService(data, notes, now: now));

    test('upcoming bills come from Plaid recurring streams due in the next 30 days', () async {
      final upcoming = await bills.getUpcoming();
      final items = upcoming.sections.expand((s) => s.items).toList();
      // Due Oct 20, 20, 21, 26, Nov 7, Nov 9 (Nov 11 is past the 30-day window; income isn't a bill).
      expect(items.length, 6);
      expect(items.first.subtitle, 'Due Oct 20');
      expect(upcoming.summaryAmount, closeTo(items.fold(0.0, (s, b) => s + b.amount), 0.001));
    });

    test('mark paid hides a bill; pausing removes it from the monthly total', () async {
      final first = (await bills.upcomingBills()).first;
      await bills.markPaid(first.id);
      expect((await bills.upcomingBills()).any((b) => b.id == first.id), isFalse);

      final before = await bills.getRecurring();
      expect(before.items.length, 7);
      final climbing = before.items.firstWhere((i) => i.name == 'Touchstone Climbing');
      await bills.setSubscriptionPaused(id: climbing.id, paused: true);
      final after = await bills.getRecurring();
      expect(after.monthlyTotal, closeTo(before.monthlyTotal - 78.5, 0.01));
      expect(after.yearlyTotal, closeTo(after.monthlyTotal * 12, 0.01));
    });
  });

  test('Spending: this month total and categories from sandbox transactions', () async {
    final s = await PlaidSpendingService(data, notes, now: now).getSpending(rangeIndex: 0);
    expect(s.periodTitle, 'October spending');
    expect(s.total, greaterThan(0));
    expect(s.categories.fold(0.0, (t, c) => t + c.amount), closeTo(s.total, 0.001));
    expect(s.bars.fold(0.0, (t, b) => t + b.value), closeTo(s.total, 0.001));
    expect(s.categories.map((c) => c.id), isNot(contains('transfers')));
    final year = await PlaidSpendingService(data, notes, now: now).getSpending(rangeIndex: 2);
    expect(year.total, greaterThan(s.total));
  });

  test('Budgets: 3 monthly periods; limits carry over, spending is per month', () async {
    final budgets = budgetService(now);
    final periods = await budgets.getPeriods();
    expect([for (final p in periods) p.label], ['October', 'September', 'August']);
    expect(periods.first.isCurrent, isTrue);
    final overview = await budgets.getOverview(periods.first.id);
    final spending = await PlaidSpendingService(data, notes, now: now).getSpending(rangeIndex: 0);
    for (final c in overview.categories) {
      final s = spending.categories.where((x) => x.id == c.id).firstOrNull;
      expect(c.spent, closeTo(s?.amount ?? 0, 0.001), reason: c.id);
    }
    final food = await budgets.getCategoryDetail(categoryId: 'food', periodId: periods.first.id);
    expect(food.periodLabel, 'Spent in October');
    expect(food.paceHeadline, isNotEmpty);
    // The limits carry over to September; the spending is September's own.
    final september = await budgets.getOverview(periods[1].id);
    Map<String, double> limitsOf(BudgetOverview o) => {for (final c in o.categories) c.id: c.limit};
    expect(limitsOf(september), limitsOf(overview));
    expect(september.summary.limit, overview.summary.limit);
    expect(overview.summary.spent, closeTo(189.63, 0.001)); // October 1-12
    expect(september.summary.spent, closeTo(2195.96, 0.001)); // all of September
    final septemberFood = await budgets.getCategoryDetail(categoryId: 'food', periodId: periods[1].id);
    expect(septemberFood.limit, food.limit);
    expect(septemberFood.periodLabel, 'Spent in September');
    expect(septemberFood.spent, isNot(closeTo(food.spent, 0.001)));
  });

  test('Cash flow: starts from checking + savings, applies recurring payments', () async {
    final cf = await PlaidCashFlowService(data, notes, now: now).getProjection(rangeIndex: 0, scenarioIndex: 1);
    expect(cf.breakdown.first.amount, 300); // available: checking 100 + savings 200
    expect(cf.chart.values.first, 300);
    expect(cf.breakdown[2].amount, greaterThan(0)); // bills in the next 30 days
    expect(cf.projectedAmount, closeTo(cf.chart.values.last, 0.001));
    expect(cf.projectedDateLabel, 'Projected cash on Nov 11');
  });

  test('Trends, notifications and the dashboard are built from the same sandbox data', () async {
    final bills = PlaidBillService(data, notes, now: now);
    final budgets = budgetService(now);
    final trends = PlaidTrendService(data, notes, now: now);
    final cashFlow = PlaidCashFlowService(data, notes, now: now);

    final t = await trends.getTrends();
    expect(t.trends, isNotEmpty);
    expect(t.aboutText, contains('Plaid Sandbox'));

    final notifications = await PlaidNotificationService(bills, budgets, now: now).getNotifications(filterIndex: 0);
    for (final n in notifications.items) {
      expect([NotificationKind.overdue, NotificationKind.reminder, NotificationKind.overBudget, NotificationKind.nearLimit],
          contains(n.kind));
    }

    final home = await PlaidDashboardService(data, notes, budgets: budgets, bills: bills, trends: trends, cashFlow: cashFlow, now: now)
        .load();
    expect(home.dateLabel, 'Mon, Oct 12');
    expect(home.accounts.firstWhere((a) => a.id == 'checking').balance, 110);
    expect(home.accounts.firstWhere((a) => a.id == 'cards').balance, 410 + 5020);
    expect(home.recentTransactions.length, 4);
    expect(home.upcomingBills.length, 3);
    expect(home.spend.amount, closeTo((await PlaidSpendingService(data, notes, now: now).getSpending(rangeIndex: 0)).total, 0.001));
    // All of it from one fetch per endpoint.
    expect(plaid.calls('/transactions/sync'), 1);
  });

  test('bills due within 3 days raise reminders that open the Bills screen', () async {
    DateTime oct18() => DateTime(2026, 10, 18, 9); // two days before the Oct 20 bills
    final bills = PlaidBillService(data, notes, now: oct18);
    final service = PlaidNotificationService(bills, budgetService(oct18), now: oct18);
    final reminders = (await service.getNotifications(filterIndex: 1)).items;
    expect(reminders, isNotEmpty);
    expect(reminders.first.kind, NotificationKind.reminder);
    expect(reminders.first.title, contains('in 2 days'));
    expect((await service.open(reminders.first.id))?.kind, TargetKind.bills);
  });

  testWidgets('the Accounts screen shows the sandbox accounts end to end', (tester) async {
    final users = InMemoryUserAccountRepository();
    final ownBanks = InMemoryLinkedBankRepository(); // not the shared one: ids like 'u1' would collide
    final services = demoServices(
      accounts: users,
      hasher: const PasswordHasher(iterations: 1000),
      plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
      banks: ownBanks,
      now: now,
    );
    await tester.runAsync(() => createAda(services.auth));
    final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
    await ownBanks.saveItem(
      LinkedItem(
        itemId: 'item-2',
        userId: ada.id,
        institutionName: 'First Platypus Bank',
        accessToken: 'access-sandbox-test',
        sandboxCredentialsLabel: 'simple',
        linkedAt: SandboxReplay.today,
      ),
      const [],
    );
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.accounts]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(find.text('Plaid Checking'), findsOneWidget);
    expect(find.text('First Platypus Bank'), findsOneWidget);
    expect(find.text('Checking ••0000'), findsOneWidget);
    router.dispose();
  });

  testWidgets('Transactions appear on their own once Plaid has prepared them (no restart)', (tester) async {
    plaid.transactionsReady = false; // just linked: Plaid is still preparing transactions
    final users = InMemoryUserAccountRepository();
    final ownBanks = InMemoryLinkedBankRepository();
    final services = demoServices(
      accounts: users,
      hasher: const PasswordHasher(iterations: 1000),
      plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
      banks: ownBanks,
      now: now,
    );
    await tester.runAsync(() => createAda(services.auth));
    final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
    await ownBanks.saveItem(
      LinkedItem(
        itemId: 'item-3',
        userId: ada.id,
        institutionName: 'First Platypus Bank',
        accessToken: 'access-sandbox-test',
        sandboxCredentialsLabel: 'simple',
        linkedAt: SandboxReplay.today,
      ),
      const [],
    );
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.transactions]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(find.textContaining('still loading'), findsOneWidget);

    plaid.transactionsReady = true; // Plaid finishes; the app re-checks a few seconds later
    await tester.pump(const Duration(seconds: 4));
    await tester.pumpAndSettle();
    expect(find.textContaining('still loading'), findsNothing);
    expect(find.byType(TransactionsScreen), findsOneWidget);
    expect(find.textContaining('Uber'), findsWidgets);
    router.dispose();
  });

  testWidgets('Transactions: search as you type, with a no-match message and a clear button', (tester) async {
    final users = InMemoryUserAccountRepository();
    final ownBanks = InMemoryLinkedBankRepository();
    final services = demoServices(
      accounts: users,
      hasher: const PasswordHasher(iterations: 1000),
      plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
      banks: ownBanks,
      now: now,
    );
    await tester.runAsync(() => createAda(services.auth));
    final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
    await ownBanks.saveItem(
      LinkedItem(
        itemId: 'item-4',
        userId: ada.id,
        institutionName: 'First Platypus Bank',
        accessToken: 'access-sandbox-test',
        sandboxCredentialsLabel: 'simple',
        linkedAt: SandboxReplay.today,
      ),
      const [],
    );
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.transactions]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    final field = find.byType(TextField);
    expect(field, findsOneWidget);
    List<String?> shown() => [for (final t in tester.widgetList<Text>(find.byType(Text))) t.data];
    final everything = shown();

    await tester.enterText(field, 'uber');
    await tester.pump(const Duration(milliseconds: 400)); // typing pause
    await tester.pumpAndSettle();
    expect(find.text('Uber'), findsWidgets);
    expect(shown(), isNot(everything));

    await tester.enterText(field, 'zzzz');
    await tester.pump(const Duration(milliseconds: 400));
    await tester.pumpAndSettle();
    expect(find.text('No transactions match "zzzz".'), findsOneWidget);

    await tester.tap(find.byTooltip('Clear search'));
    await tester.pumpAndSettle();
    expect(find.textContaining('No transactions match'), findsNothing);
    expect(shown(), everything); // the full list is back
    router.dispose();
  });
}
