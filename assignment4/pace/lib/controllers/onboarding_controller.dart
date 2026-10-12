import '../models/navigation.dart' show FlowStep;
import '../models/onboarding.dart' show OnboardingOptions;
import 'app_navigator.dart' show AppNavigator;
import '../services/onboarding_service.dart' show OnboardingService;
import 'base_controller.dart' show ScreenController;

class OnboardingController extends ScreenController {
  final OnboardingService _service;
  OnboardingController({required OnboardingService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  OnboardingOptions? options;
  Set<String> selectedPriorityIds = {};
  String? incomeId;

  @override
  Future<void> fetch() async => options = await _service.loadOptions();

  void setPriorities(Set<String> ids) => selectedPriorityIds = {...ids};
  void setIncome(String id) => incomeId = id;

  Future<void> continueFlow(Set<String> priorityIds, String? income) async {
    selectedPriorityIds = {...priorityIds};
    incomeId = income;
    FlowStep? next;
    final ok = await perform(() async => next = await _service.savePreferences(priorityIds: selectedPriorityIds, incomeId: incomeId));
    final step = next;
    if (ok && step != null) navigator.openFlowStep(step);
  }
}
