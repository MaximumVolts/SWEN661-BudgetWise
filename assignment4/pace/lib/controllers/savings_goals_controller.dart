import '../models/goal.dart' show SavingsGoal, SavingsGoalsData;
import 'app_navigator.dart' show AppNavigator;
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

  Future<void> addGoal() => refreshIf(navigator.openAddGoal());

  Future<void> editGoal(SavingsGoal g) => refreshIf(navigator.openEditGoal(g.id));

  Future<void> addContribution(SavingsGoal g) => refreshIf(navigator.openAddContribution(g.id));
}
