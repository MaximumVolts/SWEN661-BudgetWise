import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/cash_flow_controller.dart' show CashFlowController;
import 'screens/cash_flow_screen.dart' show CashFlowScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class CashFlowView extends StatelessWidget {
  final CashFlowController controller;
  const CashFlowView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<CashFlowController>(
        controller: controller,
        builder: (context, c) => CashFlowScreen(
          data: c.data!,
          onBack: c.back,
          onRangeChanged: c.selectRange,
          onScenarioChanged: c.selectScenario,
          onAddExpectedIncome: c.addExpectedIncome,
          onNavTap: c.openTab,
        ),
      );
}
