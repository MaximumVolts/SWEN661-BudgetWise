import '../models/transaction.dart' show CategoryInfo;
import '../services/budget_service.dart' show BudgetService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// Create a budget ([editingCategoryId] null) or edit / delete an existing one.
/// UI state only: the rules (one budget per category, valid limits) live in [BudgetService].
/// Field errors are keyed 'category' and 'limit'.
class BudgetFormController extends FormController {
  final BudgetService _service;
  final String? editingCategoryId;
  BudgetFormController({required BudgetService service, required AppNavigator navigator, this.editingCategoryId})
      : _service = service,
        super(navigator);

  bool get isEditing => editingCategoryId != null;

  /// Categories this budget can use.
  List<CategoryInfo> categories = const [];
  String? selectedCategoryId;
  /// The current limit when editing, for pre-filling the field.
  double? initialLimit;
  bool isDeleting = false;
  @override
  Future<void> fetch() async {
    categories = await _service.availableCategories(editingCategoryId: editingCategoryId);
    if (isEditing) {
      final existing = (await _service.budgets()).where((b) => b.categoryId == editingCategoryId).firstOrNull;
      initialLimit = existing?.monthlyLimit;
      selectedCategoryId = editingCategoryId;
    }
  }

  void selectCategory(CategoryInfo c) {
    selectedCategoryId = c.id;
    fieldErrors = {...fieldErrors}..remove('category');
    notifyListeners();
  }

  /// Saves and goes back on success; shows field errors otherwise.
  Future<void> save(String limit) async {
    final saved = await submit(() => isEditing
        ? _service.updateBudget(categoryId: editingCategoryId!, newCategoryId: selectedCategoryId, limit: limit)
        : _service.createBudget(categoryId: selectedCategoryId, limit: limit));
    if (saved) navigator.back();
  }

  /// Edit mode only: asks first, deletes, then goes back.
  Future<void> delete() async {
    final id = editingCategoryId;
    if (id == null || isDeleting) return;
    final name = categories.where((c) => c.id == id).firstOrNull?.name ?? 'this';
    if (!await navigator.confirmDeleteBudget(name)) return;
    isDeleting = true;
    notifyListeners();
    final ok = await perform(() => _service.deleteBudget(id));
    isDeleting = false;
    notifyListeners();
    if (ok) navigator.back();
  }
}
