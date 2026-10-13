import '../models/user_account.dart' show UserAccount;

/// Data-access layer for Pace accounts: only reads and writes records, no business rules
/// (those live in AuthService). Implement this against your real storage (REST, Firebase,
/// SQLite…) and pass it to RepositoryAuthService; nothing above the service changes.
abstract class UserAccountRepository {
  /// null when no account with [id] exists.
  Future<UserAccount?> fetchById(String id);
  /// Case-insensitive. null when no account uses [username].
  Future<UserAccount?> fetchByUsername(String username);
  /// null when no account is linked to that Google user.
  Future<UserAccount?> fetchByGoogleId(String googleId);
  /// Stores a new account and returns it with its assigned id.
  Future<UserAccount> create({
    String? username,
    String? displayName,
    String? googleId,
    String? passwordHash,
    String? securityQuestion,
    String? securityAnswerHash,
  });
  /// Replaces the stored account with the same id.
  Future<void> save(UserAccount account);
  Future<void> delete(String id);
}

/// Session-only storage: accounts are lost when the app restarts.
class InMemoryUserAccountRepository implements UserAccountRepository {
  final List<UserAccount> _accounts;
  int _nextId = 1;
  InMemoryUserAccountRepository([List<UserAccount> seed = const []]) : _accounts = [...seed];

  Future<UserAccount?> _first(bool Function(UserAccount a) test) async {
    for (final a in _accounts) {
      if (test(a)) return a;
    }
    return null;
  }

  @override
  Future<UserAccount?> fetchById(String id) => _first((a) => a.id == id);

  @override
  Future<UserAccount?> fetchByUsername(String username) =>
      _first((a) => a.username?.toLowerCase() == username.trim().toLowerCase());

  @override
  Future<UserAccount?> fetchByGoogleId(String googleId) => _first((a) => a.googleId == googleId);

  @override
  Future<UserAccount> create({
    String? username,
    String? displayName,
    String? googleId,
    String? passwordHash,
    String? securityQuestion,
    String? securityAnswerHash,
  }) async {
    while (_accounts.any((a) => a.id == 'u$_nextId')) {
      _nextId++;
    }
    final account = UserAccount(
      id: 'u${_nextId++}',
      username: username?.trim(),
      displayName: displayName,
      googleId: googleId,
      passwordHash: passwordHash,
      securityQuestion: securityQuestion,
      securityAnswerHash: securityAnswerHash,
    );
    _accounts.add(account);
    return account;
  }

  @override
  Future<void> save(UserAccount account) async {
    final i = _accounts.indexWhere((a) => a.id == account.id);
    if (i >= 0) _accounts[i] = account;
  }

  @override
  Future<void> delete(String id) async => _accounts.removeWhere((a) => a.id == id);
}
