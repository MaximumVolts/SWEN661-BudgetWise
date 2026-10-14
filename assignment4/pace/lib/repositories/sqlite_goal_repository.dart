import 'package:sqflite/sqflite.dart' show DatabaseExecutor;
import '../models/goal.dart' show GoalContribution, SavingsGoal;
import 'goal_repository.dart' show GoalRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [GoalRepository] for the signed-in user, over the `savings_goals` and `goal_contributions`
/// tables (amounts in integer cents, dates as 'YYYY-MM-DD'). A goal with an empty or non-numeric
/// id is new: saving it inserts a row.
class SqliteGoalRepository extends SqliteRepository implements GoalRepository {
  static const _now = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

  final String? Function() _currentUserId;
  SqliteGoalRepository(super.database, {required String? Function() currentUserId}) : _currentUserId = currentUserId;

  /// Runs [action] for the signed-in user; [orElse] when nobody is.
  Future<T> _forMe<T>({required T orElse, required Future<T> Function(DatabaseExecutor db, int user) action}) =>
      forUser(_currentUserId() ?? '', orElse: orElse, action: action);

  static int? _cents(double? amount) => amount == null ? null : (amount * 100).round();
  static double? _amount(Object? cents) => cents == null ? null : (cents as int) / 100;
  static String _date(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  static Future<SavingsGoal> _goal(DatabaseExecutor db, Map<String, Object?> r) async {
    final contributions = await db.query('goal_contributions',
        columns: ['date_label', 'amount_cents'], where: 'goal_id = ?', whereArgs: [r['id']], orderBy: 'id DESC');
    return SavingsGoal(
      id: '${r['id']}',
      name: r['name'] as String?,
      iconKey: r['icon_key']! as String,
      saved: _amount(r['saved_cents']),
      target: _amount(r['target_cents']),
      targetDate: r['target_date'] == null ? null : DateTime.parse(r['target_date']! as String),
      contributions: [
        for (final c in contributions) GoalContribution(dateLabel: c['date_label']! as String, amount: _amount(c['amount_cents'])!),
      ],
    );
  }

  @override
  Future<List<SavingsGoal>> fetchGoals() => _forMe(orElse: const [], action: (db, user) async {
        final rows = await db.query('savings_goals', where: 'user_id = ?', whereArgs: [user], orderBy: 'id');
        return [for (final r in rows) await _goal(db, r)];
      });

  @override
  Future<SavingsGoal?> fetchGoal(String id) => _forMe(orElse: null, action: (db, user) async {
        final rows = await db.query('savings_goals', where: 'id = ? AND user_id = ?', whereArgs: [rowId(id), user]);
        return rows.isEmpty ? null : _goal(db, rows.single);
      });

  @override
  Future<void> saveGoal(SavingsGoal goal) async {
    final database = await db;
    final user = rowId(_currentUserId() ?? '');
    if (user == null) return;
    await database.transaction((txn) async {
      final values = {
        'name': goal.name,
        'icon_key': goal.iconKey,
        'saved_cents': _cents(goal.saved),
        'target_cents': _cents(goal.target),
        'target_date': goal.targetDate == null ? null : _date(goal.targetDate!),
      };
      var id = rowId(goal.id);
      final updated = id == null
          ? 0
          : await txn.rawUpdate(
              'UPDATE savings_goals SET ${values.keys.map((k) => '$k = ?').join(', ')}, updated_at = $_now '
              'WHERE id = ? AND user_id = ?',
              [...values.values, id, user]);
      if (updated == 0) id = await txn.insert('savings_goals', {'user_id': user, ...values});
      // Contributions are stored oldest first, so their ids grow with time; goals list them newest first.
      await txn.delete('goal_contributions', where: 'goal_id = ?', whereArgs: [id]);
      for (final c in goal.contributions.reversed) {
        await txn.insert('goal_contributions', {'goal_id': id, 'date_label': c.dateLabel, 'amount_cents': _cents(c.amount)});
      }
    });
  }

  @override
  Future<void> deleteGoal(String id) => _forMe(
      orElse: null,
      action: (db, user) => db.delete('savings_goals', where: 'id = ? AND user_id = ?', whereArgs: [rowId(id), user]));
}
