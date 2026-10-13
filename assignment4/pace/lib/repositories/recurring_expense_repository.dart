import '../models/recurring.dart' show RecurringExpense;

/// Data-access layer for the recurring expenses a user adds by hand. No business rules.
abstract class RecurringExpenseRepository {
  /// [userId]'s expenses, oldest first.
  Future<List<RecurringExpense>> listFor(String userId);

  /// Inserts [expense] (empty id) or updates it; returns it with its id.
  Future<RecurringExpense> save(String userId, RecurringExpense expense);

  Future<void> delete(String userId, String id);
}

/// Session-only storage, used by tests and when accounts aren't stored on device.
class InMemoryRecurringExpenseRepository implements RecurringExpenseRepository {
  final _byUser = <String, Map<String, RecurringExpense>>{};
  var _nextId = 1;

  @override
  Future<List<RecurringExpense>> listFor(String userId) async => List.unmodifiable((_byUser[userId] ?? const {}).values);

  @override
  Future<RecurringExpense> save(String userId, RecurringExpense expense) async {
    final saved = expense.id.isEmpty ? expense.withId('${_nextId++}') : expense;
    (_byUser[userId] ??= {})[saved.id] = saved;
    return saved;
  }

  @override
  Future<void> delete(String userId, String id) async => _byUser[userId]?.remove(id);
}
