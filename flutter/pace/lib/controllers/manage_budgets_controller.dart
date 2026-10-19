import '../models/budget.dart' show BudgetSetting;
import 'app_navigator.dart' show AppNavigator;
import '../services/budget_service.dart' show BudgetService;
import 'base_controller.dart' show ScreenController;

/// The budgets manager: list, create, edit and delete the user's budgets (which apply to every month).
class ManageBudgetsController extends ScreenController {
  final BudgetService _service;
  ManageBudgetsController({required BudgetService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    refreshOn(_service.changes);
  }


  List<BudgetSetting> budgets = const [];
  /// Category id of the budget being deleted, if any.
  String? deletingCategoryId;

  @override
  Future<void> fetch() async => budgets = await _service.budgets();

  void newBudget() => navigator.openAddBudgetCategory();

  void edit(BudgetSetting b) => navigator.openEditBudgetCategory(b.categoryId);

  /// Asks first, then deletes.
  Future<void> delete(BudgetSetting b) async {
    if (deletingCategoryId != null) return;
    if (!await navigator.confirmDeleteBudget(b.name)) return;
    deletingCategoryId = b.categoryId;
    notifyListeners();
    await perform(() => _service.deleteBudget(b.categoryId));
    deletingCategoryId = null;
    notifyListeners();
  }
}
