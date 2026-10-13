import 'dart:io' show Directory, File;
import 'package:flutter/material.dart' show Icons, TextField;
import 'package:flutter_test/flutter_test.dart'
    show
        WidgetTester,
        contains,
        expect,
        expectLater,
        find,
        findsNothing,
        findsOneWidget,
        group,
        isA,
        isEmpty,
        isFalse,
        isNot,
        setUp,
        setUpAll,
        tearDown,
        test,
        testWidgets,
        throwsA;
import 'package:pace_app/repositories/bank_data_repository.dart' show PlaidBankDataRepository;
import 'package:pace_app/repositories/budget_repository.dart' show InMemoryBudgetRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/sqlite_budget_repository.dart' show SqliteBudgetRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:pace_app/repositories/transaction_annotation_repository.dart' show InMemoryTransactionAnnotationRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/plaid_budget_service.dart' show PlaidBudgetService;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/manage_budgets_screen.dart' show ManageBudgetsScreen;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show databaseFactoryFfi, sqfliteFfiInit;



import 'helpers.dart' show createAda, fieldErrors, NoGoogle;
const _monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/// The app (with the real clock) for a signed-in user "Ada", opened on Budgets.
Future<({AppRouter router, InMemoryBudgetRepository store, String adaId})> _openBudgets(
  WidgetTester tester,
) async {
  final users = InMemoryUserAccountRepository();
  final store = InMemoryBudgetRepository();
  final services = demoServices(
    accounts: users,
    google: NoGoogle(),
    hasher: const PasswordHasher(iterations: 1000),
    banks: InMemoryLinkedBankRepository(),
    budgetStore: store,
  );
  await tester.runAsync(() => createAda(services.auth));
  final adaId = (await tester.runAsync(() => users.fetchByUsername('ada')))!.id;
  final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.budgets]);
  await tester.pumpWidget(PaceApp(router: router));
  await tester.pumpAndSettle();
  return (router: router, store: store, adaId: adaId);
}

void main() {
  group('PlaidBudgetService: managing budgets', () {
    late InMemoryBudgetRepository store;
    late PlaidBudgetService service;
    String? userId;
    setUp(() {
      store = InMemoryBudgetRepository();
      userId = 'u1';
      final noBank = PlaidBankDataRepository(
        plaid: SandboxPlaidApi(clientId: 'x', secret: 'y'),
        banks: InMemoryLinkedBankRepository(), // nothing linked: no Plaid calls
        currentUserId: () => userId,
      );
      service = PlaidBudgetService(noBank, InMemoryTransactionAnnotationRepository(),
          budgets: store, currentUserId: () => userId, now: () => DateTime(2026, 10, 12));
    });

    test('a new user starts with no budgets', () async {
      expect(await service.budgets(), isEmpty);
      final overview = await service.getOverview('2026-10');
      expect(overview.categories, isEmpty);
      expect(overview.summary.statusLabel, 'No budgets yet');
    });

    test('create, edit (limit and category) and delete, announcing each change', () async {
      var changes = 0;
      final sub = service.changes.listen((_) => changes++);

      await service.createBudget(categoryId: 'food', limit: r'$1,250.50');
      expect((await service.budgets()).single.monthlyLimit, 1250.5);
      expect((await service.getOverview('2026-10')).categories.single.limit, 1250.5);

      await service.updateBudget(categoryId: 'food', limit: '300');
      expect(await store.limitsFor('u1'), {'food': 300.0});

      await service.updateBudget(categoryId: 'food', newCategoryId: 'shopping', limit: '450');
      expect(await store.limitsFor('u1'), {'shopping': 450.0});
      expect(await service.hasBudget('food'), isFalse);

      await service.deleteBudget('shopping');
      expect(await service.budgets(), isEmpty);
      await Future<void>.delayed(Duration.zero);
      expect(changes, 4);
      await sub.cancel();
    });

    test('a budget applies to every month; spending stays per month', () async {
      await service.createBudget(categoryId: 'food', limit: '1000');
      final months = [for (final p in await service.getPeriods()) p.id];
      expect(months, ['2026-10', '2026-09', '2026-08']);
      for (final m in months) {
        final overview = await service.getOverview(m);
        expect(overview.categories.single.limit, 1000, reason: m);
        expect((await service.getCategoryDetail(categoryId: 'food', periodId: m)).limit, 1000, reason: m);
      }
      // Editing the limit changes it everywhere.
      await service.updateBudget(categoryId: 'food', limit: '900');
      expect((await service.getOverview('2026-08')).categories.single.limit, 900);
      await expectLater(service.getOverview('2026-13'), throwsA(isA<AppException>()));
    });

    test('validation: category required, one budget per category, spending categories only', () async {
      expect(await fieldErrors(() => service.createBudget(categoryId: null, limit: '100')),
          {'category': 'Choose a category'});
      await service.createBudget(categoryId: 'food', limit: '100');
      expect((await fieldErrors(() => service.createBudget(categoryId: 'food', limit: '100')))['category'],
          'This category already has a budget');
      expect((await fieldErrors(() => service.createBudget(categoryId: 'income', limit: '100')))['category'],
          'Budgets can only be set for spending categories');
      await service.createBudget(categoryId: 'travel', limit: '100');
      expect(
          (await fieldErrors(
              () => service.updateBudget(categoryId: 'food', newCategoryId: 'travel', limit: '100')))['category'],
          'This category already has a budget');
    });

    test('validation: limits', () async {
      Future<String?> limitError(String text) async =>
          (await fieldErrors(() => service.createBudget(categoryId: 'food', limit: text)))['limit'];
      expect(await limitError(''), 'Enter a monthly limit');
      expect(await limitError('abc'), 'Enter an amount like 400 or 400.50');
      expect(await limitError('10.999'), 'Enter an amount like 400 or 400.50');
      expect(await limitError('-5'), 'Enter an amount like 400 or 400.50');
      expect(await limitError('0.50'), r'The limit must be at least $1');
      expect(await limitError('2000000'), r'The limit can be at most $1,000,000');
      expect(PlaidBudgetService.parseLimit(r' $ 1,000 ').value, 1000);
    });

    test('available categories skip ones already budgeted (except the one being edited)', () async {
      await service.createBudget(categoryId: 'food', limit: '100');
      final ids = [for (final c in await service.availableCategories()) c.id];
      expect(ids, isNot(contains('food')));
      expect(ids, isNot(contains('income')));
      expect([for (final c in await service.availableCategories(editingCategoryId: 'food')) c.id], contains('food'));
    });

    test('budgets belong to the signed-in user', () async {
      await service.createBudget(categoryId: 'food', limit: '100');
      userId = 'u2';
      expect(await service.budgets(), isEmpty);
      userId = null;
      await expectLater(service.createBudget(categoryId: 'food', limit: '100'), throwsA(isA<AppException>()));
    });
  });

  group('SqliteBudgetRepository (real schema)', () {
    late Directory dir;
    late PaceDatabase db;
    setUpAll(sqfliteFfiInit);
    setUp(() {
      dir = Directory.systemTemp.createTempSync('pace_budgets');
      db = PaceDatabase(factory: databaseFactoryFfi, path: '${dir.path}/pace.db', loadAsset: (a) => File(a).readAsString());
    });
    tearDown(() async {
      await db.close();
      dir.deleteSync(recursive: true);
    });

    test('save, update, move, delete; deleting the user removes their budgets', () async {
      final users = SqliteUserAccountRepository(db);
      final budgets = SqliteBudgetRepository(db);
      final ada = await users.create(username: 'ada');
      await budgets.save(ada.id, 'food', 400);
      await budgets.save(ada.id, 'food', 425.5); // same category: updated, not duplicated
      await budgets.save(ada.id, 'travel', 600);
      expect(await budgets.limitsFor(ada.id), {'food': 425.5, 'travel': 600.0});
      await budgets.replace(ada.id, 'travel', 'shopping', 650);
      expect(await budgets.limitsFor(ada.id), {'food': 425.5, 'shopping': 650.0});
      await budgets.delete(ada.id, 'food');
      expect(await budgets.limitsFor(ada.id), {'shopping': 650.0});
      final cents = (await (await db.database).query('budgets')).single['monthly_limit_cents'];
      expect(cents, 65000);
      await users.delete(ada.id);
      expect(await (await db.database).query('budgets'), isEmpty);
    });
  });

  testWidgets('Budgets ⋮ → manage: create, edit and delete a budget; it shows in every month', (tester) async {
    final now = DateTime.now();
    final lastMonth = _monthNames[DateTime(now.year, now.month - 1).month - 1];
    final thisMonth = _monthNames[now.month - 1];
    final (:router, :store, :adaId) = await _openBudgets(tester);

    // ⋮ opens the budgets manager.
    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    expect(find.byType(ManageBudgetsScreen), findsOneWidget);
    expect(find.textContaining('No budgets yet'), findsOneWidget);

    // Create: Food & drink, $1,000.
    await tester.tap(find.text('New budget'));
    await tester.pumpAndSettle();
    expect(find.text('New budget'), findsOneWidget);
    await tester.tap(find.text('Create budget')); // nothing chosen yet → inline errors
    await tester.pumpAndSettle();
    expect(find.text('Choose a category'), findsOneWidget);
    await tester.tap(find.text('Food & drink'));
    await tester.pump();
    await tester.enterText(find.widgetWithText(TextField, 'Monthly limit'), '1000');
    await tester.tap(find.text('Create budget'));
    await tester.pumpAndSettle();
    expect(find.byType(ManageBudgetsScreen), findsOneWidget);
    expect(find.text(r'$1,000.00 a month'), findsOneWidget);
    expect(await tester.runAsync(() => store.limitsFor(adaId)), {'food': 1000.0});

    // Back on Budgets, the budget is there this month and last month.
    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(find.text('Food & drink'), findsOneWidget);
    await tester.tap(find.text(lastMonth));
    await tester.pumpAndSettle();
    expect(find.text('Food & drink'), findsOneWidget);
    expect(find.text(r'$0.00 of $1,000.00'), findsOneWidget); // no bank linked: nothing spent
    await tester.tap(find.text(thisMonth));
    await tester.pumpAndSettle();

    // Edit: $1,200.
    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    await tester.tap(find.byIcon(Icons.edit_outlined));
    await tester.pumpAndSettle();
    expect(find.text('Edit budget'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Monthly limit'), '1200');
    await tester.tap(find.text('Save changes'));
    await tester.pumpAndSettle();
    expect(find.text(r'$1,200.00 a month'), findsOneWidget);
    expect(await tester.runAsync(() => store.limitsFor(adaId)), {'food': 1200.0});

    // Delete (with confirmation).
    await tester.tap(find.byIcon(Icons.delete_outline));
    await tester.pumpAndSettle();
    expect(find.text('Delete the Food & drink budget?'), findsOneWidget);
    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();
    expect(find.text(r'$1,200.00 a month'), findsNothing);
    expect(find.textContaining('No budgets yet'), findsOneWidget);

    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(router.delegate.current, AppRoute.budgets);
    expect(find.text('Food & drink'), findsNothing);
    expect(await tester.runAsync(() => store.limitsFor(adaId)), isEmpty);
    router.dispose();
  });
}
