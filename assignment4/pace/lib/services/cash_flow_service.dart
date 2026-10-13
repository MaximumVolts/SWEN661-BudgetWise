import '../models/cash_flow.dart' show CashFlowData;

abstract class CashFlowService {
  /// Range (30/60/90 days) and income scenario (Low/Expected/High) are passed as indices
  /// into the label lists you return in CashFlowData.
  Future<CashFlowData> getProjection({required int rangeIndex, required int scenarioIndex});
}
