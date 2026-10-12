import 'package:flutter/material.dart'
    show
        BoxDecoration,
        BoxShape,
        BuildContext,
        Color,
        Container,
        ExcludeSemantics,
        FontWeight,
        Icon,
        IconData,
        Icons,
        MainAxisSize,
        Row,
        SizedBox,
        StatelessWidget,
        Text,
        TextStyle,
        Widget;
import '../../models/budget.dart' show BudgetStatus;
import '../theme.dart' show C;
import 'display_options.dart' show PaceDisplay;

/// How each budget status looks, in one place for every screen: over is red, otherwise olive
/// (palette colors, so they become colorblind-safe in colorblind mode), each with its own shape.
extension BudgetStatusLook on BudgetStatus {
  Color get color => this == BudgetStatus.over ? C.red : C.olive;

  IconData get icon => switch (this) {
        BudgetStatus.onTrack => Icons.check_circle_outline,
        BudgetStatus.nearLimit => Icons.warning_amber_rounded,
        BudgetStatus.over => Icons.error_outline,
      };
}

/// Marks a budget status next to its label. In colorblind mode each status has its own shape: a
/// check (on track), a warning triangle (near limit) or an error circle (over); otherwise it's a
/// colored dot. Decorative: the label beside it says the status.
class BudgetStatusMark extends StatelessWidget {
  final BudgetStatus status;
  final Color color;
  final double size;
  const BudgetStatusMark(this.status, {super.key, required this.color, this.size = 16});

  @override
  Widget build(BuildContext context) {
    if (!PaceDisplay.colorblindOf(context)) {
      final dot = size / 2;
      return Container(width: dot, height: dot, decoration: BoxDecoration(color: color, shape: BoxShape.circle));
    }
    return ExcludeSemantics(child: Icon(status.icon, size: size, color: color));
  }
}

/// A budget's status as icon + label: near limit / over in bold, in their color, with their icon;
/// on track as plain text (with the ✓ shape in colorblind mode), or nothing when [hideOnTrack].
class BudgetStatusLabel extends StatelessWidget {
  final BudgetStatus status;
  final bool hideOnTrack;
  /// The "On track" text color (default muted).
  final Color? onTrackColor;
  const BudgetStatusLabel(this.status, {super.key, this.hideOnTrack = false, this.onTrackColor});

  @override
  Widget build(BuildContext context) {
    if (status == BudgetStatus.onTrack) {
      if (hideOnTrack) return const SizedBox.shrink();
      final text = Text(status.label, style: TextStyle(fontSize: 14, color: onTrackColor ?? C.muted));
      if (!PaceDisplay.colorblindOf(context)) return text;
      return Row(mainAxisSize: MainAxisSize.min, children: [
        BudgetStatusMark(status, color: status.color, size: 18),
        const SizedBox(width: 6),
        text,
      ]);
    }
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(status.icon, size: 18, color: status.color),
      const SizedBox(width: 6),
      Text(status.label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: status.color)),
    ]);
  }
}
