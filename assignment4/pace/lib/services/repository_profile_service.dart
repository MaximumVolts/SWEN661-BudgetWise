import 'dart:async' show StreamController;
import '../models/plaid_keys.dart' show PlaidKeys;
import '../models/profile.dart' show ProfileData;
import '../models/user_account.dart' show UserAccount;
import '../repositories/plaid_key_repository.dart' show InMemoryPlaidKeyRepository, PlaidKeyRepository;
import '../repositories/user_account_repository.dart' show UserAccountRepository;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import 'profile_service.dart' show ProfileService;
import 'validators.dart' show Validators;

/// [ProfileService] over the same [UserAccountRepository] that stores accounts (the users table),
/// plus the user's Plaid sandbox keys ([PlaidKeyRepository]).
class RepositoryProfileService implements ProfileService {
  final UserAccountRepository _accounts;
  final PlaidKeyRepository _plaidKeys;
  final String? Function() _currentUserId;
  final _changes = StreamController<void>.broadcast();

  RepositoryProfileService(
      {required UserAccountRepository accounts, PlaidKeyRepository? plaidKeys, required String? Function() currentUserId})
      : _accounts = accounts,
        _plaidKeys = plaidKeys ?? InMemoryPlaidKeyRepository(),
        _currentUserId = currentUserId;

  @override
  Stream<void> get changes => _changes.stream;

  Future<UserAccount> _current() async {
    final id = _currentUserId();
    final account = id == null ? null : await _accounts.fetchById(id);
    if (account == null) throw const AppException('Sign in to see your profile.');
    return account;
  }

  @override
  Future<ProfileData> load() async {
    final account = await _current();
    return _toProfile(account, await _plaidKeys.load(account.id));
  }

  @override
  Future<ProfileData> update({required String name, required String plaidClientId, required String plaidSecret}) async {
    final account = await _current();
    final stored = await _plaidKeys.load(account.id);
    // A blank secret keeps the stored one, so it never has to be shown or retyped.
    final keepSecret = plaidSecret.trim().isEmpty && (stored?.sandboxSecret.isNotEmpty ?? false);
    // Keys are checked once there are some: saved ones, or ones being entered. Someone without
    // keys can still rename themselves (they're asked for keys when they connect a bank).
    final hasKeys = stored != null || plaidClientId.trim().isNotEmpty || plaidSecret.trim().isNotEmpty;
    final errors = <String, String>{
      if (Validators.requiredText(name, 'Enter your name') case final e?) 'name': e,
      if (hasKeys)
        if (Validators.plaidClientId(plaidClientId) case final e?) 'plaidClientId': e,
      if (hasKeys && !keepSecret)
        if (Validators.plaidSandboxSecret(plaidSecret) case final e?) 'plaidSecret': e,
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    // The username stays the account's sign-in identity.
    final updated = account.copyWith(displayName: name.trim());
    await _accounts.save(updated);
    PlaidKeys? keys = stored;
    if (hasKeys) {
      keys = PlaidKeys(clientId: plaidClientId.trim(), sandboxSecret: keepSecret ? stored!.sandboxSecret : plaidSecret.trim());
      await _plaidKeys.save(account.id, keys);
    }
    _changes.add(null);
    return _toProfile(updated, keys);
  }

  static ProfileData _toProfile(UserAccount a, PlaidKeys? keys) => ProfileData(
        name: a.displayName ?? '',
        username: a.username ?? '',
        initials: initialsFor(a.displayName, a.username),
        signInMethod: [
          if (a.passwordHash != null) 'Username & password',
          if (a.googleId != null) 'Google',
        ].join(' · '),
        plaidClientId: keys?.clientId ?? '',
        hasPlaidSecret: keys?.sandboxSecret.isNotEmpty ?? false,
      );

  /// First letters of the first and last words of [name]; else the username's first letter; else "?".
  static String initialsFor(String? name, String? username) {
    final words = (name ?? '').trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isNotEmpty) {
      final first = words.first[0];
      final last = words.length > 1 ? words.last[0] : '';
      return '$first$last'.toUpperCase();
    }
    final e = (username ?? '').trim();
    return e.isEmpty ? '?' : e[0].toUpperCase();
  }
}
