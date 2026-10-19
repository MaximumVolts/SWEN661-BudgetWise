import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets,
        FontWeight, Icon, Icons, ListView, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Text, TextStyle,
        ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/bill.dart' show BillItem, BillSection;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart'
    show AppIcons, HairLine, Heading, IconBadge, ListRow, PaceCard, PaceNavBar, SegTabs, Tap;

/// 11 - Bills · Upcoming
class BillsUpcomingScreen extends StatelessWidget {
  final String summaryLabel; // "Due in the next 30 days"
  final double summaryAmount;
  final String summaryDetail; // "6 bills scheduled"
  final List<BillSection> sections;
  final ValueChanged<int>? onTabChanged; // 0 = Upcoming, 1 = Recurring
  final ValueChanged<BillItem>? onBillTap;
  final VoidCallback? onAdd;
  final ValueChanged<int>? onNavTap;

  const BillsUpcomingScreen({
    super.key,
    required this.summaryLabel,
    required this.summaryAmount,
    required this.summaryDetail,
    required this.sections,
    this.onTabChanged,
    this.onBillTap,
    this.onAdd,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: PaceNavBar(selected: 4, onTap: onNavTap),
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          children: [
            const SizedBox(height: 16),
            Row(
              children: [
                const Heading('Bills', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onAdd, semanticLabel: 'Add bill', child: const Icon(Icons.add, size: 30)),
              ],
            ),
            const SizedBox(height: 16),
            SegTabs(const ['Upcoming', 'Recurring'], onChanged: onTabChanged),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.line)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(summaryLabel, style: TextStyle(fontSize: 14, color: C.muted)),
                  const SizedBox(height: 4),
                  Text(Fmt.money(summaryAmount), style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 4),
                  Text(summaryDetail, style: TextStyle(fontSize: 14, color: C.muted)),
                ],
              ),
            ),
            for (final s in sections) ...[
              const SizedBox(height: 20),
              Heading(s.title.toUpperCase(), style: T.label),
              const SizedBox(height: 8),
              PaceCard(
                radius: 16,
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Column(
                  children: [
                    for (var i = 0; i < s.items.length; i++) ...[
                      if (i > 0) const HairLine(),
                      Tap(onTap: onBillTap == null ? null : () => onBillTap!(s.items[i]), child: _Bill(s.items[i])),
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

class _Bill extends StatelessWidget {
  final BillItem b;
  const _Bill(this.b);
  @override
  Widget build(BuildContext context) => ListRow(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
        leading: IconBadge(AppIcons.of(b.iconKey), bg: b.isOverdue ? C.redBg : C.chip, fg: b.isOverdue ? C.red : C.ink, size: 40),
        title: b.title,
        titleStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w500),
        subtitle: Text(b.subtitle, style: TextStyle(fontSize: 13, color: b.isOverdue ? C.red : C.muted)),
        trailing: Text(Fmt.money(b.amount), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      );
}
