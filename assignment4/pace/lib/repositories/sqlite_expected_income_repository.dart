import '../models/cash_flow.dart' show ExpectedIncome;
import 'expected_income_repository.dart' show ExpectedIncomeRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [ExpectedIncomeRepository] over the `expected_incomes` table (amounts in integer cents, dates
/// as 'YYYY-MM-DD').
class SqliteExpectedIncomeRepository extends SqliteRepository implements ExpectedIncomeRepository {
  SqliteExpectedIncomeRepository(super.database);

  static String _date(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  Future<List<ExpectedIncome>> listFor(String userId) => forUser(userId, orElse: const [], action: (db, user) async {
        final rows = await db.query('expected_incomes', where: 'user_id = ?', whereArgs: [user], orderBy: 'expected_on, id');
        return [
          for (final r in rows)
            ExpectedIncome(
              id: '${r['id']}',
              name: r['name']! as String,
              amount: (r['amount_cents']! as int) / 100,
              date: DateTime.parse(r['expected_on']! as String),
            ),
        ];
      });

  @override
  Future<String> add(String userId, ExpectedIncome income) => forUser(userId,
      orElse: '',
      action: (db, user) async => '${await db.insert('expected_incomes', {
            'user_id': user,
            'name': income.name,
            'amount_cents': (income.amount * 100).round(),
            'expected_on': _date(income.date),
          })}');

  @override
  Future<void> delete(String userId, String id) => forUser(userId,
      orElse: null,
      action: (db, user) => db.delete('expected_incomes', where: 'id = ? AND user_id = ?', whereArgs: [rowId(id), user]));
}
