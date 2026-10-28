import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/dashboard_controller.dart' show DashboardController;
import 'screens/dashboard_screen.dart' show DashboardScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class DashboardView extends StatelessWidget {
  final DashboardController controller;
  const DashboardView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<DashboardController>(
        controller: controller,
        builder: (context, c) => DashboardScreen(
          data: c.data!,
          onSettings: c.openSettings,
          onNotifications: c.openNotifications,
          onReviewTransactions: c.openReviewTransactions,
          onPaydayInfo: c.paydayInfo,
          onAccountInfo: c.accountInfo,
          onAddAccount: c.addAccount,
          onAccountTap: c.openAccount,
          onSyncNow: c.syncNow,
          onTransactionTap: c.openTransaction,
          onSeeMoreTransactions: c.seeMoreTransactions,
          onSeeBudget: c.seeBudget,
          onBudgetCategoryTap: c.openBudgetCategory,
          onSeeAllBills: c.seeAllBills,
          onBillTap: c.openBill,
          onSeeAllTrends: c.seeAllTrends,
          onTrendAction: c.openTrend,
          onToolTap: c.openTool,
          onNavTap: c.openTab,
        ),
      );
}
