import 'accounts_controller.dart' show AccountsController;
import 'bill_detail_controller.dart' show BillDetailController;
import 'bill_form_controller.dart' show BillFormController;
import 'bills_controller.dart' show BillsController;
import 'budget_category_controller.dart' show BudgetCategoryController;
import 'budget_form_controller.dart' show BudgetFormController;
import 'budgets_controller.dart' show BudgetsController;
import 'cash_flow_controller.dart' show CashFlowController;
import 'expected_income_form_controller.dart' show ExpectedIncomeFormController;
import 'connect_bank_controller.dart' show ConnectBankController;
import 'add_account_controller.dart' show AddAccountController;
import 'create_account_controller.dart' show CreateAccountController;
import 'dashboard_controller.dart' show DashboardController;
import 'display_controller.dart' show DisplayController;
import 'bill_reminder_controller.dart' show BillReminderController;
import 'manage_budgets_controller.dart' show ManageBudgetsController;
import 'notifications_controller.dart' show NotificationsController;
import 'onboarding_controller.dart' show OnboardingController;
import 'profile_controller.dart' show ProfileController;
import 'reset_password_controller.dart' show ResetPasswordController;
import 'savings_goals_controller.dart' show SavingsGoalsController;
import 'goal_form_controller.dart' show GoalFormController;
import 'settings_controller.dart' show SettingsController;
import 'sign_in_controller.dart' show SignInController;
import 'spending_controller.dart' show SpendingController;
import 'spending_category_controller.dart' show SpendingCategoryController;
import 'statement_export_controller.dart' show StatementExportController;
import 'transaction_detail_controller.dart' show TransactionDetailController;
import 'transactions_controller.dart' show TransactionsController;
import 'trends_controller.dart' show TrendsController;
import 'app_navigator.dart' show AppNavigator;
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
  CreateAccountController createAccount() => CreateAccountController(auth: services.auth, navigator: navigator);
  ResetPasswordController resetPassword() => ResetPasswordController(auth: services.auth, navigator: navigator);
  OnboardingController onboardingFlow() => OnboardingController(service: services.onboarding, navigator: navigator);
  ConnectBankController connectBank() => ConnectBankController(link: services.bankLink, navigator: navigator);
  AddAccountController addAccount() => AddAccountController(link: services.bankLink, navigator: navigator);
  AccountsController accountsList() =>
      AccountsController(accounts: services.accounts, navigator: navigator);
  DashboardController home() =>
      DashboardController(dashboard: services.dashboard, navigator: navigator);
  TransactionsController transactionList() => TransactionsController(service: services.transactions, navigator: navigator);
  TransactionDetailController transactionDetail(String id) =>
      TransactionDetailController(transactionId: id, service: services.transactions, navigator: navigator);
  /// App-wide display preferences, for the app root.
  DisplayController display() => DisplayController(settings: services.settings);
  BillReminderController billReminders() => BillReminderController(
      reminders: services.reminders, settings: services.settings, bankLink: services.bankLink, bills: services.bills);
  BudgetsController budgetList() => BudgetsController(service: services.budgets, navigator: navigator);
  ManageBudgetsController manageBudgets() => ManageBudgetsController(service: services.budgets, navigator: navigator);
  /// [categoryId] null = a new budget.
  BudgetFormController budgetForm({String? categoryId}) =>
      BudgetFormController(service: services.budgets, navigator: navigator, editingCategoryId: categoryId);
  BudgetCategoryController budgetCategory({required String categoryId, required String periodId}) =>
      BudgetCategoryController(categoryId: categoryId, periodId: periodId, service: services.budgets, navigator: navigator);
  StatementExportController statementExport() =>
      StatementExportController(service: services.statements, navigator: navigator);
  SpendingController spendingOverview() => SpendingController(service: services.spending, navigator: navigator);
  SpendingCategoryController spendingCategory({required String categoryId, int rangeIndex = 0}) => SpendingCategoryController(
      categoryId: categoryId, rangeIndex: rangeIndex, service: services.spending, navigator: navigator);
  /// One controller powers both BillsUpcomingView and BillsRecurringView.
  BillsController billsController() => BillsController(service: services.bills, navigator: navigator);
  BillDetailController billDetail(String id) => BillDetailController(billId: id, service: services.bills, navigator: navigator);
  /// [id] null = a new recurring expense.
  BillFormController billForm({String? id}) => BillFormController(service: services.bills, navigator: navigator, editingId: id);
  SavingsGoalsController savingsGoals() => SavingsGoalsController(service: services.goals, navigator: navigator);
  GoalFormController goalForm() => GoalFormController(service: services.goals, navigator: navigator);
  NotificationsController notificationCenter() =>
      NotificationsController(service: services.notifications, navigator: navigator);
  ProfileController profileScreen() =>
      ProfileController(profile: services.profile, bankLink: services.bankLink, navigator: navigator);
  SettingsController settingsScreen() =>
      SettingsController(settings: services.settings, auth: services.auth, reminders: services.reminders, navigator: navigator);
  CashFlowController cashFlowProjection() => CashFlowController(service: services.cashFlow, navigator: navigator);
  ExpectedIncomeFormController expectedIncomeForm() =>
      ExpectedIncomeFormController(service: services.cashFlow, navigator: navigator);
  TrendsController trendsScreen() => TrendsController(service: services.trends, navigator: navigator);
}
