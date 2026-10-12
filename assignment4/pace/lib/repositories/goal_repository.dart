import '../models/goal.dart' show SavingsGoal;

/// Data-access layer for savings goals: only reads and writes records, no business rules
/// (those live in GoalService). Implement this against your real storage (REST, Firebase,
/// SQLite…) and pass it to RepositoryGoalService; nothing above the service changes.
abstract class GoalRepository {
  /// All stored goals. Returns an empty list when none exist.
  Future<List<SavingsGoal>> fetchGoals();
  /// null when no goal with [id] exists.
  Future<SavingsGoal?> fetchGoal(String id);
  /// Inserts or replaces the goal with the same id.
  Future<void> saveGoal(SavingsGoal goal);
  Future<void> deleteGoal(String id);
}

/// Session-only storage. Starts empty unless [seed] is given, so the screen shows its
/// "missing data" state until a real repository is connected.
class InMemoryGoalRepository implements GoalRepository {
  final List<SavingsGoal> _goals;
  InMemoryGoalRepository([List<SavingsGoal> seed = const []]) : _goals = [...seed];

  @override
  Future<List<SavingsGoal>> fetchGoals() async => List.unmodifiable(_goals);

  @override
  Future<SavingsGoal?> fetchGoal(String id) async {
    for (final g in _goals) {
      if (g.id == id) return g;
    }
    return null;
  }

  @override
  Future<void> saveGoal(SavingsGoal goal) async {
    final i = _goals.indexWhere((g) => g.id == goal.id);
    if (i < 0) {
      _goals.add(goal);
    } else {
      _goals[i] = goal;
    }
  }

  @override
  Future<void> deleteGoal(String id) async => _goals.removeWhere((g) => g.id == id);
}
