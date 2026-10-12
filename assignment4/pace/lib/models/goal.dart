/// Savings goals.
library;

class GoalContribution {
  final String dateLabel;
  final double amount;
  const GoalContribution({required this.dateLabel, required this.amount});
}

/// Fields are nullable so a partially-populated goal from the repository still renders;
/// the View substitutes a "missing data" placeholder for anything that is null.
class SavingsGoal {
  final String id;
  final String? name;
  final String? subtitle;
  final String iconKey;
  final double? saved;
  final double? target;
  final String? tip;
  /// Substring of [tip] to render in bold.
  final String? tipHighlight;
  final List<GoalContribution> contributions;
  const SavingsGoal({
    required this.id,
    this.name,
    this.subtitle,
    this.iconKey = 'savings',
    this.saved,
    this.target,
    this.tip,
    this.tipHighlight,
    this.contributions = const [],
  });
  /// False when [saved] or [target] is unknown, so progress can't be computed.
  bool get hasProgress => saved != null && target != null;
  double get progress => !hasProgress || target! <= 0 ? 0 : (saved! / target!).clamp(0.0, 1.0).toDouble();
  double? get remaining => hasProgress ? target! - saved! : null;

  SavingsGoal copyWith({
    String? name,
    String? subtitle,
    String? iconKey,
    double? saved,
    double? target,
    String? tip,
    String? tipHighlight,
    List<GoalContribution>? contributions,
  }) =>
      SavingsGoal(
        id: id,
        name: name ?? this.name,
        subtitle: subtitle ?? this.subtitle,
        iconKey: iconKey ?? this.iconKey,
        saved: saved ?? this.saved,
        target: target ?? this.target,
        tip: tip ?? this.tip,
        tipHighlight: tipHighlight ?? this.tipHighlight,
        contributions: contributions ?? this.contributions,
      );
}

class SavingsGoalsData {
  /// null => no total available (e.g. no goals found).
  final double? totalSaved;
  final String? subtitle;
  final List<SavingsGoal> goals;
  const SavingsGoalsData({this.totalSaved, this.subtitle, this.goals = const []});
  /// What the screen shows when the repository has no goals.
  const SavingsGoalsData.empty() : this();
  bool get isEmpty => goals.isEmpty;
}
