import '../models/goal.dart' show SavingsGoal, SavingsGoalsData;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/goal_service.dart' show GoalService;
import 'base_controller.dart' show ScreenController;

class SavingsGoalsController extends ScreenController {
  final GoalService _service;
  SavingsGoalsController({required GoalService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  SavingsGoalsData? data;

  @override
  Future<void> fetch() async => data = await _service.getGoals();

  Future<void> addGoal() async {
    if (await navigator.openAddGoal()) await refresh();
  }

  Future<void> editGoal(SavingsGoal g) async {
    if (await navigator.openEditGoal(g.id)) await refresh();
  }

  Future<void> addContribution(SavingsGoal g) async {
    if (await navigator.openAddContribution(g.id)) await refresh();
  }
}
