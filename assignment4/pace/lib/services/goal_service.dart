import '../models/goal.dart' show GoalIcon, SavingsGoalsData;

abstract class GoalService {
  Future<SavingsGoalsData> getGoals();
  Future<void> addContribution({required String goalId, required double amount});

  /// Icons a goal can have (the first is the default).
  List<GoalIcon> get icons;

  /// Creates a goal from what the user entered: [target] and [saved] as typed ("1500", "$250.50";
  /// [saved] may be empty), an optional [targetDate]. Throws FieldValidationException ('name',
  /// 'target', 'saved', 'targetDate', 'icon').
  Future<void> addGoal({
    required String name,
    required String target,
    required String saved,
    required DateTime? targetDate,
    required String? iconKey,
  });

  /// Emits after a goal is added or changed, so the goals list can reload.
  Stream<void> get changes;
}
