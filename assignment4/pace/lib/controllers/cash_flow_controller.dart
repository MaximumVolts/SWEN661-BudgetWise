import '../models/cash_flow.dart' show CashFlowData;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/cash_flow_service.dart' show CashFlowService;
import 'base_controller.dart' show ScreenController;

class CashFlowController extends ScreenController {
  final CashFlowService _service;
  CashFlowController({required CashFlowService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  CashFlowData? data;
  int rangeIndex = 0;
  int scenarioIndex = 1; // Expected

  @override
  Future<void> fetch() async => data = await _service.getProjection(rangeIndex: rangeIndex, scenarioIndex: scenarioIndex);

  Future<void> selectRange(int i) async {
    if (i == rangeIndex) return;
    rangeIndex = i;
    await refresh();
  }

  Future<void> selectScenario(int i) async {
    if (i == scenarioIndex) return;
    scenarioIndex = i;
    await refresh();
  }

  Future<void> addExpectedIncome() async {
    if (await navigator.openAddExpectedIncome()) await refresh();
  }
}
