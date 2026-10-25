import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Colors, Column, Container, CrossAxisAlignment, EdgeInsets,
        Flexible, FontWeight, Icon, IconData, Icons, MainAxisSize, Padding, Row, SafeArea, Scaffold, Semantics,
        SingleChildScrollView, SizedBox, Spacer, StatelessWidget, Text, TextAlign, TextStyle, ValueChanged,
        VoidCallback, Widget, Wrap;
import '../format.dart' show Fmt;
import '../../models/transaction.dart' show CategoryInfo, TransactionDetailData;
import '../theme.dart' show C;
import '../widgets/widgets.dart' show AppIcons, HairLine, IconBadge, PaceCard, PaceTopBar, PillButton, Tap;

/// 07 - Transaction Detail
class TransactionDetailScreen extends StatelessWidget {
  final TransactionDetailData transaction;
  final List<CategoryInfo> categories;
  /// Controlled: the selected category ids in order, first = primary
  /// (defaults to transaction.selectedCategoryIds).
  final List<String>? selectedCategoryIds;
  /// Tapping a chip adds or removes that category.
  final ValueChanged<CategoryInfo>? onCategoryToggled;
  final VoidCallback? onNewCategory;
  final VoidCallback? onAddNote;
  final VoidCallback? onBack;

  const TransactionDetailScreen({
    super.key,
    required this.transaction,
    required this.categories,
    this.selectedCategoryIds,
    this.onCategoryToggled,
    this.onNewCategory,
    this.onAddNote,
    this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final selected = selectedCategoryIds ?? transaction.selectedCategoryIds;
    final primary = selected.isEmpty ? null : selected.first;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              PaceTopBar('Transaction', back: true, onBack: onBack),
              const SizedBox(height: 8),
              IconBadge(AppIcons.of(transaction.iconKey), size: 56),
              const SizedBox(height: 12),
              Text(transaction.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(Fmt.money(transaction.amount), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
              const SizedBox(height: 6),
              Text(transaction.dateLabel, style: TextStyle(fontSize: 14, color: C.muted)),
              const SizedBox(height: 22),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    PaceCard(
                      radius: 16,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(selected.length > 1 ? 'Categories' : 'Category', style: TextStyle(fontSize: 14, color: C.muted)),
                          const SizedBox(height: 4),
                          Text(
                            'Tap to add or remove. The primary category is the one this amount counts toward in '
                            'spending and budgets; others are extra labels.',
                            style: TextStyle(fontSize: 13, color: C.muted, height: 1.3),
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 10,
                            runSpacing: 12,
                            children: [
                              for (final c in categories)
                                Tap(
                                  onTap: onCategoryToggled == null ? null : () => onCategoryToggled!(c),
                                  hint: selected.contains(c.id) ? 'Removes this category' : 'Adds this category',
                                  child: _CatChip(
                                    AppIcons.of(c.iconKey),
                                    c.name,
                                    selected.contains(c.id),
                                    primary: c.id == primary && selected.length > 1,
                                  ),
                                ),
                              Tap(onTap: onNewCategory, child: const _CatChip(Icons.add, 'New category', false)),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    PaceCard(
                      radius: 16,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      child: Column(
                        children: [
                          _KV('Account', transaction.accountLabel),
                          const HairLine(),
                          _KV('Status', transaction.statusLabel),
                          const HairLine(),
                          _KV('Merchant', transaction.merchantLabel),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    PillButton('Add a note', icon: Icons.edit, filled: false, height: 50, onPressed: onAddNote),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  /// Marks the primary category when there's more than one.
  final bool primary;
  const _CatChip(this.icon, this.label, this.selected, {this.primary = false});
  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      value: primary ? 'Primary category' : null,
      child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: selected ? C.ink : Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: selected ? C.ink : C.outline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 48, color: selected ? Colors.white : C.ink),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: selected ? Colors.white : C.ink)),
          if (primary) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(color: C.lime, borderRadius: BorderRadius.circular(6)),
              child: Text('Primary', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: C.ink)),
            ),
          ],
        ],
      ),
    ));
  }
}

class _KV extends StatelessWidget {
  final String k, v;
  const _KV(this.k, this.v);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(
          children: [
            Text(k, style: TextStyle(fontSize: 14, color: C.muted)),
            const Spacer(),
            Flexible(child: Text(v, textAlign: TextAlign.right, style: const TextStyle(fontSize: 16))),
          ],
        ),
      );
}
