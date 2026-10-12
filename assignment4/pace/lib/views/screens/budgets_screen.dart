import 'package:flutter/material.dart'
    show BuildContext, Column, Divider, EdgeInsets, FontWeight, Icon, Icons, ListView, Row, SafeArea, Scaffold,
        SizedBox, Spacer, StatelessWidget, Text, TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/budget.dart' show BudgetCategory, BudgetStatus, BudgetSummary;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart'
    show AppIcons, Heading, IconBadge, PaceCard, PaceNavBar, PillButton, SegTabs, StripedBar, Tap;

/// 08 - Budgets
class BudgetsScreen extends StatelessWidget {
  final List<String> periodLabels; // e.g. ['October', 'September']
  final int selectedPeriod;
  final BudgetSummary summary;
  final List<BudgetCategory> categories;
  final ValueChanged<int>? onPeriodChanged;
  final ValueChanged<BudgetCategory>? onCategoryTap;
  final VoidCallback? onAddCategory;
  final VoidCallback? onMenu;
  final ValueChanged<int>? onNavTap;

  const BudgetsScreen({
    super.key,
    required this.periodLabels,
    required this.selectedPeriod,
    required this.summary,
    required this.categories,
    this.onPeriodChanged,
    this.onCategoryTap,
    this.onAddCategory,
    this.onMenu,
    this.onNavTap,
  });

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
                const Heading('Budgets', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onMenu, semanticLabel: 'Budget options', child: const Icon(Icons.more_vert)),
              ],
            ),
            const SizedBox(height: 16),
            SegTabs(periodLabels, initial: selectedPeriod, onChanged: onPeriodChanged),
            const SizedBox(height: 14),
            PaceCard(
              radius: 14,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Text(summary.periodLabel, style: const TextStyle(fontSize: 15)),
                      const Spacer(),
                      Text('${Fmt.money(summary.spent)} of ${Fmt.money(summary.limit, decimals: 0)}',
                          style: const TextStyle(fontSize: 15, color: C.muted)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  StripedBar(
                    value: summary.progress,
                    color: summary.status == BudgetStatus.over ? C.red : C.olive,
                    striped: summary.status != BudgetStatus.onTrack,
                    height: 10,
                    semanticLabel: '${summary.periodLabel} budget used',
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Text(summary.remaining >= 0 ? '${Fmt.money(summary.remaining)} left' : '${Fmt.money(-summary.remaining)} over',
                          style: const TextStyle(fontSize: 15, color: C.muted)),
                      const Spacer(),
                      _StatusLabel(summary.status),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            const Heading('CATEGORIES', style: T.label),
            const SizedBox(height: 10),
            PaceCard(
              radius: 18,
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  for (var i = 0; i < categories.length; i++) ...[
                    if (i > 0) const Divider(height: 28, color: C.line),
                    Tap(onTap: onCategoryTap == null ? null : () => onCategoryTap!(categories[i]), child: _CategoryBlock(categories[i])),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 18),
            PillButton('Add category', icon: Icons.add, height: 56, onPressed: onAddCategory),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

/// Icon + label for a budget status (hidden for on-track on the summary card).
class _StatusLabel extends StatelessWidget {
  final BudgetStatus status;
  const _StatusLabel(this.status);
  @override
  Widget build(BuildContext context) {
    if (status == BudgetStatus.onTrack) return const SizedBox.shrink();
    final over = status == BudgetStatus.over;
    final color = over ? C.red : C.olive;
    return Row(children: [
      Icon(over ? Icons.error_outline : Icons.warning_amber_rounded, size: 18, color: color),
      const SizedBox(width: 6),
      Text(over ? 'Over budget' : 'Near limit', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
    ]);
  }
}

class _CategoryBlock extends StatelessWidget {
  final BudgetCategory c;
  const _CategoryBlock(this.c);

  @override
  Widget build(BuildContext context) {
    final color = c.status == BudgetStatus.over ? C.red : (c.status == BudgetStatus.nearLimit ? C.olive : C.ink);
    final statusColor = c.status == BudgetStatus.onTrack ? C.muted : color;
    return Column(
      children: [
        Row(
          children: [
            IconBadge(AppIcons.of(c.iconKey), size: 40),
            const SizedBox(width: 16),
            Text(c.name, style: const TextStyle(fontSize: 18)),
            const Spacer(),
            Text(c.remaining >= 0 ? '${Fmt.money(c.remaining)} left' : '${Fmt.money(-c.remaining)} over',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 14),
        StripedBar(value: c.progress, color: color, height: 10, striped: c.status != BudgetStatus.onTrack, semanticLabel: '${c.name} budget used'),
        const SizedBox(height: 8),
        Row(
          children: [
            if (c.status == BudgetStatus.onTrack)
              Text('On track', style: TextStyle(fontSize: 14, color: statusColor))
            else
              _StatusLabel(c.status),
            const Spacer(),
            Text('${Fmt.money(c.spent)} of ${Fmt.money(c.limit)}', style: const TextStyle(fontSize: 14, color: C.muted)),
          ],
        ),
      ],
    );
  }
}
