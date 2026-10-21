import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/budget_form_controller.dart' show BudgetFormController;
import 'screens/budget_form_screen.dart' show BudgetFormScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class BudgetFormView extends StatelessWidget {
  final BudgetFormController controller;
  const BudgetFormView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<BudgetFormController>(
        controller: controller,
        builder: (context, c) => BudgetFormScreen(
          isEditing: c.isEditing,
          categories: c.categories,
          selectedCategoryId: c.selectedCategoryId,
          initialLimit: c.initialLimit,
          categoryError: c.errorFor('category'),
          limitError: c.errorFor('limit'),
          isSaving: c.isSubmitting,
          isDeleting: c.isDeleting,
          onCategorySelected: c.selectCategory,
          onSave: c.save,
          onDelete: c.delete,
          onBack: c.back,
        ),
      );
}
