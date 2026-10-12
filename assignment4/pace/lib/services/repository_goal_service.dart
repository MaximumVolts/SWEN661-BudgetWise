import '../models/app_exception.dart' show AppException;
import 'date_labels.dart' show DateLabels;
import '../models/goal.dart' show GoalContribution, SavingsGoalsData;
import '../repositories/goal_repository.dart' show GoalRepository;
import 'goal_service.dart' show GoalService;

/// [GoalService] backed by a [GoalRepository].
/// BUSINESS RULES: total saved across goals, the summary line, and applying contributions.
class RepositoryGoalService implements GoalService {
  final GoalRepository _repository;
  RepositoryGoalService(this._repository);

  @override
  Future<SavingsGoalsData> getGoals() async {
    final goals = await _repository.fetchGoals();
    if (goals.isEmpty) return const SavingsGoalsData.empty();
    final known = goals.map((g) => g.saved).whereType<double>();
    return SavingsGoalsData(
      totalSaved: known.isEmpty ? null : known.fold<double>(0, (sum, v) => sum + v),
      subtitle: '${goals.length} ${goals.length == 1 ? 'goal' : 'goals'} · kept separate from your spending budgets',
      goals: goals,
    );
  }

  @override
  Future<void> addContribution({required String goalId, required double amount}) async {
    final goal = await _repository.fetchGoal(goalId);
    if (goal == null) throw const AppException('That savings goal no longer exists.');
    await _repository.saveGoal(goal.copyWith(
      saved: (goal.saved ?? 0) + amount,
      contributions: [GoalContribution(dateLabel: DateLabels.short(DateTime.now()), amount: amount), ...goal.contributions],
    ));
  }
}
