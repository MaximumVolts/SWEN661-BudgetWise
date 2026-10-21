import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/expected_income_form_controller.dart' show ExpectedIncomeFormController;
import 'screens/expected_income_form_screen.dart' show ExpectedIncomeFormScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class ExpectedIncomeFormView extends StatelessWidget {
  final ExpectedIncomeFormController controller;
  const ExpectedIncomeFormView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<ExpectedIncomeFormController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => ExpectedIncomeFormScreen(
          date: c.date,
          errorFor: c.errorFor,
          isSaving: c.isSubmitting,
          onDateSelected: c.selectDate,
          onSave: (name, amount) => c.save(name: name, amount: amount),
          onBack: c.back,
        ),
      );
}
