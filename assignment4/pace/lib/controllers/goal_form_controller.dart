import '../models/goal.dart' show GoalIcon;
import '../services/goal_service.dart' show GoalService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// Add a savings goal. UI state only: what's valid lives in [GoalService]. Field errors: 'name',
/// 'target', 'saved', 'targetDate', 'icon'.
class GoalFormController extends FormController {
  final GoalService _service;
  GoalFormController({required GoalService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  List<GoalIcon> get icons => _service.icons;
  late String? iconKey = icons.firstOrNull?.key;
  DateTime? targetDate;

  void _set(String field, void Function() change) {
    change();
    fieldErrors = {...fieldErrors}..remove(field);
    notifyListeners();
  }

  void selectIcon(GoalIcon icon) => _set('icon', () => iconKey = icon.key);
  void selectTargetDate(DateTime? date) => _set('targetDate', () => targetDate = date);

  /// Saves and goes back to the goals list on success; shows field errors otherwise.
  Future<void> save({required String name, required String target, required String saved}) async {
    final ok = await submit(
        () => _service.addGoal(name: name, target: target, saved: saved, targetDate: targetDate, iconKey: iconKey));
    if (ok) navigator.back();
  }
}
