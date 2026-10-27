import 'package:flutter/material.dart' show DropdownButtonFormField, TextField;
import 'package:flutter_test/flutter_test.dart'
    show contains, expect, find, findsOneWidget, group, isFalse, isNot, isNotNull, isNull, isTrue, setUp, test, testWidgets, SemanticsHandle, androidTapTargetGuideline, iOSTapTargetGuideline, labeledTapTargetGuideline, textContrastGuideline, meetsGuideline, expectLater, WidgetTester;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/accounts_screen.dart';
import 'package:pace_app/views/screens/add_account_screen.dart';
import 'package:pace_app/views/screens/bill_detail_screen.dart';
import 'package:pace_app/views/screens/bill_form_screen.dart';
import 'package:pace_app/views/screens/bills_recurring_screen.dart';
import 'package:pace_app/views/screens/bills_upcoming_screen.dart';
import 'package:pace_app/views/screens/budget_category_screen.dart';
import 'package:pace_app/views/screens/budget_form_screen.dart';
import 'package:pace_app/views/screens/budgets_screen.dart';
import 'package:pace_app/views/screens/cash_flow_screen.dart';
import 'package:pace_app/views/screens/connect_bank_screen.dart';
import 'package:pace_app/views/screens/create_account_screen.dart' show CreateAccountScreen;
import 'package:pace_app/views/screens/dashboard_screen.dart';
import 'package:pace_app/views/screens/expected_income_form_screen.dart';
import 'package:pace_app/views/screens/goal_form_screen.dart';
import 'package:pace_app/views/screens/manage_budgets_screen.dart';
import 'package:pace_app/views/screens/notifications_screen.dart';
import 'package:pace_app/views/screens/onboarding_priorities_screen.dart';
import 'package:pace_app/views/screens/profile_screen.dart';
import 'package:pace_app/views/screens/reset_password_screen.dart';
import 'package:pace_app/views/screens/savings_goals_screen.dart';
import 'package:pace_app/views/screens/settings_screen.dart';
import 'package:pace_app/views/screens/sign_in_screen.dart';
import 'package:pace_app/views/screens/spending_category_screen.dart';
import 'package:pace_app/views/screens/spending_screen.dart';
import 'package:pace_app/views/screens/statement_export_screen.dart';
import 'package:pace_app/views/screens/transaction_detail_screen.dart';
import 'package:pace_app/views/screens/transactions_screen.dart';
import 'package:pace_app/views/screens/trends_screen.dart';
import 'sandbox.dart' show openSandboxApp, SandboxReplay;
import 'package:flutter_test/flutter_test.dart'
    show
        ChainedFinder,
        closeTo,
        Plurality,
        WidgetTester,
        contains,
        expect,
        find,
        findsNothing,
        findsOneWidget,
        findsWidgets,
        isEmpty,
        isNotEmpty,
        startsWith,
        setUp,
        testWidgets;

void main() {
    late SandboxReplay plaid;
  setUp(() => plaid = SandboxReplay());

    group('AndroidTapTargetGuideline', () {
  testWidgets('App meets androidTapTargetGuideline', (WidgetTester tester) async {
          final app = await openSandboxApp(tester, plaid, const [AppRoute.home]);
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(PaceApp(router: app.router));
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
/*
  testWidgets('AccountsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(AccountsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });

    testWidgets('AddAccountScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(AddAccountScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });

    testWidgets('BillDetailScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BillDetailScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
  
    testWidgets('BillFormScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BillFormScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
  
    testWidgets('BillsRecurringScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BillsRecurringScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('BillsUpcomingScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BillsUpcomingScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('BudgetCategoryScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BudgetCategoryScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('BudgetFormScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BudgetFormScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('BudgetsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(BudgetsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('CashFlowScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(CashFlowScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('ConnectBankScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(const ConnectBankScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('CreateAccountScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(const CreateAccountScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('DashboardScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(DashboardScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('ExpectedIncomeFormScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(ExpectedIncomeFormScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('GoalFormScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(GoalFormScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('ManageBudgetsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(ManageBudgetsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
    testWidgets('NotificationsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(NotificationsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('OnboardingPrioritiesScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(OnboardingPrioritiesScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('ProfileScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(ProfileScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('ResetPasswordScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(ResetPasswordScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('SavingsGoalsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(SavingsGoalsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('SettingsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(SettingsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('SignInScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(const SignInScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('SpendingCategoryScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(SpendingCategoryScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('SpendingScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(SpendingScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('StatementExportScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(StatementExportScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('TransactionDetailScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(TransactionDetailScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('TransactionsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(TransactionsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
      testWidgets('TrendsScreen meets androidTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(TrendsScreen());
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
    handle.dispose();
  });
*/
});

group('labeledTapTargetGuideline', (){

  testWidgets('App meets labeledTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
    handle.dispose();
  });

});


group('iOSTapTargetGuideline', () {
    testWidgets('App meets iOSTapTargetGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
    handle.dispose();
  });
});

group('textContrastGuideline', () {
    testWidgets('App meets textContrastGuideline', (WidgetTester tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    await expectLater(tester, meetsGuideline(textContrastGuideline));
    handle.dispose();
  });

});


}
