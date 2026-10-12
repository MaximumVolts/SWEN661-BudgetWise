import 'package:flutter/widgets.dart' show BuildContext;
import '../../models/navigation.dart' show DeepLinkTarget, FlowStep, TargetKind;
import '../../models/transaction.dart' show FilterChoice, FilterKind;
import '../../services/app_navigator.dart' show AppNavigator, ExternalLink;
import 'app_modals.dart' show AppModals;
import 'app_pages.dart' show AppPages;
import 'app_route.dart' show AppRoute;
import 'app_router_delegate.dart' show AppRouterDelegate;

/// [AppNavigator] implemented on top of the Navigator 2.0 [AppRouterDelegate].
/// Controllers call these methods; nothing else in the app touches the router.
class RouterAppNavigator implements AppNavigator {
  final AppRouterDelegate _router;
  final AppModals _modals;
  RouterAppNavigator(this._router, this._modals);

  BuildContext get _ctx => _router.navigatorKey.currentContext!;

  /// Pushes [route], or shows the "not implemented" toast if it has no designed page yet.
  void _push(AppRoute route) {
    final what = AppPages.notImplemented(route);
    if (what == null) return _router.push(route);
    final ctx = _router.navigatorKey.currentContext;
    if (ctx != null) _modals.notImplemented(ctx, what);
  }

  // ── stack navigation ──────────────────────────────────────────────────────
  @override
  void back() => _router.pop();
  @override
  void openTab(int index) => _router.openTab(AppRoute.forTab(index));

  @override
  void openSignIn() => _router.replaceAll([AppRoute.signIn]);
  @override
  void openCreateAccount() => _push(AppRoute.createAccount);
  @override
  void openForgotPassword() => _push(AppRoute.forgotPassword);
  @override
  void openSocialSignIn(String provider) => _push(AppRoute.socialSignIn(provider));
  @override
  void openOnboarding() => _push(AppRoute.onboarding);
  @override
  void openConnectBank() => _push(AppRoute.connectBank);
  /// Entry point after authentication: resets the stack to Home.
  @override
  void openHome() => _router.replaceAll([AppRoute.home]);

  @override
  void openSettings() => _push(AppRoute.settings);
  @override
  void openNotifications() => _push(AppRoute.notifications);
  @override
  void openAccounts() => _push(AppRoute.accounts);
  @override
  void openTransactions() => openTab(1);
  @override
  void openTransaction(String id) => _push(AppRoute.transactionDetail(id));
  @override
  void openReviewTransactions() => openTab(1);
  @override
  void openBudgets() => openTab(3);
  @override
  void openBudgetCategory({required String categoryId, String? periodId}) =>
      _push(AppRoute.budgetCategory(categoryId, periodId: periodId));
  @override
  void openBills({required int tab}) => _router.openTab(tab == 1 ? AppRoute.billsRecurring : AppRoute.bills);
  @override
  void openBill(String id) => _push(AppRoute.billDetail(id));
  @override
  void openSavingsGoals() => _push(AppRoute.goals);
  @override
  void openCashFlow() => _push(AppRoute.cashFlow);
  @override
  void openTrends() => _push(AppRoute.trends);
  @override
  void openTrendDetail(String id) => _push(AppRoute.trendDetail(id));
  @override
  void openSpendingCategory(String id) => _push(AppRoute.spendingCategory(id));
  @override
  void openAccountDetail(String id) => _push(AppRoute.accountDetail(id));
  @override
  void openProfile() => _push(AppRoute.profile);
  @override
  void openConnectedAccounts() => _push(AppRoute.accounts);
  @override
  void openBudgetCategoriesSettings() => _push(AppRoute.budgetCategoriesSettings);
  @override
  void openStatementExport() => _push(AppRoute.statementExport);
  @override
  void openPasswordSecurity() => _push(AppRoute.passwordSecurity);

  /// "More tools" ids used by the dashboard; unknown ids open the generic tool route.
  @override
  void openTool(String toolId) {
    switch (toolId) {
      case 'recurring':
      case 'subscriptions':
        _router.openTab(AppRoute.billsRecurring);
      case 'savings-goals':
        _push(AppRoute.goals);
      case 'cash-flow':
        _push(AppRoute.cashFlow);
      default:
        _push(AppRoute.tool(toolId));
    }
  }

  /// Maps a service-provided target to a route. The *decision* of what to open lives in services.
  @override
  void openTarget(DeepLinkTarget t) {
    switch (t.kind) {
      case TargetKind.bill:
        _push(AppRoute.billDetail(t.id!));
      case TargetKind.budgetCategory:
        _push(AppRoute.budgetCategory(t.id!));
      case TargetKind.goal:
        _push(AppRoute.goals);
      case TargetKind.account:
        _push(AppRoute.accountDetail(t.id!));
      case TargetKind.transaction:
        _push(AppRoute.transactionDetail(t.id!));
      case TargetKind.trend:
        _push(AppRoute.trendDetail(t.id!));
      case TargetKind.budgets:
        openTab(3);
      case TargetKind.bills:
        openBills(tab: 0);
    }
  }

  /// Sign-in / onboarding journey. Connect-bank is pushed from onboarding so Back works there;
  /// everything else resets the stack.
  @override
  void openFlowStep(FlowStep step) {
    final route = switch (step) {
      FlowStep.onboarding => AppRoute.onboarding,
      FlowStep.connectBank => AppRoute.connectBank,
      FlowStep.home => AppRoute.home,
    };
    if (step == FlowStep.connectBank && _router.current == AppRoute.onboarding) {
      _push(route);
    } else {
      _router.replaceAll([route]);
    }
  }

  // ── modals ────────────────────────────────────────────────────────────────
  @override
  Future<FilterChoice?> pickFilter(FilterKind kind, {required List<FilterChoice> choices, FilterChoice? current}) =>
      _modals.pickFilter(_ctx, kind, choices: choices, current: current);
  @override
  Future<bool> openNewCategory() => _modals.newCategory(_ctx);
  @override
  Future<bool> openAddNote(String id) => _modals.addNote(_ctx, id);
  @override
  Future<bool> openAddBill() => _modals.addBill(_ctx);
  @override
  Future<bool> openAddGoal() => _modals.addGoal(_ctx);
  @override
  Future<bool> openEditGoal(String id) => _modals.editGoal(_ctx, id);
  @override
  Future<bool> openAddContribution(String id) => _modals.addContribution(_ctx, id);
  @override
  Future<bool> openEditBudgetCategory(String id) => _modals.editBudgetCategory(_ctx, id);
  @override
  Future<bool> openAddBudgetCategory() => _modals.addBudgetCategory(_ctx);
  @override
  Future<bool> openAddExpectedIncome() => _modals.addExpectedIncome(_ctx);
  @override
  Future<bool> openSubscriptionMenu(String id) => _modals.subscriptionMenu(_ctx, id);
  @override
  Future<bool> openThemePicker() => _modals.themePicker(_ctx);
  @override
  Future<bool> openBillReminderPicker() => _modals.billReminderPicker(_ctx);
  @override
  Future<bool> confirmDeleteAccount() => _modals.confirmDeleteAccount(_ctx);
  @override
  void openExternal(ExternalLink link) => _modals.openExternal(_ctx, link);
  @override
  void openMenu(String screenId) => _modals.menu(_ctx, screenId);
}
