import '../models/budget.dart' show BudgetCategoryDetailData, BudgetOverview, BudgetPeriod;

/// BUSINESS RULES: which period is current (`BudgetPeriod.isCurrent`), spent/limit calculation,
/// status thresholds (on track / near limit / over), and the pace projection text.
abstract class BudgetService {
  Future<List<BudgetPeriod>> getPeriods();
  Future<BudgetOverview> getOverview(String periodId);
  Future<BudgetCategoryDetailData> getCategoryDetail({required String categoryId, required String periodId});
}
