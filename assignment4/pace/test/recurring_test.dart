import 'dart:io' show Directory, File;
import 'package:flutter/material.dart' show Icons, Scrollable, TextField;
import 'package:flutter_test/flutter_test.dart'
    show
        closeTo,
        contains,
        expect,
        expectLater,
        find,
        findsNothing,
        findsOneWidget,
        group,
        hasLength,
        isA,
        isEmpty,
        isNot,
        isTrue,
        setUp,
        setUpAll,
        tearDown,
        test,
        testWidgets,
        throwsA;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/models/bill.dart' show RecurringItem, SubscriptionStatus;
import 'package:pace_app/models/recurring.dart' show RecurringAction, RecurringExpense, RecurringFrequency, RecurringKind;
import 'package:pace_app/repositories/bank_data_repository.dart' show PlaidBankDataRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/recurring_expense_repository.dart' show InMemoryRecurringExpenseRepository;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/repositories/sqlite_recurring_expense_repository.dart' show SqliteRecurringExpenseRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:pace_app/repositories/transaction_annotation_repository.dart' show InMemoryTransactionAnnotationRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/plaid_bill_service.dart' show PlaidBillService;
import 'package:pace_app/services/recurring_schedule.dart' show RecurringSchedule;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/bill_form_screen.dart' show BillFormScreen;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show databaseFactoryFfi, sqfliteFfiInit;
import 'helpers.dart' show createAda, fieldErrors, NoGoogle;

void main() {
  group('RecurringSchedule', () {
    test('monthly payments keep their day, the 31st falls on the last day of shorter months', () {
      final jan31 = DateTime(2026, 1, 31);
      expect(RecurringSchedule.occurrence(jan31, RecurringFrequency.monthly, 1), DateTime(2026, 2, 28));
      expect(RecurringSchedule.occurrence(jan31, RecurringFrequency.monthly, 2), DateTime(2026, 3, 31)); // no drift
      expect(RecurringSchedule.occurrence(DateTime(2024, 2, 29), RecurringFrequency.yearly, 1), DateTime(2025, 2, 28));
    });

    test('first payment on or after a day', () {
      final first = DateTime(2026, 9, 5);
      expect(RecurringSchedule.firstOnOrAfter(first, RecurringFrequency.monthly, DateTime(2026, 10, 12)), DateTime(2026, 11, 5));
      expect(RecurringSchedule.firstOnOrAfter(first, RecurringFrequency.weekly, DateTime(2026, 9, 5)), first);
      expect(RecurringSchedule.firstOnOrAfter(first, RecurringFrequency.biweekly, DateTime(2026, 9, 6)), DateTime(2026, 9, 19));
      expect(RecurringSchedule.firstOnOrAfter(DateTime(2026, 12, 1), RecurringFrequency.yearly, DateTime(2026, 10, 12)),
          DateTime(2026, 12, 1)); // in the future: itself
    });

    test('monthly cost of each frequency', () {
      expect(RecurringSchedule.perMonth(RecurringFrequency.weekly), closeTo(4.333, 0.001));
      expect(RecurringSchedule.perMonth(RecurringFrequency.yearly), closeTo(1 / 12, 1e-9));
      expect(RecurringSchedule.perMonth(RecurringFrequency.monthly), 1);
    });
  });

  group('PlaidBillService: recurring expenses the user adds', () {
    late InMemoryRecurringExpenseRepository store;
    late PlaidBillService bills;
    String? userId;
    final today = DateTime(2026, 10, 12);

    setUp(() {
      store = InMemoryRecurringExpenseRepository();
      userId = 'u1';
      final noBank = PlaidBankDataRepository(
        plaid: SandboxPlaidApi(clientId: 'x', secret: 'y'),
        banks: InMemoryLinkedBankRepository(), // nothing linked: only the user's own
        currentUserId: () => userId,
      );
      bills = PlaidBillService(noBank, InMemoryTransactionAnnotationRepository(),
          recurring: store, currentUserId: () => userId, now: () => today);
    });

    Future<void> addNetflix() => bills.saveRecurring(
          name: ' Netflix ',
          amount: r'$15.99',
          frequency: RecurringFrequency.monthly,
          firstDue: DateTime(2026, 9, 20),
          categoryId: 'entertainment',
          kind: RecurringKind.subscription,
        );

    test('validation: every field is checked', () async {
      final errors = await fieldErrors(() => bills.saveRecurring(
            name: '  ',
            amount: 'abc',
            frequency: null,
            firstDue: null,
            categoryId: 'income',
            kind: null,
          ));
      expect(errors.keys.toSet(), {'name', 'amount', 'frequency', 'firstDue', 'category', 'kind'});
      expect(errors['amount'], 'Enter an amount like 400 or 400.50');
      expect((await fieldErrors(() => bills.saveRecurring(
                name: 'x' * 41,
                amount: '',
                frequency: RecurringFrequency.semiMonthly, // not one the user can pick
                firstDue: today,
                categoryId: 'food',
                kind: RecurringKind.bill,
              )))
          .keys
          .toSet(), {'name', 'amount', 'frequency'});
    });

    test('added: tracked with its next payment, monthly cost, kind and actions; changes announced', () async {
      var changes = 0;
      final sub = bills.changes.listen((_) => changes++);
      await addNetflix();

      final r = await bills.getRecurring();
      final item = r.items.single;
      expect(item.name, 'Netflix');
      expect(item.isManual, isTrue);
      expect(item.kind, RecurringKind.subscription);
      expect(item.detailLine, r'$15.99 monthly · next Oct 20');
      expect(r.monthlyTotal, closeTo(15.99, 0.001));
      expect(r.subscriptionsMonthly, closeTo(15.99, 0.001));
      expect(bills.actionsFor(item), [RecurringAction.details, RecurringAction.pause, RecurringAction.edit, RecurringAction.delete]);

      final upcoming = await bills.upcomingWithDates();
      expect(upcoming.single.due, DateTime(2026, 10, 20));
      expect(upcoming.single.bill.subtitle, 'Due Oct 20');

      final detail = await bills.getDetail(item.id);
      expect(detail.sourceLabel, 'Added by you');
      expect(detail.yearlyLabel, r'$191.88 a year');
      expect(detail.nextLabel, 'Next payment October 20, 2026');
      expect(detail.canMarkPaid, isTrue);
      expect(detail.history, isEmpty);

      await Future<void>.delayed(Duration.zero);
      expect(changes, 1);
      await sub.cancel();
    });

    test('mark paid moves it to the next payment; pausing leaves it out of the totals', () async {
      await addNetflix();
      final id = (await bills.getRecurring()).items.single.id;
      await bills.markPaid(id);
      expect((await bills.getDetail(id)).nextLabel, 'Next payment November 20, 2026');
      expect(await bills.upcomingWithDates(), isEmpty); // Nov 20 is beyond the next 30 days

      await bills.setSubscriptionPaused(id: id, paused: true);
      final r = await bills.getRecurring();
      expect(r.monthlyTotal, 0);
      expect(r.items.single.isPaused, isTrue);
      expect(bills.actionsFor(r.items.single), contains(RecurringAction.resume));
    });

    test('edit and delete; the form is pre-filled', () async {
      await addNetflix();
      final id = (await bills.getRecurring()).items.single.id;
      final options = await bills.formOptions(editingId: id);
      expect(options.editing!.name, 'Netflix');
      expect(options.frequencies, RecurringFrequency.choosable);
      expect(options.categories.map((c) => c.id), isNot(contains('income')));

      await bills.saveRecurring(
        editingId: id,
        name: 'Rent',
        amount: '1,500',
        frequency: RecurringFrequency.monthly,
        firstDue: DateTime(2026, 11, 1),
        categoryId: 'utilities',
        kind: RecurringKind.bill,
      );
      final r = await bills.getRecurring();
      expect(r.items.single.name, 'Rent');
      expect(r.items.single.kind, RecurringKind.bill);
      expect(r.subscriptionsMonthly, 0);
      expect(r.monthlyTotal, 1500);

      await bills.deleteRecurring(id);
      expect((await bills.getRecurring()).items, isEmpty);
      await expectLater(bills.getDetail(id), throwsA(isA<AppException>()));
    });

    test('belongs to the signed-in user; signed out it can\'t be added', () async {
      await addNetflix();
      userId = 'u2';
      expect((await bills.getRecurring()).items, isEmpty);
      userId = null;
      await expectLater(addNetflix(), throwsA(isA<AppException>()));
    });

    test('bills the bank detected can\'t be edited or deleted', () async {
      await expectLater(bills.deleteRecurring('plaid-stream-1'), throwsA(isA<AppException>()));
      expect(
          bills.actionsFor(const RecurringItem(
              id: 's', name: 'Gym', iconKey: 'fitness', detailLine: '', yearlyLine: '', status: SubscriptionStatus.active)),
          [RecurringAction.details, RecurringAction.pause]);
    });
  });

  group('SqliteRecurringExpenseRepository (real schema)', () {
    late Directory dir;
    late PaceDatabase db;
    setUpAll(sqfliteFfiInit);
    setUp(() {
      dir = Directory.systemTemp.createTempSync('pace_recurring');
      db = PaceDatabase(factory: databaseFactoryFfi, path: '${dir.path}/pace.db', loadAsset: (a) => File(a).readAsString());
    });
    tearDown(() async {
      await db.close();
      dir.deleteSync(recursive: true);
    });

    test('save, update, list, delete; deleting the user removes theirs', () async {
      final users = SqliteUserAccountRepository(db);
      final repo = SqliteRecurringExpenseRepository(db);
      final ada = await users.create(email: 'ada@example.com');
      final saved = await repo.save(
        ada.id,
        RecurringExpense(
          name: 'Gym',
          amount: 45.5,
          frequency: RecurringFrequency.monthly,
          firstDue: DateTime(2026, 10, 3),
          categoryId: 'personal',
          kind: RecurringKind.subscription,
        ),
      );
      expect(saved.id, isNot(isEmpty));
      await repo.save(
        ada.id,
        RecurringExpense(
          id: saved.id,
          name: 'Gym',
          amount: 49.99,
          frequency: RecurringFrequency.yearly,
          firstDue: DateTime(2027, 1, 1),
          categoryId: 'personal',
          kind: RecurringKind.subscription,
        ),
      );
      final list = await repo.listFor(ada.id);
      expect(list, hasLength(1));
      expect(list.single.amount, 49.99);
      expect(list.single.frequency, RecurringFrequency.yearly);
      expect(list.single.firstDue, DateTime(2027, 1, 1));
      final row = (await (await db.database).query('recurring_expenses')).single;
      expect(row['amount_cents'], 4999);
      expect(row['first_due'], '2027-01-01');

      await users.delete(ada.id);
      expect(await (await db.database).query('recurring_expenses'), isEmpty);
    });
  });

  testWidgets('Bills → + → add a subscription → it\'s listed → its menu deletes it', (tester) async {
    final services = demoServices(
      accounts: InMemoryUserAccountRepository(),
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
      banks: InMemoryLinkedBankRepository(),
    );
    await tester.runAsync(() => createAda(services.auth));
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.billsRecurring]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(find.textContaining('Nothing tracked yet'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.add));
    await tester.pumpAndSettle();
    expect(find.text('New recurring expense'), findsOneWidget);
    final form = find.descendant(of: find.byType(BillFormScreen), matching: find.byType(Scrollable)).first;

    // Nothing filled in: inline errors.
    await tester.scrollUntilVisible(find.text('Start tracking'), 200, scrollable: form);
    await tester.tap(find.text('Start tracking'));
    await tester.pumpAndSettle();
    expect(find.text('Choose a category'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Enter a name'), -200, scrollable: form);

    await tester.enterText(find.widgetWithText(TextField, 'Name'), 'Netflix');
    await tester.enterText(find.widgetWithText(TextField, 'Amount each time'), '15.99');
    await tester.scrollUntilVisible(find.text('Subscription'), 200, scrollable: form);
    await tester.tap(find.text('Subscription'));
    await tester.pump();
    await tester.scrollUntilVisible(find.text('Choose a date'), 200, scrollable: form);
    await tester.tap(find.text('Choose a date'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('OK')); // today
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Entertainment'), 200, scrollable: form);
    await tester.ensureVisible(find.text('Entertainment'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Entertainment'));
    await tester.pump();
    await tester.scrollUntilVisible(find.text('Start tracking'), 200, scrollable: form);
    await tester.ensureVisible(find.text('Start tracking'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Start tracking'));
    await tester.pumpAndSettle();

    expect(router.delegate.current, AppRoute.billsRecurring);
    expect(find.text('SUBSCRIPTIONS'), findsOneWidget);
    expect(find.text('Netflix'), findsOneWidget);
    expect(find.textContaining('added by you'), findsOneWidget);

    await tester.tap(find.byIcon(Icons.more_vert));
    await tester.pumpAndSettle();
    expect(find.text('Edit'), findsOneWidget);
    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();
    expect(find.text('Stop tracking Netflix?'), findsOneWidget);
    await tester.tap(find.text('Delete'));
    await tester.pumpAndSettle();
    expect(find.text('Netflix'), findsNothing);
    expect(find.textContaining('Nothing tracked yet'), findsOneWidget);
    router.dispose();
  });
}
