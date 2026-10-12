import '../models/goal.dart' show SavingsGoalsData;

abstract class GoalService {
  Future<SavingsGoalsData> getGoals();
  Future<void> addContribution({required String goalId, required double amount});
}
