import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/onboarding_controller.dart' show OnboardingController;
import 'screens/onboarding_priorities_screen.dart' show OnboardingPrioritiesScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class OnboardingPrioritiesView extends StatelessWidget {
  final OnboardingController controller;
  const OnboardingPrioritiesView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<OnboardingController>(
        controller: controller,
        builder: (context, c) {
          final o = c.options!;
          return OnboardingPrioritiesScreen(
            priorities: o.priorities,
            incomeOptions: o.incomeOptions,
            initialSelectedPriorityIds: c.selectedPriorityIds,
            initialIncomeId: c.incomeId,
            onPrioritiesChanged: c.setPriorities,
            onIncomeChanged: c.setIncome,
            onContinue: c.continueFlow,
            onBack: c.back,
          );
        },
      );
}
