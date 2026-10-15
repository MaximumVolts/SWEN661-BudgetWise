import 'package:sqflite/sqflite.dart' show DatabaseExecutor;
import 'budget_repository.dart' show BudgetRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [BudgetRepository] over the `budgets` table. One row per user and category; limits are stored
/// as integer cents.
///
/// Writes avoid `INSERT … ON CONFLICT DO UPDATE` (SQLite 3.24+): on Android sqflite uses the
/// phone's own SQLite, which is 3.9 on the oldest supported version (Android 7).
class SqliteBudgetRepository extends SqliteRepository implements BudgetRepository {
  static const _now = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

  SqliteBudgetRepository(super.database);

  static int _cents(double amount) => (amount * 100).round();

  @override
  Future<Map<String, double>> limitsFor(String userId) => forUser(userId, orElse: const {}, action: (db, user) async {
        final rows = await db.query('budgets',
            columns: ['category_id', 'monthly_limit_cents'], where: 'user_id = ?', whereArgs: [user], orderBy: 'id');
        return {for (final r in rows) r['category_id']! as String: (r['monthly_limit_cents']! as int) / 100};
      });

  /// Update the (user, category) row if it exists, else insert it.
  static Future<void> _upsert(DatabaseExecutor db, int user, String categoryId, int cents) async {
    final updated = await db.rawUpdate(
      'UPDATE budgets SET monthly_limit_cents = ?, updated_at = $_now WHERE user_id = ? AND category_id = ?',
      [cents, user, categoryId],
    );
    if (updated == 0) {
      await db.insert('budgets', {'user_id': user, 'category_id': categoryId, 'monthly_limit_cents': cents});
    }
  }

  @override
  Future<void> save(String userId, String categoryId, double monthlyLimit) => forUser(userId,
      orElse: null, action: (db, user) => db.transaction((txn) => _upsert(txn, user, categoryId, _cents(monthlyLimit))));

  @override
  Future<void> replace(String userId, String fromCategoryId, String toCategoryId, double monthlyLimit) =>
      forUser(userId, orElse: null, action: (db, user) => db.transaction((txn) async {
            if (fromCategoryId != toCategoryId) {
              await txn.delete('budgets', where: 'user_id = ? AND category_id = ?', whereArgs: [user, fromCategoryId]);
            }
            await _upsert(txn, user, toCategoryId, _cents(monthlyLimit));
          }));

  @override
  Future<void> delete(String userId, String categoryId) => forUser(userId,
      orElse: null,
      action: (db, user) => db.delete('budgets', where: 'user_id = ? AND category_id = ?', whereArgs: [user, categoryId]));
}
