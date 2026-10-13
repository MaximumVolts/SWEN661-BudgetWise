import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/manage_budgets_controller.dart' show ManageBudgetsController;
import 'screens/manage_budgets_screen.dart' show ManageBudgetsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class ManageBudgetsView extends StatelessWidget {
  final ManageBudgetsController controller;
  const ManageBudgetsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<ManageBudgetsController>(
        controller: controller,
        builder: (context, c) => ManageBudgetsScreen(
          budgets: c.budgets,
          deletingCategoryId: c.deletingCategoryId,
          onNew: c.newBudget,
          onEdit: c.edit,
          onDelete: c.delete,
          onBack: c.back,
        ),
      );
}
