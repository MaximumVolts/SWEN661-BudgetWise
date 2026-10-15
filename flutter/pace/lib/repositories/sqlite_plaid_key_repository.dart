import '../models/plaid_keys.dart' show PlaidKeys;
import 'plaid_key_repository.dart' show PlaidKeyRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [PlaidKeyRepository] over the `plaid_sandbox_keys` table (one row per user).
///
/// Writes update the row if it exists, else insert it (no `ON CONFLICT DO UPDATE`: see
/// SqliteBudgetRepository).
class SqlitePlaidKeyRepository extends SqliteRepository implements PlaidKeyRepository {
  static const _now = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";

  SqlitePlaidKeyRepository(super.database);

  @override
  Future<PlaidKeys?> load(String userId) => forUser(userId, orElse: null, action: (db, user) async {
        final rows = await db.query('plaid_sandbox_keys',
            columns: ['client_id', 'sandbox_secret'], where: 'user_id = ?', whereArgs: [user]);
        if (rows.isEmpty) return null;
        return PlaidKeys(clientId: rows.single['client_id']! as String, sandboxSecret: rows.single['sandbox_secret']! as String);
      });

  @override
  Future<void> save(String userId, PlaidKeys keys) => forUser(userId,
      orElse: null,
      action: (db, user) => db.transaction((txn) async {
            final updated = await txn.rawUpdate(
              'UPDATE plaid_sandbox_keys SET client_id = ?, sandbox_secret = ?, updated_at = $_now WHERE user_id = ?',
              [keys.clientId, keys.sandboxSecret, user],
            );
            if (updated == 0) {
              await txn.insert(
                  'plaid_sandbox_keys', {'user_id': user, 'client_id': keys.clientId, 'sandbox_secret': keys.sandboxSecret});
            }
          }));
}
