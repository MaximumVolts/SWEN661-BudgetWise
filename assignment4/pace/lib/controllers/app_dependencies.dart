import 'accounts_controller.dart' show AccountsController;
import 'bills_controller.dart' show BillsController;
import 'budget_category_controller.dart' show BudgetCategoryController;
import 'budgets_controller.dart' show BudgetsController;
import 'cash_flow_controller.dart' show CashFlowController;
import 'connect_bank_controller.dart' show ConnectBankController;
import 'dashboard_controller.dart' show DashboardController;
import 'notifications_controller.dart' show NotificationsController;
import 'onboarding_controller.dart' show OnboardingController;
import 'savings_goals_controller.dart' show SavingsGoalsController;
import 'settings_controller.dart' show SettingsController;
import 'sign_in_controller.dart' show SignInController;
import 'spending_controller.dart' show SpendingController;
import 'transaction_detail_controller.dart' show TransactionDetailController;
import 'transactions_controller.dart' show TransactionsController;
import 'trends_controller.dart' show TrendsController;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/app_services.dart' show AppServices;

/// Composition root: builds controllers from your [AppServices] and the [AppNavigator].
/// The router's page builder (AppPages) uses it, so each page gets a fresh controller:
///
///   TransactionDetailView(controller: deps.transactionDetail(id))
class AppDependencies {
  final AppServices services;
  final AppNavigator navigator;
  const AppDependencies({required this.services, required this.navigator});

  SignInController signIn() => SignInController(auth: services.auth, navigator: navigator);
  OnboardingController onboardingFlow() => OnboardingController(service: services.onboarding, navigator: navigator);
  ConnectBankController connectBank() => ConnectBankController(link: services.bankLink, navigator: navigator);
  AccountsController accountsList() =>
      AccountsController(accounts: services.accounts, navigator: navigator);
  DashboardController home() =>
      DashboardController(dashboard: services.dashboard, navigator: navigator);
  TransactionsController transactionList() => TransactionsController(service: services.transactions, navigator: navigator);
  TransactionDetailController transactionDetail(String id) =>
      TransactionDetailController(transactionId: id, service: services.transactions, navigator: navigator);
  BudgetsController budgetList() => BudgetsController(service: services.budgets, navigator: navigator);
  BudgetCategoryController budgetCategory({required String categoryId, required String periodId}) =>
      BudgetCategoryController(categoryId: categoryId, periodId: periodId, service: services.budgets, navigator: navigator);
  SpendingController spendingOverview() => SpendingController(service: services.spending, navigator: navigator);
  /// One controller powers both BillsUpcomingView and BillsRecurringView.
  BillsController billsController() => BillsController(service: services.bills, navigator: navigator);
  SavingsGoalsController savingsGoals() => SavingsGoalsController(service: services.goals, navigator: navigator);
  NotificationsController notificationCenter() =>
      NotificationsController(service: services.notifications, navigator: navigator);
  SettingsController settingsScreen() =>
      SettingsController(settings: services.settings, auth: services.auth, navigator: navigator);
  CashFlowController cashFlowProjection() => CashFlowController(service: services.cashFlow, navigator: navigator);
  TrendsController trendsScreen() => TrendsController(service: services.trends, navigator: navigator);
}
