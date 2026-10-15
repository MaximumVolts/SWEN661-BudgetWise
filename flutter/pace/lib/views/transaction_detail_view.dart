import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/transaction_detail_controller.dart' show TransactionDetailController;
import 'screens/transaction_detail_screen.dart' show TransactionDetailScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class TransactionDetailView extends StatelessWidget {
  final TransactionDetailController controller;
  const TransactionDetailView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<TransactionDetailController>(
        controller: controller,
        builder: (context, c) => TransactionDetailScreen(
          transaction: c.bundle!.transaction,
          categories: c.bundle!.categories,
          selectedCategoryIds: c.selectedCategoryIds,
          onCategoryToggled: c.toggleCategory,
          onNewCategory: c.newCategory,
          onAddNote: c.addNote,
          onBack: c.back,
        ),
      );
}
