import 'package:flutter/material.dart'
    show
        BuildContext,
        Column,
        CrossAxisAlignment,
        EdgeInsets,
        Expanded,
        FontWeight,
        Padding,
        Row,
        Semantics,
        SizedBox,
        StatelessWidget,
        Text,
        TextStyle,
        Widget;
import '../../models/budget.dart' show BudgetStatus;
import '../theme.dart' show C;
import 'display_options.dart' show PaceDisplay;
import 'status_mark.dart' show BudgetStatusLook, BudgetStatusMark;
import 'widgets.dart' show StripedBar;

/// A live sample of how budget statuses look right now, shown under the Colorblind mode switch so
/// flipping it visibly changes something on the spot: colored dots and plain bars become shapes
/// and striped bars, and green / red become blue / orange.
class ColorblindPreview extends StatelessWidget {
  const ColorblindPreview({super.key});

  @override
  Widget build(BuildContext context) {
    final on = PaceDisplay.colorblindOf(context);
    return Semantics(
      label: on
          ? 'Preview: colorblind mode is on. Statuses use shapes, stripes, blue and orange.'
          : 'Preview: colorblind mode is off. Statuses use colored dots.',
      excludeSemantics: true,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(66, 0, 14, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(on ? 'PREVIEW · COLORBLIND MODE ON' : 'PREVIEW · COLORBLIND MODE OFF',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.4, color: C.muted)),
            const SizedBox(height: 8),
            Row(
              children: [
                _sample(BudgetStatus.onTrack, 0.45, on),
                const SizedBox(width: 12),
                _sample(BudgetStatus.nearLimit, 0.85, on),
                const SizedBox(width: 12),
                _sample(BudgetStatus.over, 1, on),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _sample(BudgetStatus status, double value, bool on) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              BudgetStatusMark(status, color: status.color, size: 16),
              const SizedBox(width: 4),
              Expanded(child: Text(status.label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: status.color))),
            ]),
            const SizedBox(height: 6),
            StripedBar(value: value, color: status.color, height: 6, striped: on && status != BudgetStatus.onTrack),
          ],
        ),
      );
}
