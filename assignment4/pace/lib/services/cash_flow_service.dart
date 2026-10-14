import '../models/cash_flow.dart' show CashFlowData;

abstract class CashFlowService {
  /// Range (30/60/90 days) and income scenario (Low/Expected/High) are passed as indices
  /// into the label lists you return in CashFlowData.
  Future<CashFlowData> getProjection({required int rangeIndex, required int scenarioIndex});

  /// Adds one-off income the user expects: [amount] as typed ("250", "$1,200.50"). Throws
  /// FieldValidationException ('name', 'amount', 'date').
  Future<void> addExpectedIncome({required String name, required String amount, required DateTime? date});

  /// Removes income the user added (a BreakdownLine.expectedIncomeId).
  Future<void> removeExpectedIncome(String id);

  /// Emits after expected income is added or removed, so the projection can reload.
  Stream<void> get changes;
}
