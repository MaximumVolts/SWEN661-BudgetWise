import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/savings_goals_controller.dart' show SavingsGoalsController;
import '../models/goal.dart' show SavingsGoalsData;
import 'screens/savings_goals_screen.dart' show SavingsGoalsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class SavingsGoalsView extends StatelessWidget {
  final SavingsGoalsController controller;
  const SavingsGoalsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<SavingsGoalsController>(
        controller: controller,
        builder: (context, c) => SavingsGoalsScreen(
          data: c.data ?? const SavingsGoalsData.empty(),
          onBack: c.back,
          onAddGoal: c.addGoal,
          onEditGoal: c.editGoal,
          onAddContribution: c.addContribution,
          onNavTap: c.openTab,
        ),
      );
}
