import '../models/user_account.dart' show UserAccount;
import 'sqlite_repository.dart' show SqliteRepository;
import 'user_account_repository.dart' show UserAccountRepository;

/// [UserAccountRepository] over the `users` table. Creating an account inserts a row there; the schema's trigger adds
/// the user's default `user_preferences` row, and deleting the user cascades.
class SqliteUserAccountRepository extends SqliteRepository implements UserAccountRepository {
  static const _columns = [
    'id',
    'username',
    'email',
    'display_name',
    'google_id',
    'password_hash',
    'security_question',
    'security_answer_hash',
  ];

  SqliteUserAccountRepository(super.database);

  Future<UserAccount?> _first(String where, List<Object?> args) async {
    final db = await this.db;
    final rows = await db.query('users', columns: _columns, where: where, whereArgs: args, limit: 1);
    return rows.isEmpty ? null : _fromRow(rows.first);
  }

  @override
  Future<UserAccount?> fetchById(String id) async {
    final row = rowId(id);
    return row == null ? null : _first('id = ?', [row]);
  }

  /// Both columns are `COLLATE NOCASE`, so this match ignores case. An account from before
  /// usernames (username NULL) matches on its old email.
  @override
  Future<UserAccount?> fetchByUsername(String username) =>
      _first('username = ? OR (username IS NULL AND email = ?)', [username.trim(), username.trim()]);

  @override
  Future<UserAccount?> fetchByGoogleId(String googleId) => _first('google_id = ?', [googleId]);

  @override
  Future<UserAccount> create({
    String? username,
    String? displayName,
    String? googleId,
    String? passwordHash,
    String? securityQuestion,
    String? securityAnswerHash,
  }) async {
    final db = await this.db;
    final id = await db.insert('users', {
      'username': username?.trim(),
      'display_name': displayName,
      'google_id': googleId,
      'password_hash': passwordHash,
      'security_question': securityQuestion,
      'security_answer_hash': securityAnswerHash,
    });
    return UserAccount(
      id: '$id',
      username: username?.trim(),
      displayName: displayName,
      googleId: googleId,
      passwordHash: passwordHash,
      securityQuestion: securityQuestion,
      securityAnswerHash: securityAnswerHash,
    );
  }

  @override
  Future<void> save(UserAccount account) async {
    final row = rowId(account.id);
    if (row == null) return;
    final db = await this.db;
    await db.update(
      'users',
      {
        'username': account.username,
        'display_name': account.displayName,
        'google_id': account.googleId,
        'password_hash': account.passwordHash,
        'security_question': account.securityQuestion,
        'security_answer_hash': account.securityAnswerHash,
      },
      where: 'id = ?',
      whereArgs: [row],
    );
  }

  @override
  Future<void> delete(String id) async {
    final row = rowId(id);
    if (row == null) return;
    final db = await this.db;
    await db.delete('users', where: 'id = ?', whereArgs: [row]);
  }

  static UserAccount _fromRow(Map<String, Object?> r) => UserAccount(
        id: '${r['id']}',
        // Accounts from before usernames sign in with their old email until next saved.
        username: (r['username'] ?? r['email']) as String?,
        displayName: r['display_name'] as String?,
        googleId: r['google_id'] as String?,
        passwordHash: r['password_hash'] as String?,
        securityQuestion: r['security_question'] as String?,
        securityAnswerHash: r['security_answer_hash'] as String?,
      );
}
