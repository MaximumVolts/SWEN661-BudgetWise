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
  /// Controlled: pass the currently selected category id (defaults to transaction.selectedCategoryId).
  final String? selectedCategoryId;
  final ValueChanged<CategoryInfo>? onCategorySelected;
  final VoidCallback? onNewCategory;
  final VoidCallback? onAddNote;
  final VoidCallback? onBack;
  final VoidCallback? onMenu;

  const TransactionDetailScreen({
    super.key,
    required this.transaction,
    required this.categories,
    this.selectedCategoryId,
    this.onCategorySelected,
    this.onNewCategory,
    this.onAddNote,
    this.onBack,
    this.onMenu,
  });

  @override
  Widget build(BuildContext context) {
    final selected = selectedCategoryId ?? transaction.selectedCategoryId;
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              PaceTopBar('Transaction', back: true, onBack: onBack, trailing: Tap(onTap: onMenu, semanticLabel: 'Transaction options', child: const Icon(Icons.more_vert))),
              const SizedBox(height: 8),
              IconBadge(AppIcons.of(transaction.iconKey), size: 56),
              const SizedBox(height: 12),
              Text(transaction.title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w500)),
              const SizedBox(height: 4),
              Text(Fmt.money(transaction.amount), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
              const SizedBox(height: 6),
              Text(transaction.dateLabel, style: const TextStyle(fontSize: 14, color: C.muted)),
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
                          const Text('Category', style: TextStyle(fontSize: 14, color: C.muted)),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 10,
                            runSpacing: 12,
                            children: [
                              for (final c in categories)
                                Tap(
                                  onTap: onCategorySelected == null ? null : () => onCategorySelected!(c),
                                  child: _CatChip(AppIcons.of(c.iconKey), c.name, selected == c.id),
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
  const _CatChip(this.icon, this.label, this.selected);
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
        children: [
          Icon(icon, size: 18, color: selected ? Colors.white : C.ink),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: selected ? Colors.white : C.ink)),
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
            Text(k, style: const TextStyle(fontSize: 14, color: C.muted)),
            const Spacer(),
            Flexible(child: Text(v, textAlign: TextAlign.right, style: const TextStyle(fontSize: 16))),
          ],
        ),
      );
}
