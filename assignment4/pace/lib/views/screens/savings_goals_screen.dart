import 'package:flutter/material.dart'
    show BuildContext, Color, Column, Container, CrossAxisAlignment, EdgeInsets, Expanded, FontWeight, Icon, Icons,
        ListView, Padding, Row, SafeArea, Scaffold, SizedBox, Spacer, StatelessWidget, Text, TextBaseline, TextSpan,
        TextStyle, ValueChanged, VoidCallback, Widget;
import '../format.dart' show Fmt;
import '../../models/goal.dart' show SavingsGoal, SavingsGoalsData;
import '../theme.dart' show C;
import '../widgets/widgets.dart'
    show AppIcons, HairLine, Heading, IconBadge, PaceCard, PaceNavBar, PillButton, StripedBar, Tap;

/// 13 - Savings Goals
class SavingsGoalsScreen extends StatelessWidget {
  final SavingsGoalsData data;
  final VoidCallback? onBack;
  final VoidCallback? onAddGoal;
  final ValueChanged<SavingsGoal>? onEditGoal;
  final ValueChanged<SavingsGoal>? onAddContribution;
  final ValueChanged<int>? onNavTap;

  const SavingsGoalsScreen({
    super.key,
    required this.data,
    this.onBack,
    this.onAddGoal,
    this.onEditGoal,
    this.onAddContribution,
    this.onNavTap,
  });

  @override
  Widget build(BuildContext context) {
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
                const Heading('Savings Goals', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w500)),
                const Spacer(),
                Tap(onTap: onAddGoal, semanticLabel: 'Add savings goal', child: const Icon(Icons.add, size: 30)),
              ],
            ),
            const SizedBox(height: 20),
            const Text('Saved toward goals', style: TextStyle(fontSize: 14, color: C.muted)),
            const SizedBox(height: 4),
            Text(Fmt.moneyOrMissing(data.totalSaved), style: const TextStyle(fontSize: 44, fontWeight: FontWeight.w400)),
            const SizedBox(height: 4),
            Text(data.subtitle ?? 'No savings goal data found', style: const TextStyle(fontSize: 14, color: C.muted)),
            const SizedBox(height: 18),
            PaceCard(
              radius: 20,
              padding: data.isEmpty ? const EdgeInsets.all(20) : EdgeInsets.zero,
              clip: true,
              child: data.isEmpty
                  ? const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('No savings goals yet', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        SizedBox(height: 4),
                        Text('Tap + to add your first goal.', style: TextStyle(fontSize: 14, color: C.muted)),
                      ],
                    )
                  : Column(
                      children: [
                        for (var i = 0; i < data.goals.length; i++) ...[
                          if (i > 0) const HairLine(),
                          _GoalBlock(
                            goal: data.goals[i],
                            onEdit: onEditGoal,
                            onAddContribution: onAddContribution,
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

class _GoalBlock extends StatelessWidget {
  final SavingsGoal goal;
  final ValueChanged<SavingsGoal>? onEdit;
  final ValueChanged<SavingsGoal>? onAddContribution;
  const _GoalBlock({required this.goal, this.onEdit, this.onAddContribution});

  @override
  Widget build(BuildContext context) {
    final hasHistory = goal.contributions.isNotEmpty;
    final name = goal.name ?? 'Unnamed goal';
    final pct = goal.hasProgress ? '${(goal.progress * 100).round()}%' : Fmt.missing;
    final remaining = goal.remaining;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  IconBadge(AppIcons.of(goal.iconKey), bg: C.lime, size: 48, square: true),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        Text(goal.subtitle ?? 'No details available', style: const TextStyle(fontSize: 12.5, color: C.muted)),
                      ],
                    ),
                  ),
                  Tap(onTap: onEdit == null ? null : () => onEdit!(goal), semanticLabel: 'Edit $name', child: const Icon(Icons.edit_note, size: 26)),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(Fmt.moneyOrMissing(goal.saved), style: const TextStyle(fontSize: 30)),
                  const SizedBox(width: 6),
                  Text('of ${Fmt.moneyOrMissing(goal.target, decimals: 0)}', style: const TextStyle(fontSize: 14, color: C.muted)),
                ],
              ),
              const SizedBox(height: 8),
              StripedBar(value: goal.progress, height: 6, track: const Color(0xFFD3D1C9), semanticLabel: '$name progress'),
              const SizedBox(height: 6),
              Row(
                children: [
                  Text('$pct saved', style: const TextStyle(fontSize: 12, color: C.muted)),
                  const Spacer(),
                  Text('${Fmt.moneyOrMissing(remaining == null || remaining >= 0 ? remaining : 0)} to go', style: const TextStyle(fontSize: 12, color: C.muted)),
                ],
              ),
            ],
          ),
        ),
        if (goal.tip != null)
          Container(
            width: double.infinity,
            color: C.chip,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                const Icon(Icons.lightbulb_outline, size: 22),
                const SizedBox(width: 12),
                Expanded(child: _tip(goal.tip!, goal.tipHighlight)),
              ],
            ),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (hasHistory) ...[
                const Text('Recent contributions', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                for (var i = 0; i < goal.contributions.length; i++) ...[
                  if (i > 0) const HairLine(),
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Row(children: [
                      Text(goal.contributions[i].dateLabel, style: const TextStyle(fontSize: 14)),
                      const Spacer(),
                      Text(Fmt.signed(goal.contributions[i].amount), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                ],
                const SizedBox(height: 16),
              ],
              PillButton(
                'Add contribution',
                icon: Icons.add,
                height: 48,
                background: hasHistory ? null : C.chip,
                foreground: hasHistory ? null : C.ink,
                onPressed: onAddContribution == null ? null : () => onAddContribution!(goal),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _tip(String text, String? highlight) {
    const base = TextStyle(fontSize: 16, height: 1.3, color: C.ink);
    final i = highlight == null ? -1 : text.indexOf(highlight);
    if (i < 0) return Text(text, style: base);
    return Text.rich(TextSpan(style: base, children: [
      TextSpan(text: text.substring(0, i)),
      TextSpan(text: highlight, style: const TextStyle(fontWeight: FontWeight.w700)),
      TextSpan(text: text.substring(i + highlight!.length)),
    ]));
  }
}
