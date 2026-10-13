import '../models/budget.dart' show BudgetCategoryDetailData, BudgetOverview, BudgetPeriod, BudgetSetting;
import '../models/transaction.dart' show CategoryInfo;

/// BUSINESS RULES: a budget's limit carries over to every month, while the spending measured
/// against it is each month's own. Also: which period is current (`BudgetPeriod.isCurrent`),
/// spent/limit calculation, status thresholds (on track / near limit / over), the pace projection
/// text, and which budgets a user can create (one per spending category, positive monthly limit).
///
/// A `periodId` is a [BudgetPeriod.id]; an empty one means the current month.
abstract class BudgetService {
  Future<List<BudgetPeriod>> getPeriods();
  Future<BudgetOverview> getOverview(String periodId);
  Future<BudgetCategoryDetailData> getCategoryDetail({required String categoryId, required String periodId});

  // ── Managing budgets (they apply to every month) ──────────────────────────

  /// The signed-in user's budgets.
  Future<List<BudgetSetting>> budgets();

  /// Categories a budget can be set for: spending categories without one yet, plus
  /// [editingCategoryId] (the budget being edited) if given.
  Future<List<CategoryInfo>> availableCategories({String? editingCategoryId});

  /// Creates a budget. [limit] is the text the user typed (e.g. "400" or "$1,250.50").
  /// Throws FieldValidationException with 'category' / 'limit' messages.
  Future<void> createBudget({required String? categoryId, required String limit});

  /// Changes the budget for [categoryId]: its limit, and optionally its category ([newCategoryId]).
  /// Throws FieldValidationException with 'category' / 'limit' messages.
  Future<void> updateBudget({required String categoryId, String? newCategoryId, required String limit});

  Future<void> deleteBudget(String categoryId);

  /// Whether the signed-in user has a budget for [categoryId].
  Future<bool> hasBudget(String categoryId);

  /// Emits after every create / update / delete, so open budget screens can refresh.
  Stream<void> get changes;
}
