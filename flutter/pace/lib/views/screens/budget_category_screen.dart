import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets,
        FontWeight, Icon, Icons, ListView, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Text,
        TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/budget.dart' show BudgetCategoryDetailData, BudgetStatus;
import '../../models/transaction.dart' show TransactionItem;
import '../theme.dart' show C, T;
import '../widgets/status_mark.dart' show BudgetStatusLabel, BudgetStatusLook;
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
                Tap(onTap: onBack, semanticLabel: 'Back', child: const Icon(Icons.arrow_back, size: 48)),
                const SizedBox(width: 16),
                Text(data.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onEdit, child: const Text('Edit', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16))),
              ],
            ),
            const SizedBox(height: 18),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.line)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.periodLabel, style: TextStyle(fontSize: 13, color: C.muted)),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(Fmt.money(data.spent), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text('of ${Fmt.money(data.limit, decimals: 0)}', style: TextStyle(fontSize: 14, color: C.muted)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  StripedBar(value: data.progress, color: data.status == BudgetStatus.onTrack ? C.ink : data.status.color, track: C.chip, height: 10, striped: data.status != BudgetStatus.onTrack, semanticLabel: '${data.name} budget used'),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      BudgetStatusLabel(data.status),
                      const Spacer(),
                      Text(Fmt.leftOrOver(data.remaining),
                          style: const TextStyle(fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
            if (data.paceHeadline != null || data.paceBody != null) ...[
              const SizedBox(height: 22),
              Heading('PACE', style: T.label),
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
                      Text(data.paceBody!, style: TextStyle(fontSize: 17, color: C.muted, height: 1.35)),
                  ],
                ),
              ),
            ],
            if (data.recent.isNotEmpty) ...[
              const SizedBox(height: 22),
              Heading('RECENT TRANSACTIONS', style: T.label),
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
        subtitle: Text(t.subtitle, style: TextStyle(fontSize: 13, color: C.muted)),
        trailing: Text(Fmt.signed(t.amount), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      );
}
