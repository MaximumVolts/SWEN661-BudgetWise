/// Data-access layer for budgets: a user's monthly limit per category id. The limit applies to every
/// month. No business rules (validation lives in BudgetService).
abstract class BudgetRepository {
  /// categoryId → monthly limit, for [userId], in creation order.
  Future<Map<String, double>> limitsFor(String userId);

  /// Inserts or replaces the budget for ([userId], [categoryId]).
  Future<void> save(String userId, String categoryId, double monthlyLimit);

  /// Moves [userId]'s budget from [fromCategoryId] to [toCategoryId] with a new limit.
  Future<void> replace(String userId, String fromCategoryId, String toCategoryId, double monthlyLimit);

  Future<void> delete(String userId, String categoryId);
}

/// Session-only storage, used by tests and when accounts aren't stored on device.
class InMemoryBudgetRepository implements BudgetRepository {
  final _limits = <String, Map<String, double>>{};

  @override
  Future<Map<String, double>> limitsFor(String userId) async => Map.unmodifiable(_limits[userId] ?? const {});

  @override
  Future<void> save(String userId, String categoryId, double monthlyLimit) async =>
      (_limits[userId] ??= {})[categoryId] = monthlyLimit;

  @override
  Future<void> replace(String userId, String fromCategoryId, String toCategoryId, double monthlyLimit) async {
    final mine = _limits[userId] ??= {};
    mine.remove(fromCategoryId);
    mine[toCategoryId] = monthlyLimit;
  }

  @override
  Future<void> delete(String userId, String categoryId) async => _limits[userId]?.remove(categoryId);
}
