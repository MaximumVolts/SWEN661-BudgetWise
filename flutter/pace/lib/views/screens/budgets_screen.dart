import 'package:flutter/material.dart'
    show BuildContext, Column, Divider, EdgeInsets, FontWeight, Icon, Icons, ListView, Row, SafeArea, Scaffold,
        SizedBox, Spacer, StatelessWidget, Text, TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/budget.dart' show BudgetCategory, BudgetStatus, BudgetSummary;
import '../theme.dart' show C, T;
import '../widgets/status_mark.dart' show BudgetStatusLabel, BudgetStatusLook;
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
                Tap(onTap: onMenu, semanticLabel: 'Budget options', child: const Icon(Icons.more_vert, size: 48)),
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
                          style: TextStyle(fontSize: 15, color: C.muted)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  StripedBar(
                    value: summary.progress,
                    color: summary.status.color,
                    striped: summary.status != BudgetStatus.onTrack,
                    height: 10,
                    semanticLabel: '${summary.periodLabel} budget used',
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Text(Fmt.leftOrOver(summary.remaining),
                          style: TextStyle(fontSize: 15, color: C.muted)),
                      const Spacer(),
                      BudgetStatusLabel(summary.status, hideOnTrack: true),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            Heading('CATEGORIES', style: T.label),
            const SizedBox(height: 10),
            PaceCard(
              radius: 18,
              padding: const EdgeInsets.all(16),
              child: categories.isEmpty
                  ? Text(
                      'No budgets yet. Create one to set a monthly limit for a spending category; it applies to '
                      'every month.',
                      style: T.body,
                    )
                  : Column(
                      children: [
                        for (var i = 0; i < categories.length; i++) ...[
                          if (i > 0) Divider(height: 28, color: C.line),
                          Tap(onTap: onCategoryTap == null ? null : () => onCategoryTap!(categories[i]), child: _CategoryBlock(categories[i])),
                        ],
                      ],
                    ),
            ),
            const SizedBox(height: 18),
            PillButton('New budget', icon: Icons.add, height: 56, onPressed: onAddCategory),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _CategoryBlock extends StatelessWidget {
  final BudgetCategory c;
  const _CategoryBlock(this.c);

  @override
  Widget build(BuildContext context) {
    final color = c.status == BudgetStatus.onTrack ? C.ink : c.status.color;
    return Column(
      children: [
        Row(
          children: [
            IconBadge(AppIcons.of(c.iconKey), size: 40),
            const SizedBox(width: 16),
            Text(c.name, style: const TextStyle(fontSize: 18)),
            const Spacer(),
            Text(Fmt.leftOrOver(c.remaining),
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        const SizedBox(height: 14),
        StripedBar(value: c.progress, color: color, height: 10, striped: c.status != BudgetStatus.onTrack, semanticLabel: '${c.name} budget used'),
        const SizedBox(height: 8),
        Row(
          children: [
            BudgetStatusLabel(c.status),
            const Spacer(),
            Text('${Fmt.money(c.spent)} of ${Fmt.money(c.limit)}', style: TextStyle(fontSize: 14, color: C.muted)),
          ],
        ),
      ],
    );
  }
}
