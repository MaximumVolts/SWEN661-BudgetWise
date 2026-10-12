import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/spending_controller.dart' show SpendingController;
import 'screens/spending_screen.dart' show SpendingScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class SpendingView extends StatelessWidget {
  final SpendingController controller;
  const SpendingView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<SpendingController>(
        controller: controller,
        builder: (context, c) => SpendingScreen(
          data: c.data!,
          onRangeChanged: c.selectRange,
          onBarTap: c.selectBar,
          onCategoryTap: c.openCategory,
          onCalendar: c.openCalendar,
          onNavTap: c.openTab,
        ),
      );
}
