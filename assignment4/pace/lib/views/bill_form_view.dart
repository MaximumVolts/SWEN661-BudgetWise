import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/bill_form_controller.dart' show BillFormController;
import 'screens/bill_form_screen.dart' show BillFormScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BillFormView extends StatelessWidget {
  final BillFormController controller;
  const BillFormView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BillFormController>(
        controller: controller,
        builder: (context, c) => BillFormScreen(
          isEditing: c.isEditing,
          initialName: c.initialName,
          initialAmount: c.initialAmount,
          kinds: c.options!.kinds,
          frequencies: c.options!.frequencies,
          categories: c.categories,
          kind: c.kind,
          frequency: c.frequency,
          firstDue: c.firstDue,
          categoryId: c.categoryId,
          errorFor: c.errorFor,
          isSaving: c.isSubmitting,
          onKindSelected: c.selectKind,
          onFrequencySelected: c.selectFrequency,
          onFirstDueSelected: c.selectFirstDue,
          onCategorySelected: c.selectCategory,
          onSave: (name, amount) => c.save(name: name, amount: amount),
          onBack: c.back,
        ),
      );
}
