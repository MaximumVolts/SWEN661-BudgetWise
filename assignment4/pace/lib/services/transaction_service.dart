import '../models/transaction.dart'
    show CategoryInfo, FilterChoice, FilterKind, TransactionDetailBundle, TransactionGroup, TransactionQuery;

/// BUSINESS RULES: filtering/grouping by day, daily totals, categorisation rules
/// (e.g. re-categorising a merchant), pending vs posted status labels.
abstract class TransactionService {
  Future<List<TransactionGroup>> getGroups(TransactionQuery query);
  Future<List<FilterChoice>> getFilterChoices(FilterKind kind);
  Future<TransactionDetailBundle> getDetail(String transactionId);
  Future<List<CategoryInfo>> getCategories();
  Future<void> setCategory({required String transactionId, required String categoryId});
  Future<void> setNote({required String transactionId, required String note});
}
