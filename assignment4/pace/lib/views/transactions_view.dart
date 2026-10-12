import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/transactions_controller.dart' show TransactionsController;
import '../models/transaction.dart' show FilterKind;
import 'screens/transactions_screen.dart' show TransactionsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class TransactionsView extends StatelessWidget {
  final TransactionsController controller;
  const TransactionsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<TransactionsController>(
        controller: controller,
        builder: (context, c) => TransactionsScreen(
          groups: c.groups,
          accountFilterLabel: c.accountLabel,
          categoryFilterLabel: c.categoryLabel,
          dateFilterLabel: c.dateLabel,
          accountFilterActive: true,
          categoryFilterActive: c.query.category != null,
          dateFilterActive: c.query.date != null,
          onAccountFilter: () => c.pickFilter(FilterKind.account),
          onCategoryFilter: () => c.pickFilter(FilterKind.category),
          onDateFilter: () => c.pickFilter(FilterKind.date),
          onHeaderAction: c.headerAction,
          onTransactionTap: c.openTransaction,
          onNavTap: c.openTab,
        ),
      );
}
