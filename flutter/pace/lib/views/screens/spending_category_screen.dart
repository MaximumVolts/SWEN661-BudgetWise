import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets, Expanded,
        FontWeight, Icon, Icons, ListView, MainAxisSize, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget,
        Text, TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/spending.dart' show SpendingCategoryDetailData;
import '../../models/transaction.dart' show TransactionItem;
import '../theme.dart' show C, T;
import '../widgets/charts.dart' show PaceBarChart;
import '../widgets/widgets.dart' show AppIcons, HairLine, Heading, IconBadge, ListRow, PaceCard, PaceNavBar, Tap;

/// 10b - Spending by category: one category over the period chosen on Spending.
class SpendingCategoryScreen extends StatelessWidget {
  final SpendingCategoryDetailData data;
  final VoidCallback? onBack;
  final ValueChanged<int>? onBarTap;
  final ValueChanged<TransactionItem>? onTransactionTap;
  final ValueChanged<int>? onNavTap;

  const SpendingCategoryScreen({
    super.key,
    required this.data,
    this.onBack,
    this.onBarTap,
    this.onTransactionTap,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
    final change = data.changePercent;
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 2, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            Row(
              children: [
                Tap(onTap: onBack, semanticLabel: 'Back', child: const Icon(Icons.arrow_back, size: 48)),
                const SizedBox(width: 16),
                IconBadge(AppIcons.of(data.iconKey), size: 36),
                const SizedBox(width: 12),
                Expanded(child: Heading(data.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500))),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.line)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.periodTitle, style: TextStyle(fontSize: 13, color: C.muted)),
                  Row(
                    children: [
                      Text(Fmt.money(data.amount), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      if (change != null)
                        Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(change >= 0 ? Icons.arrow_drop_up : Icons.arrow_drop_down, size: 22),
                          Text(Fmt.percent(change.abs()), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                        ]),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    [
                      '${(data.shareOfTotal * 100).round()}% of your spending',
                      change == null ? 'nothing to compare with before' : 'vs the period before',
                    ].join(' · '),
                    style: TextStyle(fontSize: 13, color: C.muted),
                  ),
                  const SizedBox(height: 16),
                  PaceBarChart(bars: data.bars, highlighted: data.highlightedBar, onBarTap: onBarTap),
                ],
              ),
            ),
            const SizedBox(height: 14),
            PaceCard(
              radius: 16,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  _Stat('Transactions', '${data.transactionCount}'),
                  _Stat('Average', data.averageAmount == null ? Fmt.missing : Fmt.money(data.averageAmount!)),
                  _Stat('Largest', data.largestAmount == null ? Fmt.missing : Fmt.money(data.largestAmount!)),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Heading('TRANSACTIONS', style: T.label),
            const SizedBox(height: 10),
            if (data.transactions.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text('No ${data.name.toLowerCase()} spending in this period.', style: T.body),
              )
            else
              PaceCard(
                radius: 16,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Column(
                  children: [
                    for (var i = 0; i < data.transactions.length; i++) ...[
                      if (i > 0) const HairLine(),
                      Tap(
                        onTap: onTransactionTap == null ? null : () => onTransactionTap!(data.transactions[i]),
                        child: _Txn(data.transactions[i]),
                      ),
                    ],
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label, value;
  const _Stat(this.label, this.value);
  @override
  Widget build(BuildContext context) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 13, color: C.muted)),
            const SizedBox(height: 2),
            Text(value, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}

class _Txn extends StatelessWidget {
  final TransactionItem t;
  const _Txn(this.t);
  @override
  Widget build(BuildContext context) => ListRow(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
        leading: IconBadge(AppIcons.of(t.iconKey), size: 24),
        title: t.title,
        titleStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        subtitle: Text(t.subtitle, style: TextStyle(fontSize: 12, color: C.muted)),
        trailing: Text(Fmt.signed(t.amount), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
      );
}
