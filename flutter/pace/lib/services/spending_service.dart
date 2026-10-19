import '../models/spending.dart' show SpendingCategoryDetailData, SpendingData;

abstract class SpendingService {
  /// [rangeIndex] indexes the labels you return in SpendingData.rangeLabels (Month / 3 months / Year).
  Future<SpendingData> getSpending({required int rangeIndex});

  /// One category over the same period as [getSpending] with [rangeIndex]: its total, change,
  /// share of all spending, bars and transactions.
  Future<SpendingCategoryDetailData> getCategoryDetail({required String categoryId, required int rangeIndex});
}
