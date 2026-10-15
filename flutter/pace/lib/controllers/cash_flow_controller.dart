import '../models/cash_flow.dart' show BreakdownLine, CashFlowData;
import 'app_navigator.dart' show AppNavigator;
import '../services/cash_flow_service.dart' show CashFlowService;
import 'base_controller.dart' show ScreenController;

class CashFlowController extends ScreenController {
  final CashFlowService _service;
  CashFlowController({required CashFlowService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    // e.g. back from adding expected income: include it.
    refreshOn(_service.changes);
  }

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

  void addExpectedIncome() => navigator.openAddExpectedIncome();

  /// Removes income the user added (after confirming); the projection reloads.
  Future<void> removeExpectedIncome(BreakdownLine line) async {
    final id = line.expectedIncomeId;
    if (id == null || !await navigator.confirmRemoveExpectedIncome(line.title)) return;
    await perform(() => _service.removeExpectedIncome(id));
  }
}
