import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/bills_controller.dart' show BillsController;
import 'screens/bills_recurring_screen.dart' show BillsRecurringScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BillsRecurringView extends StatelessWidget {
  final BillsController controller;
  const BillsRecurringView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BillsController>(
        controller: controller,
        builder: (context, c) {
          final r = c.recurring!;
          return BillsRecurringScreen(
            monthlyTotal: r.monthlyTotal,
            yearlyTotal: r.yearlyTotal,
            subscriptionsMonthly: r.subscriptionsMonthly,
            items: r.items,
            insight: r.insight,
            onTabChanged: (i) {
              if (i != 1) c.selectTab(i);
            },
            onItemTap: c.openSubscription,
            onItemMenu: c.openSubscriptionMenu,
            onAdd: c.addBill,
            onNavTap: c.openTab,
          );
        },
      );
}
