import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets,
        FontWeight, Icon, Icons, ListView, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Text,
        TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/budget.dart' show BudgetCategoryDetailData, BudgetStatus;
import '../../models/transaction.dart' show TransactionItem;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart'
    show AppIcons, HairLine, Heading, IconBadge, ListRow, PaceCard, PaceNavBar, StripedBar, Tap;

/// 09 - Budget Category Detail
class BudgetCategoryScreen extends StatelessWidget {
  final BudgetCategoryDetailData data;
  final VoidCallback? onBack;
  final VoidCallback? onEdit;
  final ValueChanged<TransactionItem>? onTransactionTap;
  final ValueChanged<int>? onNavTap;

  const BudgetCategoryScreen({super.key, required this.data, this.onBack, this.onEdit, this.onTransactionTap, this.onNavTap});

  @override
  Widget build(BuildContext context) {
    final over = data.status == BudgetStatus.over;
    final color = over ? C.red : C.olive;
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 3, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            Row(
              children: [
                Tap(onTap: onBack, semanticLabel: 'Back', child: const Icon(Icons.arrow_back, size: 28)),
                const SizedBox(width: 16),
                Text(data.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onEdit, child: const Text('Edit', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.line)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.periodLabel, style: const TextStyle(fontSize: 13, color: C.muted)),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(Fmt.money(data.spent), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text('of ${Fmt.money(data.limit, decimals: 0)}', style: const TextStyle(fontSize: 14, color: C.muted)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  StripedBar(value: data.progress, color: data.status == BudgetStatus.onTrack ? C.ink : color, track: C.chip, height: 10, striped: data.status != BudgetStatus.onTrack, semanticLabel: '${data.name} budget used'),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      if (data.status != BudgetStatus.onTrack) ...[
                        Icon(over ? Icons.error_outline : Icons.warning_amber_rounded, size: 18, color: color),
                        const SizedBox(width: 6),
                        Text(over ? 'Over budget' : 'Near limit', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
                      ] else
                        const Text('On track', style: TextStyle(fontSize: 14, color: C.muted)),
                      const Spacer(),
                      Text(data.remaining >= 0 ? '${Fmt.money(data.remaining)} left' : '${Fmt.money(-data.remaining)} over',
                          style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
            if (data.paceHeadline != null || data.paceBody != null) ...[
              const SizedBox(height: 22),
              const Heading('PACE', style: T.label),
              const SizedBox(height: 10),
              PaceCard(
                radius: 16,
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (data.paceHeadline != null)
                      Text(data.paceHeadline!, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, height: 1.3)),
                    if (data.paceHeadline != null && data.paceBody != null) const SizedBox(height: 10),
                    if (data.paceBody != null)
                      Text(data.paceBody!, style: const TextStyle(fontSize: 17, color: C.muted, height: 1.35)),
                  ],
                ),
              ),
            ],
            if (data.recent.isNotEmpty) ...[
              const SizedBox(height: 22),
              const Heading('RECENT TRANSACTIONS', style: T.label),
              const SizedBox(height: 10),
              PaceCard(
                radius: 16,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Column(
                  children: [
                    for (var i = 0; i < data.recent.length; i++) ...[
                      if (i > 0) const HairLine(),
                      Tap(onTap: onTransactionTap == null ? null : () => onTransactionTap!(data.recent[i]), child: _Txn(data.recent[i])),
                    ],
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _Txn extends StatelessWidget {
  final TransactionItem t;
  const _Txn(this.t);
  @override
  Widget build(BuildContext context) => ListRow(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
        leading: IconBadge(AppIcons.of(t.iconKey), size: 44),
        title: t.title,
        titleStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w500),
        subtitle: Text(t.subtitle, style: const TextStyle(fontSize: 13, color: C.muted)),
        trailing: Text(Fmt.signed(t.amount), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      );
}
