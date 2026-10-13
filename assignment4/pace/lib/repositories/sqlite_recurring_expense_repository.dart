import '../models/recurring.dart' show RecurringExpense, RecurringFrequency, RecurringKind;
import 'recurring_expense_repository.dart' show RecurringExpenseRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [RecurringExpenseRepository] over the `recurring_expenses` table (amounts in integer cents,
/// dates as 'YYYY-MM-DD').
class SqliteRecurringExpenseRepository extends SqliteRepository implements RecurringExpenseRepository {
  static const _now = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

  SqliteRecurringExpenseRepository(super.database);

  @override
  Future<List<RecurringExpense>> listFor(String userId) => forUser(userId, orElse: const [], action: (db, user) async {
        final rows = await db.query('recurring_expenses', where: 'user_id = ?', whereArgs: [user], orderBy: 'id');
        return [
          for (final r in rows)
            RecurringExpense(
              id: '${r['id']}',
              name: r['name']! as String,
              amount: (r['amount_cents']! as int) / 100,
              frequency: RecurringFrequency.fromCode(r['frequency']! as String),
              firstDue: DateTime.parse(r['first_due']! as String),
              categoryId: r['category_id']! as String,
              kind: RecurringKind.values.byName(r['kind']! as String),
            ),
        ];
      });

  @override
  Future<RecurringExpense> save(String userId, RecurringExpense e) => forUser(userId, orElse: e, action: (db, user) async {
        final values = {
          'name': e.name,
          'amount_cents': (e.amount * 100).round(),
          'frequency': e.frequency.code,
          'first_due': _date(e.firstDue),
          'category_id': e.categoryId,
          'kind': e.kind.name,
        };
        final row = rowId(e.id);
        if (row == null) {
          final id = await db.insert('recurring_expenses', {'user_id': user, ...values});
          return e.withId('$id');
        }
        await db.rawUpdate(
          'UPDATE recurring_expenses SET name = ?, amount_cents = ?, frequency = ?, first_due = ?, category_id = ?, '
          'kind = ?, updated_at = $_now WHERE id = ? AND user_id = ?',
          [...values.values, row, user],
        );
        return e;
      });

  @override
  Future<void> delete(String userId, String id) => forUser(userId,
      orElse: null,
      action: (db, user) => db.delete('recurring_expenses', where: 'id = ? AND user_id = ?', whereArgs: [rowId(id), user]));

  static String _date(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}
