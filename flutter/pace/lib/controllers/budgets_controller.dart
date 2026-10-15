import '../models/budget.dart' show BudgetCategory, BudgetOverview, BudgetPeriod;
import 'app_navigator.dart' show AppNavigator;
import '../services/budget_service.dart' show BudgetService;
import 'base_controller.dart' show ScreenController;

class BudgetsController extends ScreenController {
  final BudgetService _service;
  BudgetsController({required BudgetService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    // Budgets created, edited or deleted elsewhere (form, manager) show up here.
    refreshOn(_service.changes);
  }


  List<BudgetPeriod> periods = const [];
  int selectedPeriod = 0;
  BudgetOverview? overview;

  List<String> get periodLabels => [for (final p in periods) p.label];
  String? get selectedPeriodId => periods.isEmpty ? null : periods[selectedPeriod].id;

  @override
  Future<void> fetch() async {
    if (periods.isEmpty) {
      periods = await _service.getPeriods();
      final current = periods.indexWhere((p) => p.isCurrent); // "current period" is a service decision
      selectedPeriod = current < 0 ? 0 : current;
    }
    if (periods.isEmpty) return;
    overview = await _service.getOverview(periods[selectedPeriod].id);
  }

  Future<void> selectPeriod(int index) async {
    if (index == selectedPeriod) return;
    selectedPeriod = index;
    notifyListeners();
    await refresh();
  }

  void openCategory(BudgetCategory c) => navigator.openBudgetCategory(categoryId: c.id, periodId: selectedPeriodId);

  void addCategory() => navigator.openAddBudgetCategory();

  /// ⋮ opens the budgets manager (create, edit, delete).
  void openMenu() => navigator.openBudgetCategoriesSettings();
}
