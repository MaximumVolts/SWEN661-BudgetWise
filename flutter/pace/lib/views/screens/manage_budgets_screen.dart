import 'package:flutter/material.dart'
    show
        BuildContext,
        Column,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        Icon,
        Icons,
        MainAxisAlignment,
        ListView,
        Row,
        SafeArea,
        Scaffold,
        SizedBox,
        StatelessWidget,
        Text,
        ValueChanged,
        VoidCallback,
        Widget;
import '../../models/budget.dart' show BudgetSetting;
import '../format.dart' show Fmt;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, HairLine, IconBadge, PaceCard, PaceTopBar, PillButton, Tap;

/// Budgets manager: every budget (each applies to every month) with Edit / Delete, plus "New budget".
class ManageBudgetsScreen extends StatelessWidget {
  final List<BudgetSetting> budgets;
  /// Category id of the budget being deleted, if any.
  final String? deletingCategoryId;
  final VoidCallback? onNew;
  final ValueChanged<BudgetSetting>? onEdit;
  final ValueChanged<BudgetSetting>? onDelete;
  final VoidCallback? onBack;

  const ManageBudgetsScreen({
    super.key,
    required this.budgets,
    this.deletingCategoryId,
    this.onNew,
    this.onEdit,
    this.onDelete,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('Manage budgets', back: true, onBack: onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  Text(
                    'A monthly spending limit for each category you want to track. Limits apply to every '
                    'month; spending is counted month by month.',
                    style: T.body,
                  ),
                  const SizedBox(height: 18),
                  if (budgets.isEmpty)
                    PaceCard(
                      child: Text('No budgets yet. Create one to start tracking a spending category.', style: T.body),
                    )
                  else
                    PaceCard(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      child: Column(
                        children: [
                          for (var i = 0; i < budgets.length; i++) ...[
                            if (i > 0) const HairLine(),
                            _BudgetRow(
                              budget: budgets[i],
                              deleting: deletingCategoryId == budgets[i].categoryId,
                              onEdit: onEdit == null ? null : () => onEdit!(budgets[i]),
                              onDelete: onDelete == null || deletingCategoryId != null ? null : () => onDelete!(budgets[i]),
                            ),
                          ],
                        ],
                      ),
                    ),
                  const SizedBox(height: 20),
                  PillButton('New budget', icon: Icons.add, onPressed: onNew),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BudgetRow extends StatelessWidget {
  final BudgetSetting budget;
  final bool deleting;
  final VoidCallback? onEdit;
  final VoidCallback? onDelete;
  const _BudgetRow({required this.budget, required this.deleting, this.onEdit, this.onDelete});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 72,
      child: Row(
        children: [
          IconBadge(AppIcons.of(budget.iconKey), size: 40),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(budget.name, style: T.row),
                const SizedBox(height: 2),
                Text(deleting ? 'Deleting…' : '${Fmt.money(budget.monthlyLimit)} a month', style: T.sub),
              ],
            ),
          ),
          Tap(
            onTap: onEdit,
            semanticLabel: 'Edit ${budget.name} budget',
            child: const Icon(Icons.edit_outlined, size: 22),
          ),
          Tap(
            onTap: onDelete,
            semanticLabel: 'Delete ${budget.name} budget',
            child: Icon(Icons.delete_outline, size: 22, color: C.red),
          ),
        ],
      ),
    );
  }
}
