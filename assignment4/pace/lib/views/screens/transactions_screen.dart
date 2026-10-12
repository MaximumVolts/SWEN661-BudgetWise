import 'package:flutter/material.dart'
    show Axis, Border, BorderRadius, BoxDecoration, BoxShape, BuildContext, Center, Colors, Column, Container,
        CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, ListView, MainAxisSize, Padding, Row,
        SafeArea, Scaffold, SingleChildScrollView, SizedBox, Spacer, StatelessWidget, Text, TextStyle, ValueChanged,
        VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/transaction.dart' show TransactionGroup, TransactionItem;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, Heading, IconBadge, PaceCard, PaceNavBar, Tap;

/// 06 - Transactions
class TransactionsScreen extends StatelessWidget {
  final List<TransactionGroup> groups;
  /// Current filter labels shown on the three filter buttons.
  final String accountFilterLabel;
  final String categoryFilterLabel;
  final String dateFilterLabel;
  /// Highlights a filter as active (dark fill).
  final bool accountFilterActive;
  final bool categoryFilterActive;
  final bool dateFilterActive;
  final VoidCallback? onAccountFilter;
  final VoidCallback? onCategoryFilter;
  final VoidCallback? onDateFilter;
  final VoidCallback? onHeaderAction;
  final ValueChanged<TransactionItem>? onTransactionTap;
  final ValueChanged<int>? onNavTap;
  /// Shown when [groups] is empty.
  final String emptyMessage;

  const TransactionsScreen({
    super.key,
    required this.groups,
    this.accountFilterLabel = 'All accounts',
    this.categoryFilterLabel = 'Category',
    this.dateFilterLabel = 'Date',
    this.accountFilterActive = true,
    this.categoryFilterActive = false,
    this.dateFilterActive = false,
    this.onAccountFilter,
    this.onCategoryFilter,
    this.onDateFilter,
    this.onHeaderAction,
    this.onTransactionTap,
    this.onNavTap,
    this.emptyMessage = 'No transactions to show.',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 1, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            Row(
              children: [
                const Heading('Transactions', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(
                  onTap: onHeaderAction,
                  semanticLabel: 'Transaction actions',
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: C.ink, width: 1.5)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  Tap(onTap: onAccountFilter, child: _Filter(accountFilterLabel, dark: accountFilterActive)),
                  const SizedBox(width: 10),
                  Tap(onTap: onCategoryFilter, child: _Filter(categoryFilterLabel, dark: categoryFilterActive)),
                  const SizedBox(width: 10),
                  Tap(onTap: onDateFilter, child: _Filter(dateFilterLabel, dark: dateFilterActive)),
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (groups.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 48),
                child: Center(child: Text(emptyMessage, style: T.body)),
              ),
            for (final g in groups) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 10, 0, 6),
                child: Row(
                  children: [
                    Text(g.dayLabel, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    const Spacer(),
                    Text(Fmt.signed(g.total), style: const TextStyle(fontSize: 14, color: C.muted)),
                  ],
                ),
              ),
              for (final t in g.items)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Tap(onTap: onTransactionTap == null ? null : () => onTransactionTap!(t), child: _TxnCard(t)),
                ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Filter extends StatelessWidget {
  final String label;
  final bool dark;
  const _Filter(this.label, {this.dark = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: dark ? C.ink : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: dark ? C.ink : C.outline),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.keyboard_arrow_down, size: 20, color: dark ? Colors.white : C.ink),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: dark ? Colors.white : C.ink)),
        ],
      ),
    );
  }
}

class _TxnCard extends StatelessWidget {
  final TransactionItem t;
  const _TxnCard(this.t);

  @override
  Widget build(BuildContext context) {
    return PaceCard(
      radius: 14,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
      child: Row(
        children: [
          IconBadge(AppIcons.of(t.iconKey), bg: t.highlight ? C.lime : C.chip, size: 44),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w500)),
                const SizedBox(height: 2),
                Text(t.subtitle, style: const TextStyle(fontSize: 13, color: C.muted)),
              ],
            ),
          ),
          Text(Fmt.signed(t.amount), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(width: 4),
        ],
      ),
    );
  }
}
