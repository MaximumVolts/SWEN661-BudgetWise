// End-to-end tests of the app's major features: each opens the real app (services, controllers,
// views, navigation) on the Plaid sandbox replay and uses a feature the way a person would.
import 'package:flutter/material.dart' show AxisDirection, Element, Icons, Scrollable, SnackBar, Switch, Text, TextField;
import 'package:flutter_test/flutter_test.dart' show Finder;
import 'package:flutter_test/flutter_test.dart'
    show
        ChainedFinder,
        Plurality,
        WidgetTester,
        contains,
        expect,
        find,
        findsNothing,
        findsOneWidget,
        findsWidgets,
        isNotEmpty,
        setUp,
        testWidgets;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute, AppRouteName;
import 'package:pace_app/views/widgets/widgets.dart' show PaceNavBar;
import 'package:pace_app/views/screens/bill_detail_screen.dart' show BillDetailScreen;
import 'package:pace_app/views/screens/budget_category_screen.dart' show BudgetCategoryScreen;
import 'package:pace_app/views/screens/cash_flow_screen.dart' show CashFlowScreen;
import 'package:pace_app/views/screens/notifications_screen.dart' show NotificationsScreen;
import 'package:pace_app/views/screens/spending_screen.dart' show SpendingScreen;
import 'package:pace_app/views/screens/transaction_detail_screen.dart' show TransactionDetailScreen;
import 'package:pace_app/views/screens/trends_screen.dart' show TrendsScreen;
import 'sandbox.dart' show openSandboxApp, SandboxReplay;

/// The vertical lists on screen; the current page's is the last (a sheet can leave the page below visible).
final _pageList = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.down);

/// [parent]'s matches, leaving out those in the bottom nav bar (which repeats labels / icons
/// like "Bills" or the calendar icon).
class _OffNavBar extends ChainedFinder {
  _OffNavBar(super.parent);

  @override
  Iterable<Element> filter(Iterable<Element> parentCandidates) =>
      parentCandidates.where((e) => e.findAncestorWidgetOfExactType<PaceNavBar>() == null);

  @override
  String describeMatch(Plurality plurality) => '${parent.describeMatch(plurality)} (outside the nav bar)';

  @override
  String get description => describeMatch(Plurality.many);
}

Finder _onPage(Finder target) => _OffNavBar(target);

/// Finds [target] on the current page (scrolling down, then up, as needed) and taps it.
Future<void> tapOn(WidgetTester tester, Finder target) async {
  final f = _onPage(target);
  if (f.evaluate().isEmpty) {
    try {
      await tester.scrollUntilVisible(f, 200, scrollable: _pageList.last);
    } on StateError {
      await tester.scrollUntilVisible(f, -200, scrollable: _pageList.last);
    }
  }
  await tester.ensureVisible(f.first);
  await tester.pumpAndSettle();
  await tester.tap(f.first);
  await tester.pumpAndSettle();
}

Future<void> tapText(WidgetTester tester, String text) => tapOn(tester, find.text(text));

/// A "not implemented yet" message is showing.
void expectToast(String containing) => expect(find.descendant(of: find.byType(SnackBar), matching: find.textContaining(containing)), findsOneWidget);

void main() {
  late SandboxReplay plaid;
  setUp(() => plaid = SandboxReplay());
  journeys();

  testWidgets('Spending: ranges, highlighting a bar, a category', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.spending]);
    expect(find.byType(SpendingScreen), findsOneWidget);
    await tapText(tester, '3 months');
    await tapText(tester, 'Year');
    await tapText(tester, 'Month');
    await tapOn(tester, find.byIcon(Icons.calendar_today_outlined)); // date range picker: not built yet
    expectToast('not implemented');
    await tapText(tester, 'Food & drink'); // category breakdown: not built yet
    expectToast('Spending by category');
    expect(app.router.delegate.current.name, AppRouteName.spending);
    app.router.dispose();
  });

  testWidgets('Notifications: filters, mark all read, an action and opening the target', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.notifications]);
    expect(find.byType(NotificationsScreen), findsOneWidget);
    await tapText(tester, 'Bills');
    await tapText(tester, 'Budgets');
    await tapText(tester, 'Goals');
    await tapOn(tester, find.textContaining('All · '));
    await tapText(tester, 'Mark all read');
    expect(find.textContaining('New · '), findsNothing);
    if (find.text('View bill').evaluate().isNotEmpty) {
      await tapText(tester, 'View bill');
      expect(app.router.delegate.current.name, AppRouteName.billDetail);
    }
    app.router.dispose();
  });

  testWidgets('Cash flow: projection ranges and income scenarios', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.cashFlow]);
    expect(find.byType(CashFlowScreen), findsOneWidget);
    expect(find.text('Cash Flow Projection'), findsOneWidget);
    for (final label in ['60 days', '90 days', '30 days', 'High', 'Low', 'Expected']) {
      await tapText(tester, label);
    }
    await tapText(tester, 'Add expected income');
    expectToast('Add expected income');
    await tapOn(tester, find.byIcon(Icons.arrow_back));
    expect(app.router.delegate.current, AppRoute.home);
    app.router.dispose();
  });

  testWidgets('Trends: the list and opening one', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.trends]);
    expect(find.byType(TrendsScreen), findsOneWidget);
    expect(find.text('Plaid TrendScore'), findsOneWidget);
    final first = find.textContaining('spending');
    if (first.evaluate().isNotEmpty) {
      await tapOn(tester, first);
      expectToast('Trend details');
    }
    app.router.dispose();
  });

  testWidgets('Budget category: details, a transaction, edit', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.budgets],
        seed: (app) => app.budgets.save(app.userId, 'food', 400));
    await tapText(tester, 'Food & drink');
    expect(find.byType(BudgetCategoryScreen), findsOneWidget);
    expect(find.text('RECENT TRANSACTIONS'), findsOneWidget);
    expect(find.text('Spent in October'), findsOneWidget);

    await tapText(tester, 'Edit');
    expect(find.text('Edit budget'), findsOneWidget);
    await tapOn(tester, find.byIcon(Icons.arrow_back));
    expect(find.byType(BudgetCategoryScreen), findsOneWidget);

    await tapText(tester, "McDonald's");
    expect(find.byType(TransactionDetailScreen), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('Bills: upcoming → a bill → mark paid, pause, a payment; recurring tab', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.bills]);
    expect(find.text('Upcoming'), findsOneWidget);
    expect(find.textContaining('Due'), findsWidgets);

    await tapText(tester, 'Madison Bicycle Center');
    expect(find.byType(BillDetailScreen), findsOneWidget);
    final name = app.router.delegate.current.params['id']!;
    expect(name, isNotEmpty);
    if (find.text('Mark next payment as paid').evaluate().isNotEmpty) {
      await tapText(tester, 'Mark next payment as paid');
    }
    await tapText(tester, 'Pause tracking');
    expect(find.text('Resume tracking'), findsOneWidget);
    expect(find.textContaining('Paused'), findsOneWidget);
    await tapText(tester, 'Resume tracking');
    expect(find.text('Pause tracking'), findsOneWidget);

    await tapOn(tester, find.textContaining(', 2026').last); // a payment, not the "Next payment" line
    expect(find.byType(TransactionDetailScreen), findsOneWidget);
    app.router.delegate.pop();
    app.router.delegate.pop();
    await tester.pumpAndSettle();

    await tapText(tester, 'Recurring');
    expect(app.router.delegate.current.name, AppRouteName.billsRecurring);
    expect(find.text('SUBSCRIPTIONS'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('BILLS'), 200, scrollable: _pageList.last);
    expect(find.text('BILLS'), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('Transaction detail: change categories and see them saved', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.transactions]);
    await tapText(tester, 'Uber');
    expect(find.byType(TransactionDetailScreen), findsOneWidget);
    expect(find.text('Transportation'), findsWidgets);

    await tapText(tester, 'Travel'); // add a second category
    final screen = tester.widget<TransactionDetailScreen>(find.byType(TransactionDetailScreen));
    expect(screen.selectedCategoryIds ?? screen.transaction.selectedCategoryIds, contains('travel'));

    // Saved: reopening the transaction shows both categories.
    final id = app.router.delegate.current.params['id']!;
    app.router.delegate.pop();
    await tester.pumpAndSettle();
    app.router.delegate.push(AppRoute.transactionDetail(id));
    await tester.pumpAndSettle();
    final reopened = tester.widget<TransactionDetailScreen>(find.byType(TransactionDetailScreen));
    expect(reopened.transaction.selectedCategoryIds, contains('travel'));

    await tapText(tester, 'Add a note');
    expectToast('Add note');
    app.router.dispose();
  });

  testWidgets('Savings goals: empty state and adding', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.goals]);
    expect(find.text('Savings Goals'), findsOneWidget);
    expect(find.text('No savings goals yet'), findsOneWidget);
    await tapOn(tester, find.byIcon(Icons.add));
    expectToast('Add goal');
    app.router.dispose();
  });

  testWidgets('Home: every section links where it should', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home]);
    Future<void> expectOpens(String action, AppRouteName route) async {
      await tapText(tester, action);
      expect(app.router.delegate.current.name, route, reason: action);
      app.router.delegate.openTab(AppRoute.home);
      await tester.pumpAndSettle();
    }

    await expectOpens('See budget', AppRouteName.budgets);
    await expectOpens('See all bills', AppRouteName.bills);
    await expectOpens('Add account', AppRouteName.connectBank);
    if (find.text('See all trends').evaluate().isNotEmpty) await expectOpens('See all trends', AppRouteName.trends);

    await tapOn(tester, find.byIcon(Icons.settings_outlined));
    expect(app.router.delegate.current, AppRoute.settings);
    app.router.dispose();
  });

  testWidgets('Accounts: menu, linking another account, opening an account', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.accounts]);
    await tapOn(tester, find.byIcon(Icons.more_vert));
    expectToast('Menu');
    await tapText(tester, 'Plaid Checking');
    expectToast('Account details');
    await tapText(tester, 'Link another account');
    expect(app.router.delegate.current, AppRoute.connectBank);
    app.router.dispose();
  });

  testWidgets('Settings: toggles, pickers and links', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.settings]);
    await tapText(tester, 'Theme');
    expectToast('Theme picker');
    await tapText(tester, 'Bill reminders');
    expectToast('Bill reminder picker');
    await tapText(tester, 'Budget categories');
    expect(app.router.delegate.current, AppRoute.budgetCategoriesSettings);
    app.router.delegate.pop();
    await tester.pumpAndSettle();
    await tapText(tester, 'Connected accounts');
    expect(app.router.delegate.current, AppRoute.accounts);
    app.router.delegate.pop();
    await tester.pumpAndSettle();

    // Every toggle flips (and stays flipped: the screen reloads what was saved).
    await tester.scrollUntilVisible(find.text('Budget alerts'), 200, scrollable: _pageList.last);
    final switches = find.byType(Switch);
    List<bool> values() => [for (final s in tester.widgetList<Switch>(switches)) s.value];
    final before = values();
    for (var i = 0; i < before.length; i++) {
      await tester.ensureVisible(switches.at(i));
      await tester.pumpAndSettle();
      await tester.tap(switches.at(i));
      await tester.pumpAndSettle();
    }
    expect(values(), [for (final v in before) !v]);

    await tapText(tester, 'Sign out');
    expect(app.router.delegate.current, AppRoute.signIn);
    expect(find.byType(Text), findsWidgets);
    app.router.dispose();
  });
}

void journeys() {
  late SandboxReplay plaid;
  setUp(() => plaid = SandboxReplay());

  testWidgets('Transactions: filter by category, date and account from the picker sheets', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.transactions]);
    await tapText(tester, 'Category');
    expect(find.text('Filter by category'), findsOneWidget);
    await tester.tap(find.text('Travel').last);
    await tester.pumpAndSettle();
    expect(find.text('Uber'), findsNothing); // only travel now
    expect(find.text('United Airlines'), findsWidgets);

    await tapText(tester, 'Date');
    await tester.tap(find.text('Last 7 days'));
    await tester.pumpAndSettle();
    expect(find.text('Last 7 days'), findsOneWidget); // the filter button now says so

    await tapText(tester, 'Travel'); // the category filter button: back to all
    await tester.tap(find.text('All categories').last);
    await tester.pumpAndSettle();
    expect(find.text('Category'), findsOneWidget);

    await tapText(tester, 'All accounts');
    expect(find.text('Filter by account'), findsOneWidget);
    await tester.tap(find.textContaining('Plaid Checking').last);
    await tester.pumpAndSettle();
    expect(find.textContaining('Plaid Checking'), findsWidgets);
    app.router.dispose();
  });

  testWidgets('Budget form: delete from the edit page', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.budgets],
        seed: (app) => app.budgets.save(app.userId, 'food', 400));
    await tapText(tester, 'Food & drink');
    await tapText(tester, 'Edit');
    await tapText(tester, 'Delete budget');
    await tester.tap(find.text('Delete').last);
    await tester.pumpAndSettle();
    expect(app.router.delegate.current, AppRoute.budgets); // form and the deleted category both closed
    expect(find.textContaining('No budgets yet'), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('A page without a design yet, opened by URL, says so', (tester) async {
    final app = await openSandboxApp(tester, plaid, [AppRoute.home, AppRoute.accountDetail('acc-1')]);
    expect(find.text('Account details is not implemented yet.'), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('First run: onboarding → connect the sandbox bank → Home with its accounts', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.onboarding], linkBank: false);
    expect(find.text('Set your priorities'), findsOneWidget);
    await tapText(tester, 'Stick to a budget');
    await tapText(tester, 'Steady paycheck');
    await tapText(tester, 'Continue');
    expect(app.router.delegate.current, AppRoute.connectBank);
    expect(find.text('Test bank only'), findsOneWidget);

    await tapText(tester, 'Connect test bank with Plaid');
    expect(app.router.delegate.current, AppRoute.home);
    expect(plaid.calls('/sandbox/public_token/create'), 1);
    expect(plaid.calls('/item/public_token/exchange'), 1);

    app.router.delegate.push(AppRoute.accounts);
    await tester.pumpAndSettle();
    expect(find.text('Plaid Checking'), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('Notifications with alerts: overdue bill → mark paid / view it, over-budget alert', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.notifications],
        today: DateTime(2026, 10, 21, 9), // the Oct 20 bills are now overdue
        seed: (app) => app.budgets.save(app.userId, 'food', 1)); // and Food & drink is over its limit
    expect(find.textContaining('is overdue'), findsWidgets);
    expect(find.textContaining('New · '), findsWidgets);

    await tapText(tester, 'Budgets');
    expect(find.textContaining('Food & drink is'), findsOneWidget);
    await tapOn(tester, find.textContaining('Food & drink is'));
    expect(app.router.delegate.current.name, AppRouteName.budgetCategory);
    app.router.delegate.push(AppRoute.notifications);
    await tester.pumpAndSettle();

    await tapText(tester, 'Mark as paid');
    await tapText(tester, 'View bill');
    expect(app.router.delegate.current.name, AppRouteName.billDetail);
    app.router.dispose();
  });

  testWidgets('Profile: rename, remove the bank connection, connect it again', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home, AppRoute.settings, AppRoute.profile]);
    await tester.enterText(find.byType(TextField).first, 'Ada Lovelace');
    await tapText(tester, 'Save changes');
    expect(find.text('Profile saved'), findsOneWidget);

    await tapText(tester, 'Remove connection');
    await tester.tap(find.text('Remove').last); // confirm
    await tester.pumpAndSettle();
    expect(plaid.calls('/item/remove'), 1);
    expect(find.text('Connect test bank with Plaid'), findsOneWidget);

    await tapText(tester, 'Connect test bank with Plaid');
    expect(find.text('Remove connection'), findsOneWidget);
    app.router.dispose();
  });

  testWidgets('Home: rows open their details; sync; tools', (tester) async {
    final app = await openSandboxApp(tester, plaid, const [AppRoute.home],
        seed: (app) => app.budgets.save(app.userId, 'shopping', 600));
    Future<void> opens(Finder f, AppRouteName route) async {
      await tapOn(tester, f);
      expect(app.router.delegate.current.name, route);
      app.router.delegate.openTab(AppRoute.home);
      await tester.pumpAndSettle();
    }

    await opens(find.text('Shopping'), AppRouteName.budgetCategory);
    await opens(find.text('Uber'), AppRouteName.transactionDetail);
    await opens(find.text('Madison Bicycle Center'), AppRouteName.billDetail);
    await tapOn(tester, find.byIcon(Icons.notifications_none));
    expect(app.router.delegate.current, AppRoute.notifications);
    app.router.dispose();
  });
}
