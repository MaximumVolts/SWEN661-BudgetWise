import 'dart:async' show StreamController;
import '../models/profile.dart' show ProfileData;
import '../models/user_account.dart' show UserAccount;
import '../repositories/user_account_repository.dart' show UserAccountRepository;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import 'profile_service.dart' show ProfileService;
import 'validators.dart' show Validators;

/// [ProfileService] over the same [UserAccountRepository] that stores accounts (the users table).
class RepositoryProfileService implements ProfileService {
  final UserAccountRepository _accounts;
  final String? Function() _currentUserId;
  final _changes = StreamController<void>.broadcast();

  RepositoryProfileService({required UserAccountRepository accounts, required String? Function() currentUserId})
      : _accounts = accounts,
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
  Future<ProfileData> load() async => _toProfile(await _current());

  @override
  Future<ProfileData> update({required String name}) async {
    final account = await _current();
    if (Validators.requiredText(name, 'Enter your name') case final e?) {
      throw FieldValidationException({'name': e});
    }
    // Only the name changes; the email stays the account's sign-in identity.
    final updated = account.copyWith(displayName: name.trim());
    await _accounts.save(updated);
    _changes.add(null);
    return _toProfile(updated);
  }

  static ProfileData _toProfile(UserAccount a) => ProfileData(
        name: a.displayName ?? '',
        email: a.email ?? '',
        initials: initialsFor(a.displayName, a.email),
        signInMethod: [
          if (a.passwordHash != null) 'Email & password',
          if (a.googleId != null) 'Google',
        ].join(' · '),
      );

  /// First letters of the first and last words of [name]; else the email's first letter; else "?".
  static String initialsFor(String? name, String? email) {
    final words = (name ?? '').trim().split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
    if (words.isNotEmpty) {
      final first = words.first[0];
      final last = words.length > 1 ? words.last[0] : '';
      return '$first$last'.toUpperCase();
    }
    final e = (email ?? '').trim();
    return e.isEmpty ? '?' : e[0].toUpperCase();
  }
}
