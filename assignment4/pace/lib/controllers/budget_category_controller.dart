import '../models/budget.dart' show BudgetCategoryDetailData;
import '../models/transaction.dart' show TransactionItem;
import 'app_navigator.dart' show AppNavigator;
import '../services/budget_service.dart' show BudgetService;
import 'base_controller.dart' show ScreenController;

class BudgetCategoryController extends ScreenController {
  final BudgetService _service;
  final String categoryId;
  final String periodId;
  BudgetCategoryController({required this.categoryId, required this.periodId, required BudgetService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    listen(_service.changes, (_) => _onBudgetsChanged());
  }


  BudgetCategoryDetailData? data;

  @override
  Future<void> fetch() async => data = await _service.getCategoryDetail(categoryId: categoryId, periodId: periodId);

  /// Refresh after an edit; leave if this category's budget was deleted or moved.
  Future<void> _onBudgetsChanged() async {
    if (await _service.hasBudget(categoryId)) {
      await refresh();
    } else {
      navigator.back();
    }
  }

  void edit() => navigator.openEditBudgetCategory(categoryId);

  void openTransaction(TransactionItem t) => navigator.openTransaction(t.id);
}
