import 'package:flutter/material.dart'
    show Border, BorderRadius, BoxDecoration, BuildContext, Column, Container, CrossAxisAlignment, EdgeInsets, Expanded,
        FontWeight, Icon, Icons, ListView, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Text,
        TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/bill.dart' show RecurringItem, SubscriptionStatus;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show AppIcons, HairLine, Heading, IconBadge, PaceCard, PaceNavBar, SegTabs, Tap;

/// 12 - Bills · Recurring & Subscriptions
class BillsRecurringScreen extends StatelessWidget {
  final double monthlyTotal;
  final double yearlyTotal;
  final List<RecurringItem> items;
  final String? insight;
  final ValueChanged<int>? onTabChanged; // 0 = Upcoming, 1 = Recurring
  final ValueChanged<RecurringItem>? onItemTap;
  final ValueChanged<RecurringItem>? onItemMenu;
  final VoidCallback? onAdd;
  final ValueChanged<int>? onNavTap;

  const BillsRecurringScreen({
    super.key,
    required this.monthlyTotal,
    required this.yearlyTotal,
    required this.items,
    this.insight,
    this.onTabChanged,
    this.onItemTap,
    this.onItemMenu,
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
                Tap(onTap: onAdd, semanticLabel: 'Add bill or subscription', child: const Icon(Icons.add, size: 30)),
              ],
            ),
            const SizedBox(height: 16),
            SegTabs(const ['Upcoming', 'Recurring'], initial: 1, onChanged: onTabChanged),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(child: _Stat('Monthly', Fmt.money(monthlyTotal))),
                const SizedBox(width: 14),
                Expanded(child: _Stat('Yearly', Fmt.money(yearlyTotal))),
              ],
            ),
            const SizedBox(height: 20),
            Heading('RECURRING & SUBSCRIPTIONS', style: T.label),
            const SizedBox(height: 8),
            PaceCard(
              radius: 16,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Column(
                children: [
                  for (var i = 0; i < items.length; i++) ...[
                    if (i > 0) const HairLine(),
                    Tap(onTap: onItemTap == null ? null : () => onItemTap!(items[i]), child: _Sub(items[i], onMenu: onItemMenu)),
                  ],
                ],
              ),
            ),
            if (insight != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: C.chip, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.line)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Subscription insight', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text(insight!, style: TextStyle(fontSize: 17, color: C.muted, height: 1.35)),
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

class _Stat extends StatelessWidget {
  final String label, value;
  const _Stat(this.label, this.value);
  @override
  Widget build(BuildContext context) => PaceCard(
        radius: 16,
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 14, color: C.muted)),
            const SizedBox(height: 6),
            Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w500)),
          ],
        ),
      );
}

class _Sub extends StatelessWidget {
  final RecurringItem item;
  final ValueChanged<RecurringItem>? onMenu;
  const _Sub(this.item, {this.onMenu});

  @override
  Widget build(BuildContext context) {
    final active = item.status == SubscriptionStatus.active;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 12),
      child: Row(
        children: [
          IconBadge(AppIcons.of(item.iconKey), size: 44),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(item.detailLine, style: TextStyle(fontSize: 14, color: C.muted)),
                Text(item.yearlyLine, style: TextStyle(fontSize: 14, color: C.muted)),
              ],
            ),
          ),
          Icon(active ? Icons.check_circle_outline : Icons.pause_circle_outline, size: 18, color: active ? C.ink : C.muted),
          const SizedBox(width: 6),
          Text(active ? 'Active' : 'Paused', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: active ? C.ink : C.muted)),
          const SizedBox(width: 6),
          Tap(onTap: onMenu == null ? null : () => onMenu!(item), semanticLabel: 'Options for ${item.name}', child: const Icon(Icons.more_vert, size: 20)),
        ],
      ),
    );
  }
}
