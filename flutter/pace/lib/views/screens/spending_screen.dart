import 'package:flutter/material.dart'
    show Align, Alignment, BuildContext, Column, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight,
        FractionallySizedBox, Icon, Icons, ListView, MainAxisSize, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer,
        StatelessWidget, Text, TextStyle, ValueChanged, VoidCallback, Widget;
import '../widgets/charts.dart' show PaceBarChart;
import '../format.dart' show Fmt;
import '../../models/spending.dart' show SpendingCategory, SpendingData;
import '../theme.dart' show C;
import '../widgets/widgets.dart'
    show AppIcons, HairLine, Heading, IconBadge, PaceCard, PaceNavBar, SegTabs, StripedBar, Tap;

/// 10 - Spending
class SpendingScreen extends StatelessWidget {
  final SpendingData data;
  final ValueChanged<int>? onRangeChanged;
  final ValueChanged<int>? onBarTap;
  final ValueChanged<SpendingCategory>? onCategoryTap;
  final VoidCallback? onCalendar;
  final ValueChanged<int>? onNavTap;

  const SpendingScreen({
    super.key,
    required this.data,
    this.onRangeChanged,
    this.onBarTap,
    this.onCategoryTap,
    this.onCalendar,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
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
                const Heading('Spending', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onCalendar, semanticLabel: 'Choose date range', child: const Icon(Icons.calendar_today_outlined, size: 48)),
              ],
            ),
            const SizedBox(height: 16),
            SegTabs(data.rangeLabels, initial: data.selectedRange, onChanged: onRangeChanged),
            const SizedBox(height: 14),
            PaceCard(
              radius: 18,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.periodTitle, style: TextStyle(fontSize: 13, color: C.muted)),
                  Row(
                    children: [
                      Text(Fmt.money(data.total), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                      const Spacer(),
                      if (data.changePercent != null) _Change(data.changePercent!, big: true),
                    ],
                  ),
                  const SizedBox(height: 16),
                  PaceBarChart(bars: data.bars, highlighted: data.highlightedBar, onBarTap: onBarTap),
                ],
              ),
            ),
            const SizedBox(height: 14),
            PaceCard(
              radius: 18,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
              child: Column(
                children: [
                  for (var i = 0; i < data.categories.length; i++) ...[
                    if (i > 0) const HairLine(),
                    Tap(onTap: onCategoryTap == null ? null : () => onCategoryTap!(data.categories[i]), child: _CatRow(data.categories[i])),
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

class _Change extends StatelessWidget {
  final double pct;
  final bool big;
  const _Change(this.pct, {this.big = false});
  @override
  Widget build(BuildContext context) {
    final up = pct >= 0;
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(up ? Icons.arrow_drop_up : Icons.arrow_drop_down, size: big ? 22 : 18),
      Text(Fmt.percent(pct.abs()), style: TextStyle(fontSize: big ? 14 : 13, fontWeight: big ? FontWeight.w700 : FontWeight.w400, color: big ? C.ink : C.muted)),
    ]);
  }
}

class _CatRow extends StatelessWidget {
  final SpendingCategory c;
  const _CatRow(this.c);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Column(
        children: [
          Row(
            children: [
              IconBadge(AppIcons.of(c.iconKey), size: 44),
              const SizedBox(width: 16),
              Expanded(child: Text(c.name, style: const TextStyle(fontSize: 17))),
              // Amount and change stack on the right so long names like "Transportation" keep room.
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(Fmt.money(c.amount), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  c.changePercent == null
                      ? Text('No change', style: TextStyle(fontSize: 13, color: C.muted))
                      : _Change(c.changePercent!),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Align(
            alignment: Alignment.centerLeft,
            child: FractionallySizedBox(widthFactor: 0.22, child: StripedBar(value: c.share, height: 8)),
          ),
        ],
      ),
    );
  }
}
