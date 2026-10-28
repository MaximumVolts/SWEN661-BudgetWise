import '../models/bill.dart' show BillItem;
import '../models/budget.dart' show BudgetCategory;
import '../models/dashboard.dart' show DashboardAccount, DashboardData, ToolLink;
import '../models/transaction.dart' show TransactionItem;
import '../models/trend.dart' show TrendItem;
import 'app_navigator.dart' show AppNavigator;
import '../services/dashboard_service.dart' show DashboardService;
import 'base_controller.dart' show ScreenController;

class DashboardController extends ScreenController {
  final DashboardService _dashboard;
  DashboardController({required DashboardService dashboard, required AppNavigator navigator})
      : _dashboard = dashboard,
        super(navigator);

  DashboardData? data;

  @override
  Future<void> fetch() async => data = await _dashboard.load();

  Future<void> syncNow() => performAndRefresh(_dashboard.sync);

  void openSettings() => navigator.openSettings();
  void openNotifications() => navigator.openNotifications();
  void openReviewTransactions() => navigator.openReviewTransactions();
  void addAccount() => navigator.openAddAccount();
  void openAccount(DashboardAccount a) => navigator.openAccountDetail(a.id);
  void openTransaction(TransactionItem t) => navigator.openTransaction(t.id);
  void seeMoreTransactions() => navigator.openTransactions();
  void seeBudget() => navigator.openBudgets();
  void openBudgetCategory(BudgetCategory c) => navigator.openBudgetCategory(categoryId: c.id);
  void seeAllBills() => navigator.openBills(tab: 0);
  void openBill(BillItem b) => navigator.openBill(b.id);
  void seeAllTrends() => navigator.openTrends();
  void openTrend(TrendItem t) => navigator.openTrendDetail(t.id);
  void openTool(ToolLink t) => navigator.openTool(t.id);
  void paydayInfo() => navigator.openMenu('payday_info');
  void accountInfo(DashboardAccount a) => navigator.openMenu('account_info_${a.id}');
}
