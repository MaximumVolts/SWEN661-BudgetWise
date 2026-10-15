import '../models/navigation.dart' show DeepLinkTarget, FlowStep;
import '../models/recurring.dart' show RecurringAction;
import '../models/transaction.dart' show FilterChoice, FilterKind;
import '../models/user_preferences.dart' show BillReminder;

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
  /// Link another of Plaid's sandbox test banks; returns here when done.
  void openAddAccount();
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
  /// One category's spending over the period Spending shows ([rangeIndex]: Month / 3 months / Year).
  void openSpendingCategory(String categoryId, {int rangeIndex = 0});

  // Modals / pickers (return when dismissed so controllers can refresh)
  /// Returns null if dismissed. To clear a filter, return FilterChoice(id: '', label: '').
  Future<FilterChoice?> pickFilter(FilterKind kind, {required List<FilterChoice> choices, FilterChoice? current});
  Future<bool> openNewCategory();
  Future<bool> openAddNote(String transactionId);
  /// The form to add a recurring expense (a bill or subscription).
  void openAddBill();
  /// The form to edit a recurring expense the user added.
  void openEditBill(String billId);
  /// The form to add a savings goal.
  void openAddGoal();
  Future<bool> openEditGoal(String goalId);
  Future<bool> openAddContribution(String goalId);
  /// Opens the budget form to edit the budget for [categoryId].
  void openEditBudgetCategory(String categoryId);
  /// Opens the budget form to create a new budget.
  void openAddBudgetCategory();
  /// Asks before deleting a budget. True if the user confirmed.
  Future<bool> confirmDeleteBudget(String categoryName);
  /// The form to add one-off income the user expects (Cash flow).
  void openAddExpectedIncome();
  /// Asks before removing expected income. True if confirmed.
  Future<bool> confirmRemoveExpectedIncome(String name);
  /// The menu for a bill or subscription named [name]: the chosen action, or null.
  Future<RecurringAction?> openRecurringMenu(String name, List<RecurringAction> actions);
  /// Asks before deleting a recurring expense. True if confirmed.
  Future<bool> confirmDeleteRecurring(String name);
  Future<bool> openThemePicker();
  /// When to be reminded about bills; null if dismissed.
  Future<BillReminder?> pickBillReminder(BillReminder current);
  Future<bool> confirmDeleteAccount();
  /// Asks before disconnecting a linked bank. True if the user confirmed.
  Future<bool> confirmRemoveBankConnection(String institutionName);
  void openProfile();
  void openConnectedAccounts();
  /// The budgets manager.
  void openBudgetCategoriesSettings();
  void openStatementExport();
  void openAccountDetail(String accountId);
  void openMenu(String screenId);
}
