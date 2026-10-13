import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/bills_controller.dart' show BillsController;
import 'screens/bills_upcoming_screen.dart' show BillsUpcomingScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BillsUpcomingView extends StatelessWidget {
  final BillsController controller;
  const BillsUpcomingView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BillsController>(
        controller: controller,
        builder: (context, c) {
          final u = c.upcoming!;
          return BillsUpcomingScreen(
            summaryLabel: u.summaryLabel,
            summaryAmount: u.summaryAmount,
            summaryDetail: u.summaryDetail,
            sections: u.sections,
            onTabChanged: (i) {
              if (i != 0) c.selectTab(i);
            },
            onBillTap: c.openBill,
            onAdd: c.addBill,
            onNavTap: c.openTab,
          );
        },
      );
}
