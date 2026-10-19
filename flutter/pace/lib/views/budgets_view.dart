import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/budgets_controller.dart' show BudgetsController;
import 'screens/budgets_screen.dart' show BudgetsScreen;
import 'widgets/controller_scope.dart' show ControllerScope, EmptyBody;

class BudgetsView extends StatelessWidget {
  final BudgetsController controller;
  const BudgetsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BudgetsController>(
        controller: controller,
        builder: (context, c) {
          final o = c.overview;
          if (o == null) return const EmptyBody(message: 'No budgets yet.');
          return BudgetsScreen(
            periodLabels: c.periodLabels,
            selectedPeriod: c.selectedPeriod,
            summary: o.summary,
            categories: o.categories,
            onPeriodChanged: c.selectPeriod,
            onCategoryTap: c.openCategory,
            onAddCategory: c.addCategory,
            onMenu: c.openMenu,
            onNavTap: c.openTab,
          );
        },
      );
}
