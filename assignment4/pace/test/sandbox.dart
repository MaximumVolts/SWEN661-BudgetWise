// Shared test harness: Plaid sandbox replay + opening the real app with the sandbox bank linked.
import 'dart:convert' show jsonDecode, jsonEncode;
import 'dart:io' show File;
import 'package:flutter_test/flutter_test.dart' show WidgetTester, fail;
import 'package:http/http.dart' as http show Request, Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/linked_bank.dart' show LinkedItem;
import 'package:pace_app/repositories/budget_repository.dart' show InMemoryBudgetRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/recurring_expense_repository.dart' show InMemoryRecurringExpenseRepository;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/repositories/statement_saver.dart' show StatementSaver;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/app_services.dart' show AppServices;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'helpers.dart' show createAda, NoGoogle;

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
    // Linking a bank: Plaid's sandbox shortcut, then the token exchange.
    switch (req.url.path) {
      case '/sandbox/public_token/create':
        return http.Response(jsonEncode({'public_token': 'public-sandbox-test', 'request_id': 'r1'}), 200);
      case '/item/public_token/exchange':
        if (body['public_token'] != 'public-sandbox-test') fail('Wrong public token');
        return http.Response(jsonEncode({'access_token': 'access-sandbox-test', 'item_id': 'item-linked', 'request_id': 'r2'}), 200);
    }
    if (body['access_token'] != 'access-sandbox-test') fail('Missing/wrong access token for ${req.url.path}');
    return switch (req.url.path) {
      '/accounts/get' || '/accounts/balance/get' => http.Response(_fixture('accounts_balance_get'), 200),
      '/item/remove' => http.Response(jsonEncode({'request_id': 'r3'}), 200),
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

/// The app as a test opens it: [router], its [services], the signed-in user's id and their stores.
typedef SandboxApp = ({
  AppRouter router,
  AppServices services,
  String userId,
  InMemoryBudgetRepository budgets,
  InMemoryRecurringExpenseRepository recurring,
});

/// Signs up Ada with the sandbox bank linked (replayed by [plaid]; [linkBank] false to start
/// without one), opens the app on [stack] ("today" = [today], default [SandboxReplay.today]) and
/// lets it load. [seed] runs before the app opens.
Future<SandboxApp> openSandboxApp(
  WidgetTester tester,
  SandboxReplay plaid,
  List<AppRoute> stack, {
  StatementSaver? statementSaver,
  Future<void> Function(SandboxApp app)? seed,
  DateTime? today,
  bool linkBank = true,
}) async {
  final users = InMemoryUserAccountRepository();
  final banks = InMemoryLinkedBankRepository();
  final budgets = InMemoryBudgetRepository();
  final recurring = InMemoryRecurringExpenseRepository();
  final services = demoServices(
    accounts: users,
    google: NoGoogle(),
    hasher: const PasswordHasher(iterations: 1000),
    plaid: SandboxPlaidApi(client: plaid.client, clientId: 'cid', secret: 'sandbox-secret'),
    banks: banks,
    budgetStore: budgets,
    recurringStore: recurring,
    statementSaver: statementSaver,
    now: () => today ?? SandboxReplay.today,
  );
  await tester.runAsync(() => createAda(services.auth));
  final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
  if (linkBank) {
    await banks.saveItem(
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
  }
  final router = AppRouter.create(services: services, initialStack: stack);
  final app = (router: router, services: services, userId: ada.id, budgets: budgets, recurring: recurring);
  if (seed != null) await tester.runAsync(() => seed(app));
  await tester.pumpWidget(PaceApp(router: router));
  await tester.pumpAndSettle();
  return app;
}
