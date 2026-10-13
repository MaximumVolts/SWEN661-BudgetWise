import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/budget_category_controller.dart' show BudgetCategoryController;
import 'screens/budget_category_screen.dart' show BudgetCategoryScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BudgetCategoryView extends StatelessWidget {
  final BudgetCategoryController controller;
  const BudgetCategoryView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BudgetCategoryController>(
        controller: controller,
        builder: (context, c) => BudgetCategoryScreen(
          data: c.data!,
          onBack: c.back,
          onEdit: c.edit,
          onTransactionTap: c.openTransaction,
          onNavTap: c.openTab,
        ),
      );
}
