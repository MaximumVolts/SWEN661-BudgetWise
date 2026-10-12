import 'package:flutter/material.dart'
    show Border, BoxDecoration, BoxShape, BuildContext, Center, Column, Container, CrossAxisAlignment, EdgeInsets,
        Expanded, FontWeight, MergeSemantics, Padding, Row, SafeArea, Scaffold, Semantics, SingleChildScrollView,
        SizedBox, State, StatefulWidget, Text, TextStyle, ValueChanged, VoidCallback, Widget, Wrap;
import '../../models/onboarding.dart' show IncomeOption, PriorityOption;
import '../theme.dart' show C, T;
import '../widgets/widgets.dart' show PaceCard, PaceChip, PaceTopBar, PillButton, PressFeedback, Tap;

/// 02 - Onboarding Priorities
class OnboardingPrioritiesScreen extends StatefulWidget {
  final List<PriorityOption> priorities;
  final List<IncomeOption> incomeOptions;
  final Set<String> initialSelectedPriorityIds;
  final String? initialIncomeId;
  final void Function(Set<String> priorityIds, String? incomeId)? onContinue;
  final ValueChanged<Set<String>>? onPrioritiesChanged;
  final ValueChanged<String>? onIncomeChanged;
  final VoidCallback? onBack;

  const OnboardingPrioritiesScreen({
    super.key,
    required this.priorities,
    required this.incomeOptions,
    this.initialSelectedPriorityIds = const {},
    this.initialIncomeId,
    this.onContinue,
    this.onPrioritiesChanged,
    this.onIncomeChanged,
    this.onBack,
  });

  @override
  State<OnboardingPrioritiesScreen> createState() => _OnboardingPrioritiesScreenState();
}

class _OnboardingPrioritiesScreenState extends State<OnboardingPrioritiesScreen> {
  late final Set<String> _selected = {...widget.initialSelectedPriorityIds};
  late String? _income = widget.initialIncomeId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            PaceTopBar('What matters most?', back: true, onBack: widget.onBack),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    const Text('Set your priorities', style: T.h1),
                    const SizedBox(height: 10),
                    const Text('Choose what you want Pace to focus on first. You can change these later.', style: T.body),
                    const SizedBox(height: 22),
                    const Text('What would you like help with?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 10,
                      runSpacing: 12,
                      children: [
                        for (final o in widget.priorities)
                          Tap(
                            onTap: () {
                              setState(() => _selected.contains(o.id) ? _selected.remove(o.id) : _selected.add(o.id));
                              widget.onPrioritiesChanged?.call({..._selected});
                            },
                            child: PaceChip(
                              o.label,
                              selected: _selected.contains(o.id),
                              showCheck: true,
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    if (widget.incomeOptions.isNotEmpty)
                      PaceCard(
                        radius: 20,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(children: [for (final o in widget.incomeOptions) _incomeTile(o)]),
                      ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: PillButton('Continue', onPressed: () => widget.onContinue?.call({..._selected}, _income)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _incomeTile(IncomeOption o) {
    final selected = _income == o.id;
    return MergeSemantics(
      child: Semantics(
        inMutuallyExclusiveGroup: true,
        checked: selected,
        child: PressFeedback(
      onTap: () {
        setState(() => _income = o.id);
        widget.onIncomeChanged?.call(o.id);
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: C.ink, width: 2)),
              child: selected
                  ? Center(child: Container(width: 12, height: 12, decoration: const BoxDecoration(color: C.ink, shape: BoxShape.circle)))
                  : null,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(o.title, style: const TextStyle(fontSize: 17, color: C.ink)),
                  Text(o.subtitle, style: const TextStyle(fontSize: 16, color: C.muted)),
                ],
              ),
            ),
          ],
        ),
      ),
    )));
  }
}
