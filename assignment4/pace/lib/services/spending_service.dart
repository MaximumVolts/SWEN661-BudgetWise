import '../models/spending.dart' show SpendingData;

abstract class SpendingService {
  /// [rangeIndex] indexes the labels you return in SpendingData.rangeLabels (Month / 3 months / Year).
  Future<SpendingData> getSpending({required int rangeIndex});
}
