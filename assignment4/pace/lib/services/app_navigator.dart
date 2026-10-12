import '../models/navigation.dart' show DeepLinkTarget, FlowStep;
import '../models/transaction.dart' show FilterChoice, FilterKind;

/// Navigation & modal UI as a service, so controllers can say *where to go* without importing
/// any view. Implement it with your router (go_router, Navigator 1/2, auto_route…).
/// The screens themselves are not linked to each other; this interface is the only coupling point.
abstract class AppNavigator {
  void back();
  void openTab(int index); // 0 Home, 1 Transactions, 2 Spending, 3 Budgets, 4 Bills

  // Auth / onboarding
  void openSignIn();
  void openCreateAccount();
  void openForgotPassword();
  /// Google / Apple sign-in ([provider]: 'google' or 'apple').
  void openSocialSignIn(String provider);
  void openOnboarding();
  void openConnectBank();
  void openHome();

  // Home & lists
  void openSettings();
  void openNotifications();
  void openAccounts();
  void openTransactions();
  void openTransaction(String transactionId);
  void openReviewTransactions();
  void openBudgets();
  void openBudgetCategory({required String categoryId, String? periodId});
  void openBills({required int tab}); // 0 Upcoming, 1 Recurring
  void openBill(String billId);
  void openSavingsGoals();
  void openCashFlow();
  void openTrends();
  void openTrendDetail(String trendId);
  void openTool(String toolId);
  /// Opens whatever a service-provided [DeepLinkTarget] points at (bill, budget category, goal…).
  void openTarget(DeepLinkTarget target);
  /// Moves the sign-in / onboarding journey to the step a service decided on.
  void openFlowStep(FlowStep step);
  void openSpendingCategory(String categoryId);
  void openExternal(ExternalLink link);

  // Modals / pickers (return when dismissed so controllers can refresh)
  /// Returns null if dismissed. To clear a filter, return FilterChoice(id: '', label: '').
  Future<FilterChoice?> pickFilter(FilterKind kind, {required List<FilterChoice> choices, FilterChoice? current});
  Future<bool> openNewCategory();
  Future<bool> openAddNote(String transactionId);
  Future<bool> openAddBill();
  Future<bool> openAddGoal();
  Future<bool> openEditGoal(String goalId);
  Future<bool> openAddContribution(String goalId);
  Future<bool> openEditBudgetCategory(String categoryId);
  Future<bool> openAddBudgetCategory();
  Future<bool> openAddExpectedIncome();
  Future<bool> openSubscriptionMenu(String subscriptionId);
  Future<bool> openThemePicker();
  Future<bool> openBillReminderPicker();
  Future<bool> confirmDeleteAccount();
  void openProfile();
  void openConnectedAccounts();
  void openBudgetCategoriesSettings();
  void openStatementExport();
  void openPasswordSecurity();
  void openAccountDetail(String accountId);
  void openMenu(String screenId);
}

enum ExternalLink { termsOfUse, privacyPolicy }
