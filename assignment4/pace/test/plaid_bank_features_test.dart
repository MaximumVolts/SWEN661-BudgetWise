import 'dart:convert' show ascii, jsonDecode, jsonEncode, utf8;
import 'dart:io' show File;
import 'package:flutter/material.dart' show Text, TextField;
import 'package:flutter_test/flutter_test.dart'
    show
        closeTo,
        completion,
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
        isNull,
        lessThanOrEqualTo,
        isTrue,
        setUp,
        startsWith,
        test,
        testWidgets,
        throwsA,
        WidgetTester;
import 'package:http/http.dart' as http show Request, Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/budget.dart' show BudgetOverview;
import 'package:pace_app/models/linked_bank.dart' show LinkedItem;
import 'package:pace_app/models/navigation.dart' show TargetKind;
import 'package:pace_app/models/notification.dart' show NotificationKind;
import 'package:pace_app/models/statement.dart' show Statement, StatementFormat, StatementLine;
import 'package:pace_app/models/recurring.dart' show RecurringAction, RecurringKind;
import 'package:pace_app/models/money.dart' show Money;
import 'package:pace_app/models/transaction.dart' show FilterChoice, FilterKind, TransactionItem, TransactionQuery;
import 'package:pace_app/repositories/bank_data_repository.dart' show PlaidBankDataRepository;
import 'package:pace_app/repositories/budget_repository.dart' show InMemoryBudgetRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/statement_saver.dart' show InMemoryStatementSaver, StatementSaver;
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
import 'package:pace_app/services/plaid_statement_service.dart' show PlaidStatementService;
import 'package:pace_app/services/statement_encoders.dart' show CsvStatementEncoder, PdfStatementEncoder;
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

  group('Statements', () {
    late InMemoryStatementSaver saver;
    late PlaidStatementService statements;
    setUp(() {
      saver = InMemoryStatementSaver();
      statements = PlaidStatementService(data, notes, saver: saver, now: now);
    });

    test('options: all accounts first, then each account with transactions; this month and the 5 before', () async {
      final o = await statements.options();
      expect(o.accounts.first.id, '');
      expect(o.accounts.first.label, 'All accounts');
      expect(o.accounts.map((a) => a.label), contains('Plaid Checking - 0000'));
      expect([for (final m in o.months) m.id], ['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05']);
      expect(o.months.first.label, 'October 2026');

      userId = 'nobody'; // no linked bank: nothing to export
      expect((await statements.options()).isEmpty, isTrue);
    });

    test('a month of posted transactions, oldest first, with the totals and the user\'s edits', () async {
      final snap = await data.load();
      final sept = [
        for (final t in snap.transactions)
          if (!t.pending && t.date.year == 2026 && t.date.month == 9) t,
      ];
      final target = sept.first;
      final transactions = PlaidTransactionService(data, notes, now: now);
      await transactions.setNote(transactionId: target.transactionId, note: 'Team lunch, paid back');
      await transactions.setCategories(transactionId: target.transactionId, categoryIds: ['travel', 'food']);

      final s = await statements.statement(accountId: '', monthId: '2026-09');
      expect(s.lines, hasLength(sept.length));
      expect(s.periodLabel, 'September 2026');
      for (var i = 1; i < s.lines.length; i++) {
        expect(s.lines[i].date.isBefore(s.lines[i - 1].date), isFalse); // oldest first
      }
      expect(s.lines.every((l) => l.date.month == 9), isTrue);
      expect(s.moneyIn, closeTo(sept.where((t) => t.amount < 0).fold(0.0, (a, t) => a - t.amount), 0.001));
      expect(s.moneyOut, closeTo(sept.where((t) => t.amount > 0).fold(0.0, (a, t) => a + t.amount), 0.001));
      expect(s.net, closeTo(s.moneyIn - s.moneyOut, 0.001));
      final edited = s.lines.firstWhere((l) => l.note.isNotEmpty);
      expect(edited.note, 'Team lunch, paid back');
      expect(edited.category, startsWith('Travel'));

      final checking = (await statements.options()).accounts.firstWhere((a) => a.label == 'Plaid Checking - 0000');
      final one = await statements.statement(accountId: checking.id, monthId: '2026-09');
      expect(one.accountLabel, 'Plaid Checking - 0000');
      expect(one.lines.every((l) => l.account == 'Plaid Checking - 0000'), isTrue);
      expect(one.lines.length, lessThanOrEqualTo(s.lines.length));

      await expectLater(statements.statement(accountId: '', monthId: '2026-13'), throwsA(isA<AppException>()));
    });

    test('CSV: a header row, one row per transaction, quoting cells with commas', () async {
      final s = await statements.statement(accountId: '', monthId: '2026-09');
      final text = utf8.decode((await CsvStatementEncoder().encode(s)).sublist(3)); // after the BOM
      final rows = text.trim().split('\r\n');
      expect(rows.first, 'Date,Description,Category,Account,Amount,Note');
      expect(rows, hasLength(s.lines.length + 1));
      expect(rows[1], startsWith('2026-09-'));
      expect(CsvStatementEncoder().encode(Statement(
            accountLabel: 'A',
            periodLabel: 'P',
            periodId: '2026-09',
            generatedOn: SandboxReplay.today,
            lines: [StatementLine(date: DateTime(2026, 9, 1), description: 'Coffee, "large"', category: 'Food', account: 'A', amount: -4.5)],
            moneyIn: 0,
            moneyOut: 4.5,
          )).then((b) => utf8.decode(b.sublist(3)).split('\r\n')[1]),
          completion('2026-09-01,"Coffee, ""large""",Food,A,-4.50,'));
    });

    test('PDF: a real PDF document', () async {
      final s = await statements.statement(accountId: '', monthId: '2026-09');
      final bytes = await PdfStatementEncoder().encode(s);
      expect(ascii.decode(bytes.sublist(0, 5)), '%PDF-');
      expect(bytes.length, greaterThan(1000));
    });

    test('download: saved where the user picks, named after the month and account; cancelling saves nothing', () async {
      expect(await statements.download(accountId: '', monthId: '2026-09', format: StatementFormat.pdf),
          'pace-statement-2026-09-all-accounts.pdf');
      expect(saver.saved.single.mimeType, 'application/pdf');
      final checking = (await statements.options()).accounts.firstWhere((a) => a.label == 'Plaid Checking - 0000');
      expect(await statements.download(accountId: checking.id, monthId: '2026-10', format: StatementFormat.csv),
          'pace-statement-2026-10-plaid-checking-0000.csv');
      expect(saver.saved.last.mimeType, 'text/csv');

      saver.cancel = true;
      expect(await statements.download(accountId: '', monthId: '2026-09', format: StatementFormat.csv), isNull);
      expect(saver.saved, hasLength(2));
    });
  });

  group('Bills & recurring', () {
    late PlaidBillService bills;
    setUp(() => bills = PlaidBillService(data, notes, now: now));

    test('detected recurring payments are split into subscriptions and bills by category', () async {
      final r = await bills.getRecurring();
      final byName = {for (final i in r.items) i.name: i};
      expect(byName['Touchstone Climbing']!.kind, RecurringKind.subscription); // personal care
      expect(byName['CREDIT CARD 3333 PAYMENT *//']!.kind, RecurringKind.bill); // loan & card payments
      expect(r.items.every((i) => !i.isManual), isTrue);
      expect(r.subscriptions.length + r.bills.length, r.items.length);
      expect(r.subscriptionsMonthly, lessThanOrEqualTo(r.monthlyTotal));
    });

    test('price changes come from the last two charges the bank matched', () async {
      final snap = await data.load();
      for (final item in (await bills.getRecurring()).items) {
        final stream = snap.recurring.firstWhere((s) => s.streamId == item.id);
        final charges = ([for (final t in snap.transactions) if (stream.transactionIds.contains(t.transactionId)) t]
              ..sort((a, b) => a.date.compareTo(b.date)))
            .map((t) => t.amount.abs())
            .toList();
        final changed = charges.length >= 2 && (charges.last - charges[charges.length - 2]).abs() >= 0.01;
        expect(item.priceChangeLine != null, changed, reason: item.name);
        if (changed) expect(item.priceChangeLine, contains(Money.format(charges.last)));
      }
    });

    test('details: source account, payment history (newest first), and no edit / delete', () async {
      final item = (await bills.getRecurring()).items.firstWhere((i) => i.name == 'Touchstone Climbing');
      final d = await bills.getDetail(item.id);
      expect(d.isManual, isFalse);
      expect(d.sourceLabel, startsWith('Detected in Plaid'));
      expect(d.history, isNotEmpty);
      expect(d.history.every((p) => p.amount < 0), isTrue); // money out
      expect(bills.actionsFor(item), isNot(contains(RecurringAction.edit)));
      await expectLater(bills.deleteRecurring(item.id), throwsA(isA<AppException>()));
    });

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

  /// Signs up Ada with the sandbox bank linked, opens the app on [stack] and lets it load.
  Future<AppRouter> openWithBank(WidgetTester tester, List<AppRoute> stack, {StatementSaver? statementSaver}) async {
    final users = InMemoryUserAccountRepository();
    final ownBanks = InMemoryLinkedBankRepository(); // not the shared one: ids like 'u1' would collide
    final services = demoServices(
      accounts: users,
      hasher: const PasswordHasher(iterations: 1000),
      plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
      banks: ownBanks,
      statementSaver: statementSaver,
      now: now,
    );
    await tester.runAsync(() => createAda(services.auth));
    final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
    await ownBanks.saveItem(
      LinkedItem(
        itemId: 'item-app',
        userId: ada.id,
        institutionName: 'First Platypus Bank',
        accessToken: 'access-sandbox-test',
        sandboxCredentialsLabel: 'simple',
        linkedAt: SandboxReplay.today,
      ),
      const [],
    );
    final router = AppRouter.create(services: services, initialStack: stack);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    return router;
  }


  testWidgets('the Accounts screen shows the sandbox accounts end to end', (tester) async {
    final router = await openWithBank(tester, const [AppRoute.home, AppRoute.accounts]);
    expect(find.text('Plaid Checking'), findsOneWidget);
    expect(find.text('First Platypus Bank'), findsOneWidget);
    expect(find.text('Checking ••0000'), findsOneWidget);
    router.dispose();
  });

  testWidgets('Transactions appear on their own once Plaid has prepared them (no restart)', (tester) async {
    plaid.transactionsReady = false; // just linked: Plaid is still preparing transactions
    final router = await openWithBank(tester, const [AppRoute.home, AppRoute.transactions]);
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
    final router = await openWithBank(tester, const [AppRoute.home, AppRoute.transactions]);
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

  testWidgets('Settings → Statement export: pick a month and CSV, download, see where it was saved', (tester) async {
    final saver = InMemoryStatementSaver();
    final router = await openWithBank(tester, const [AppRoute.home, AppRoute.settings], statementSaver: saver);

    await tester.scrollUntilVisible(find.text('Statement export'), 200);
    await tester.tap(find.text('Statement export'));
    await tester.pumpAndSettle();
    expect(router.delegate.current, AppRoute.statementExport);
    await tester.scrollUntilVisible(find.text('Download PDF statement'), 200);
    expect(find.text('All accounts · October 2026'), findsOneWidget); // the summary of what's in it
    await tester.scrollUntilVisible(find.text('September 2026'), -200);

    await tester.tap(find.text('September 2026'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('CSV (for spreadsheets)'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Download CSV statement'), 200);
    expect(find.text('All accounts · September 2026'), findsOneWidget);
    expect(find.textContaining('posted transactions'), findsOneWidget);
    await tester.tap(find.text('Download CSV statement'));
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 50))); // encoding
    await tester.pumpAndSettle();

    expect(saver.saved.single.fileName, 'pace-statement-2026-09-all-accounts.csv');
    expect(find.text('Statement saved as pace-statement-2026-09-all-accounts.csv'), findsOneWidget);
    router.dispose();
  });
}
