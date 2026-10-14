import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/goal_form_controller.dart' show GoalFormController;
import 'screens/goal_form_screen.dart' show GoalFormScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class GoalFormView extends StatelessWidget {
  final GoalFormController controller;
  const GoalFormView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<GoalFormController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => GoalFormScreen(
          icons: c.icons,
          iconKey: c.iconKey,
          targetDate: c.targetDate,
          errorFor: c.errorFor,
          isSaving: c.isSubmitting,
          onIconSelected: c.selectIcon,
          onTargetDateSelected: c.selectTargetDate,
          onSave: (name, target, saved) => c.save(name: name, target: target, saved: saved),
          onBack: c.back,
        ),
      );
}
