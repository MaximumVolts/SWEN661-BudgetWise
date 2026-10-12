import 'package:flutter/widgets.dart' show Widget;
import '../../controllers/base_controller.dart' show BaseController;
import '../accounts_view.dart' show AccountsView;
import '../bills_recurring_view.dart' show BillsRecurringView;
import '../bills_upcoming_view.dart' show BillsUpcomingView;
import '../budget_category_view.dart' show BudgetCategoryView;
import '../budgets_view.dart' show BudgetsView;
import '../cash_flow_view.dart' show CashFlowView;
import '../connect_bank_view.dart' show ConnectBankView;
import '../dashboard_view.dart' show DashboardView;
import '../notifications_view.dart' show NotificationsView;
import '../onboarding_priorities_view.dart' show OnboardingPrioritiesView;
import '../placeholder_view.dart' show PlaceholderView;
import '../savings_goals_view.dart' show SavingsGoalsView;
import '../settings_view.dart' show SettingsView;
import '../sign_in_view.dart' show SignInView;
import '../spending_view.dart' show SpendingView;
import '../transaction_detail_view.dart' show TransactionDetailView;
import '../transactions_view.dart' show TransactionsView;
import '../trends_view.dart' show TrendsView;
import '../widgets/controller_scope.dart' show ControllerOwner;
import '../../controllers/app_dependencies.dart' show AppDependencies;
import 'app_route.dart' show AppRoute, AppRouteName;

/// Route table: which View (and controller) renders each [AppRoute].
/// Routes without a designed screen fall through to [PlaceholderView]; replace those cases as you build them.
class AppPages {
  final AppDependencies deps;
  const AppPages(this.deps);

  /// Creates a controller for the page and ties its lifetime to the page.
  Widget _page<C extends BaseController>(C controller, Widget Function(C c) view) =>
      ControllerOwner(controller: controller, child: view(controller));

  Widget build(AppRoute r) {
    switch (r.name) {
      case AppRouteName.signIn:
        return _page(deps.signIn(), (c) => SignInView(controller: c));
      case AppRouteName.onboarding:
        return _page(deps.onboardingFlow(), (c) => OnboardingPrioritiesView(controller: c));
      case AppRouteName.connectBank:
        return _page(deps.connectBank(), (c) => ConnectBankView(controller: c));
      case AppRouteName.home:
        return _page(deps.home(), (c) => DashboardView(controller: c));
      case AppRouteName.transactions:
        return _page(deps.transactionList(), (c) => TransactionsView(controller: c));
      case AppRouteName.transactionDetail:
        return _page(deps.transactionDetail(r.params['id']!), (c) => TransactionDetailView(controller: c));
      case AppRouteName.spending:
        return _page(deps.spendingOverview(), (c) => SpendingView(controller: c));
      case AppRouteName.budgets:
        return _page(deps.budgetList(), (c) => BudgetsView(controller: c));
      case AppRouteName.budgetCategory:
        return _page(
          deps.budgetCategory(categoryId: r.params['id']!, periodId: r.query['period'] ?? ''),
          (c) => BudgetCategoryView(controller: c),
        );
      case AppRouteName.bills:
        return _page(deps.billsController(), (c) => BillsUpcomingView(controller: c));
      case AppRouteName.billsRecurring:
        return _page(deps.billsController(), (c) => BillsRecurringView(controller: c));
      case AppRouteName.accounts:
        return _page(deps.accountsList(), (c) => AccountsView(controller: c));
      case AppRouteName.notifications:
        return _page(deps.notificationCenter(), (c) => NotificationsView(controller: c));
      case AppRouteName.goals:
        return _page(deps.savingsGoals(), (c) => SavingsGoalsView(controller: c));
      case AppRouteName.cashFlow:
        return _page(deps.cashFlowProjection(), (c) => CashFlowView(controller: c));
      case AppRouteName.trends:
        return _page(deps.trendsScreen(), (c) => TrendsView(controller: c));
      case AppRouteName.settings:
        return _page(deps.settingsScreen(), (c) => SettingsView(controller: c));

      // No design yet. In-app navigation shows a "not implemented" toast instead
      // (see [notImplemented]); these pages only appear when opened by URL / deep link.
      case AppRouteName.createAccount:
      case AppRouteName.socialSignIn:
      case AppRouteName.forgotPassword:
      case AppRouteName.billDetail:
      case AppRouteName.accountDetail:
      case AppRouteName.spendingCategory:
      case AppRouteName.trendDetail:
      case AppRouteName.tool:
      case AppRouteName.profile:
      case AppRouteName.budgetCategoriesSettings:
      case AppRouteName.statementExport:
      case AppRouteName.passwordSecurity:
        final what = notImplemented(r)!;
        return PlaceholderView(title: what, detail: '$what is not implemented yet.');
    }
  }

  /// Name of the feature for routes without a designed screen, or null if [r] has one.
  /// Remove a route from here when you add its real page above.
  static String? notImplemented(AppRoute r) => switch (r.name) {
        AppRouteName.createAccount => 'Create account',
        AppRouteName.socialSignIn => r.params['provider'] == 'apple' ? 'Sign in with Apple' : 'Sign in with Google',
        AppRouteName.forgotPassword => 'Password reset',
        AppRouteName.billDetail => 'Bill details',
        AppRouteName.accountDetail => 'Account details',
        AppRouteName.spendingCategory => 'Spending by category',
        AppRouteName.trendDetail => 'Trend details',
        AppRouteName.tool => 'This tool',
        AppRouteName.profile => 'Profile',
        AppRouteName.budgetCategoriesSettings => 'Budget categories',
        AppRouteName.statementExport => 'Statement export',
        AppRouteName.passwordSecurity => 'Password & security',
        _ => null,
      };
}
