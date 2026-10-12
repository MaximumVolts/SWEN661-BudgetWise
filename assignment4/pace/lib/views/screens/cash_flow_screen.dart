import 'package:flutter/material.dart'
    show Align, Alignment, Border, BorderRadius, BorderSide, BoxDecoration, BuildContext, Clip, Colors, Column,
        Container, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons, ListView, MainAxisSize, Padding,
        Row, SafeArea, Scaffold, Semantics, SizedBox, Spacer, StatelessWidget, Text, TextSpan, TextStyle, ValueChanged,
        VoidCallback, Widget;
import '../widgets/charts.dart' show CashFlowChart;
import '../format.dart' show Fmt;
import '../../models/cash_flow.dart' show AmountTone, BreakdownLine, CashFlowData;
import '../theme.dart' show C;
import '../widgets/widgets.dart' show HairLine, Heading, PaceCard, PaceChip, PaceNavBar, PillButton, PressFeedback, Tap;

/// 16 - Cash Flow Projection
class CashFlowScreen extends StatelessWidget {
  final CashFlowData data;
  final VoidCallback? onBack;
  final ValueChanged<int>? onRangeChanged;
  final ValueChanged<int>? onScenarioChanged;
  final VoidCallback? onAddExpectedIncome;
  final ValueChanged<int>? onNavTap;

  const CashFlowScreen({
    super.key,
    required this.data,
    this.onBack,
    this.onRangeChanged,
    this.onScenarioChanged,
    this.onAddExpectedIncome,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
    final total = data.projectedAmount;
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 0, onTap: onNavTap),
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
                const Heading('Cash Flow Projection', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
              ],
            ),
            const SizedBox(height: 16),
            _RangeTabs(labels: data.rangeLabels, selected: data.selectedRange, onChanged: onRangeChanged),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('Income', style: TextStyle(fontSize: 14, color: C.muted)),
                const SizedBox(width: 10),
                for (var i = 0; i < data.scenarioLabels.length; i++) ...[
                  if (i > 0) const SizedBox(width: 8),
                  Tap(
                    onTap: onScenarioChanged == null ? null : () => onScenarioChanged!(i),
                    child: PaceChip(
                      data.scenarioLabels[i],
                      selected: i == data.selectedScenario,
                      showCheck: true,
                      selectedBg: C.lime,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 16),
            Text(data.projectedDateLabel, style: TextStyle(fontSize: 13, color: C.muted)),
            Text(Fmt.money(total), style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w400)),
            if (data.lowestAmount != null) ...[
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.trending_down, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text.rich(TextSpan(style: TextStyle(fontSize: 15, height: 1.3, color: C.ink), children: [
                      TextSpan(text: 'Lowest point: ${Fmt.money(data.lowestAmount!)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      if (data.lowestDescription != null) TextSpan(text: ' ${data.lowestDescription}'),
                    ])),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 14),
            PaceCard(
              radius: 16,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(data.chartTitle, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  CashFlowChart(data: data.chart),
                ],
              ),
            ),
            const SizedBox(height: 14),
            PaceCard(
              radius: 16,
              padding: EdgeInsets.zero,
              clip: true,
              child: Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Align(alignment: Alignment.centerLeft, child: Text('How we got this', style: TextStyle(fontWeight: FontWeight.w700))),
                  ),
                  const HairLine(),
                  for (final l in data.breakdown) _Line(l),
                  Container(
                    color: C.panel,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    child: Row(children: [
                      const Text('Projected cash', style: TextStyle(fontWeight: FontWeight.w700)),
                      const Spacer(),
                      Text(Fmt.money(total), style: const TextStyle(fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            PillButton('Add expected income', icon: Icons.add, filled: false, height: 52, onPressed: onAddExpectedIncome),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _RangeTabs extends StatelessWidget {
  final List<String> labels;
  final int selected;
  final ValueChanged<int>? onChanged;
  const _RangeTabs({required this.labels, required this.selected, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 40,
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), border: Border.all(color: C.outline), color: Colors.white),
      clipBehavior: Clip.antiAlias,
      child: Row(
        children: [
          for (var i = 0; i < labels.length; i++)
            Expanded(
              child: Semantics(
                button: true,
                selected: i == selected,
                label: labels[i],
                excludeSemantics: true,
                onTap: onChanged == null ? null : () => onChanged!(i),
                child: PressFeedback(
                  onTap: onChanged == null ? null : () => onChanged!(i),
                  borderRadius: BorderRadius.zero,
                  pressedScale: 1,
                  child: Container(
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: i == selected ? C.lime : Colors.white,
                      border: i == 0 ? null : Border(left: BorderSide(color: C.outline)),
                    ),
                    child: Row(mainAxisSize: MainAxisSize.min, children: [
                      if (i == selected) ...[const Icon(Icons.check, size: 18), const SizedBox(width: 6)],
                      Text(labels[i], style: TextStyle(fontWeight: i == selected ? FontWeight.w700 : FontWeight.w500)),
                    ]),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Line extends StatelessWidget {
  final BreakdownLine l;
  const _Line(this.l);

  @override
  Widget build(BuildContext context) {
    final color = switch (l.tone) { AmountTone.positive => C.olive, AmountTone.negative => C.red, AmountTone.neutral => C.ink };
    final text = l.tone == AmountTone.neutral ? Fmt.money(l.amount) : Fmt.signed(l.tone == AmountTone.negative ? -l.amount.abs() : l.amount.abs());
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l.title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Text(l.subtitle, style: TextStyle(fontSize: 12, color: C.muted)),
                  ],
                ),
              ),
              Text(text, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: color)),
            ],
          ),
        ),
        const HairLine(indent: 16),
      ],
    );
  }
}
