import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/spending_category_controller.dart' show SpendingCategoryController;
import 'screens/spending_category_screen.dart' show SpendingCategoryScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class SpendingCategoryView extends StatelessWidget {
  final SpendingCategoryController controller;
  const SpendingCategoryView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<SpendingCategoryController>(
        controller: controller,
        builder: (context, c) => SpendingCategoryScreen(
          data: c.data!,
          onBack: c.back,
          onBarTap: c.selectBar,
          onTransactionTap: c.openTransaction,
          onNavTap: c.openTab,
        ),
      );
}
