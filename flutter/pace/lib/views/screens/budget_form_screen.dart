import 'package:flutter/material.dart'
    show
        Border,
        BorderRadius,
        BoxDecoration,
        BuildContext,
        Colors,
        Column,
        Container,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        FontWeight,
        Icon,
        IconData,
        Icons,
        ListView,
        MainAxisSize,
        Row,
        SafeArea,
        Scaffold,
        Semantics,
        SizedBox,
        State,
        StatefulWidget,
        StatelessWidget,
        Text,
        TextEditingController,
        TextField,
        TextInputAction,
        TextInputType,
        TextStyle,
        ValueChanged,
        VoidCallback,
        Widget,
        Wrap;
import '../../models/transaction.dart' show CategoryInfo;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, paceInputDecoration, PaceTopBar, PillButton, Tap;

/// Create or edit a budget: a spending category and its monthly limit.
class BudgetFormScreen extends StatefulWidget {
  final bool isEditing;
  final List<CategoryInfo> categories;
  final String? selectedCategoryId;
  final double? initialLimit;
  final String? categoryError;
  final String? limitError;
  final bool isSaving;
  final bool isDeleting;
  final ValueChanged<CategoryInfo>? onCategorySelected;
  /// Called with the limit as typed; the service validates it.
  final ValueChanged<String>? onSave;
  final VoidCallback? onDelete;
  final VoidCallback? onBack;

  const BudgetFormScreen({
    super.key,
    required this.isEditing,
    required this.categories,
    this.selectedCategoryId,
    this.initialLimit,
    this.categoryError,
    this.limitError,
    this.isSaving = false,
    this.isDeleting = false,
    this.onCategorySelected,
    this.onSave,
    this.onDelete,
    this.onBack,
  });

  @override
  State<BudgetFormScreen> createState() => _BudgetFormScreenState();
}

class _BudgetFormScreenState extends State<BudgetFormScreen> {
  late final _limit = TextEditingController(text: _initialText(widget.initialLimit));

  static String _initialText(double? v) {
    if (v == null) return '';
    return v == v.roundToDouble() ? v.toStringAsFixed(0) : v.toStringAsFixed(2);
  }

  @override
  void dispose() {
    _limit.dispose();
    super.dispose();
  }

  void _save() => widget.onSave?.call(_limit.text);

  @override
  Widget build(BuildContext context) {
    final busy = widget.isSaving || widget.isDeleting;
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar(widget.isEditing ? 'Edit budget' : 'New budget', back: true, onBack: widget.onBack),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const Text('Category', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 4),
                  Text(
                    widget.categories.isEmpty
                        ? 'Every spending category already has a budget.'
                        : 'Spending in this category counts toward the budget.',
                    style: T.sub,
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 10,
                    runSpacing: 12,
                    children: [
                      for (final c in widget.categories)
                        Tap(
                          onTap: widget.onCategorySelected == null || busy ? null : () => widget.onCategorySelected!(c),
                          child: _Chip(AppIcons.of(c.iconKey), c.name, c.id == widget.selectedCategoryId),
                        ),
                    ],
                  ),
                  if (widget.categoryError != null) ...[
                    const SizedBox(height: 8),
                    Text(widget.categoryError!, style: TextStyle(fontSize: 13, color: C.red)),
                  ],
                  const SizedBox(height: 26),
                  TextField(
                    controller: _limit,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => busy ? null : _save(),
                    style: const TextStyle(fontSize: 18),
                    decoration: paceInputDecoration(
                      label: 'Monthly limit',
                      prefixText: '\$ ',
                      helper: "Applies to every month; each month's spending is counted separately",
                      error: widget.limitError,
                    ),
                  ),
                  const SizedBox(height: 28),
                  PillButton(
                    widget.isSaving ? 'Saving…' : (widget.isEditing ? 'Save changes' : 'Create budget'),
                    onPressed: busy ? null : _save,
                  ),
                  if (widget.isEditing) ...[
                    const SizedBox(height: 14),
                    PillButton(
                      widget.isDeleting ? 'Deleting…' : 'Delete budget',
                      icon: Icons.delete_outline,
                      filled: false,
                      foreground: C.red,
                      onPressed: busy ? null : widget.onDelete,
                    ),
                  ],
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

class _Chip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  const _Chip(this.icon, this.label, this.selected);

  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? C.ink : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? C.ink : C.outline),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: selected ? Colors.white : C.ink),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: selected ? Colors.white : C.ink)),
          ],
        ),
      ),
    );
  }
}
