import '../models/cash_flow.dart' show ExpectedIncome;

/// Data-access layer for one-off income a user expects. No business rules.
abstract class ExpectedIncomeRepository {
  /// [userId]'s expected income, soonest first.
  Future<List<ExpectedIncome>> listFor(String userId);

  /// Stores [income] (its id is ignored) and returns the new id.
  Future<String> add(String userId, ExpectedIncome income);

  Future<void> delete(String userId, String id);
}

/// Session-only storage, used by tests and when accounts aren't stored on device.
class InMemoryExpectedIncomeRepository implements ExpectedIncomeRepository {
  final _byUser = <String, List<ExpectedIncome>>{};
  var _nextId = 1;

  @override
  Future<List<ExpectedIncome>> listFor(String userId) async =>
      [...?_byUser[userId]]..sort((a, b) => a.date.compareTo(b.date));

  @override
  Future<String> add(String userId, ExpectedIncome income) async {
    final id = '${_nextId++}';
    (_byUser[userId] ??= []).add(ExpectedIncome(id: id, name: income.name, amount: income.amount, date: income.date));
    return id;
  }

  @override
  Future<void> delete(String userId, String id) async => _byUser[userId]?.removeWhere((i) => i.id == id);
}
