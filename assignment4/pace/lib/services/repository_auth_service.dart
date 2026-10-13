import 'dart:async' show StreamController;
import '../models/navigation.dart' show FlowStep;
import '../models/user_account.dart' show UserAccount;
import '../repositories/user_account_repository.dart' show UserAccountRepository;
import '../models/plaid_keys.dart' show PlaidKeys;
import '../repositories/plaid_key_repository.dart' show InMemoryPlaidKeyRepository, PlaidKeyRepository;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import 'auth_service.dart' show AuthService;
import '../repositories/google_account_repository.dart' show GoogleAccountRepository;
import 'password_hasher.dart' show PasswordHasher;
import 'validators.dart' show Validators;

/// [AuthService] backed by a [UserAccountRepository], a [PasswordHasher] and Google Sign-In.
/// BUSINESS RULES: credential validation, creating / matching Pace accounts (each with the user's
/// Plaid sandbox keys, kept via [PlaidKeyRepository]), password resets
/// via security question (with lockout), and where each way of signing in leads
/// (new account → onboarding, existing account → home).
///
/// Everything happens on the device: there is no backend, so Google ID tokens are not
/// verified server-side.
class RepositoryAuthService implements AuthService {
  /// Same message for an unknown username and a wrong password, so sign-in doesn't reveal which
  /// usernames have accounts.
  static const _badCredentials = 'Username or password is incorrect';

  static const _questions = [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What was the name of your first school?',
    'What is your oldest sibling’s middle name?',
    'What was the make of your first car?',
    'What street did you grow up on?',
  ];

  /// Wrong security answers allowed per account before resets are locked for [_lockout].
  static const _maxResetAttempts = 5;
  static const _lockout = Duration(minutes: 5);

  final UserAccountRepository _accounts;
  final GoogleAccountRepository _google;
  final PlaidKeyRepository _plaidKeys;
  final PasswordHasher _hasher;
  final DateTime Function() _now;
  final _changes = StreamController<bool>.broadcast();
  /// Per-username (lower-cased) wrong-answer count and lock expiry, for this app session.
  final _resetFailures = <String, ({int count, DateTime? lockedUntil})>{};
  UserAccount? _current;

  RepositoryAuthService({
    required UserAccountRepository accounts,
    required GoogleAccountRepository google,
    PlaidKeyRepository? plaidKeys,
    PasswordHasher hasher = const PasswordHasher(),
    DateTime Function()? now,
  })  : _accounts = accounts,
        _google = google,
        _plaidKeys = plaidKeys ?? InMemoryPlaidKeyRepository(),
        _hasher = hasher,
        _now = now ?? DateTime.now;

  /// Answers match ignoring case and repeated / surrounding whitespace ("New  York " = "new york").
  static String _normaliseAnswer(String answer) => answer.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');

  @override
  List<String> get securityQuestions => _questions;

  /// The signed-in Pace account, or null when signed out.
  UserAccount? get currentAccount => _current;

  @override
  bool get isSignedIn => _current != null;
  @override
  Stream<bool> get signedInChanges => _changes.stream;

  void _setCurrent(UserAccount? account) {
    _current = account;
    _changes.add(account != null);
  }

  @override
  Future<FlowStep> signIn({required String username, required String password}) async {
    final errors = <String, String>{
      if (Validators.requiredText(username, 'Enter your username') case final e?) 'username': e,
      if (password.isEmpty) 'password': 'Enter your password',
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    final account = await _accounts.fetchByUsername(username);
    final hash = account?.passwordHash;
    // Accounts created with Google have no password; they fail here like an unknown username.
    if (account == null || hash == null || !await _hasher.verify(password, hash)) {
      throw const FieldValidationException({'password': _badCredentials}, _badCredentials);
    }
    _setCurrent(account);
    return FlowStep.home;
  }

  @override
  Future<FlowStep> createAccount({
    required String name,
    required String username,
    required String password,
    required String confirmPassword,
    required String securityQuestion,
    required String securityAnswer,
    required String plaidClientId,
    required String plaidSecret,
  }) async {
    final errors = <String, String>{
      if (Validators.requiredText(name, 'Enter your name') case final e?) 'name': e,
      if (Validators.newUsername(username) case final e?) 'username': e,
      if (Validators.newPassword(password) case final e?) 'password': e,
      if (Validators.passwordsMatch(password, confirmPassword) case final e?) 'confirmPassword': e,
      if (!_questions.contains(securityQuestion)) 'securityQuestion': 'Choose a security question',
      if (Validators.securityAnswer(securityAnswer) case final e?) 'securityAnswer': e,
      if (Validators.plaidClientId(plaidClientId) case final e?) 'plaidClientId': e,
      if (Validators.plaidSandboxSecret(plaidSecret) case final e?) 'plaidSecret': e,
    };
    if (!errors.containsKey('username') && await _accounts.fetchByUsername(username) != null) {
      errors['username'] = 'An account with this username already exists';
    }
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    final account = await _accounts.create(
      username: username.trim(),
      displayName: name.trim(),
      passwordHash: await _hasher.hash(password),
      securityQuestion: securityQuestion,
      securityAnswerHash: await _hasher.hash(_normaliseAnswer(securityAnswer)),
    );
    await _plaidKeys.save(account.id, PlaidKeys(clientId: plaidClientId.trim(), sandboxSecret: plaidSecret.trim()));
    _setCurrent(account);
    return FlowStep.onboarding;
  }

  @override
  Future<String> securityQuestionFor(String username) async =>
      (await _resettableAccount(username)).securityQuestion!;

  @override
  Future<FlowStep> resetPassword({
    required String username,
    required String securityAnswer,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final account = await _resettableAccount(username);
    final key = account.username!.toLowerCase();
    final lockedUntil = _resetFailures[key]?.lockedUntil;
    if (lockedUntil != null && _now().isBefore(lockedUntil)) {
      throw const AppException('Too many incorrect answers. Try again in a few minutes.');
    }

    final errors = <String, String>{
      if (securityAnswer.trim().isEmpty) 'securityAnswer': 'Enter your answer',
      if (Validators.newPassword(newPassword) case final e?) 'password': e,
      if (Validators.passwordsMatch(newPassword, confirmPassword) case final e?) 'confirmPassword': e,
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    if (!await _hasher.verify(_normaliseAnswer(securityAnswer), account.securityAnswerHash!)) {
      final failures = (_resetFailures[key]?.count ?? 0) + 1;
      if (failures >= _maxResetAttempts) {
        _resetFailures[key] = (count: 0, lockedUntil: _now().add(_lockout));
        throw const AppException('Too many incorrect answers. Try again in a few minutes.');
      }
      _resetFailures[key] = (count: failures, lockedUntil: null);
      throw const FieldValidationException({'securityAnswer': "That answer doesn't match"});
    }

    _resetFailures.remove(key);
    final updated = account.copyWith(passwordHash: await _hasher.hash(newPassword));
    await _accounts.save(updated);
    _setCurrent(updated);
    return FlowStep.home;
  }

  /// The account for [username] if its password can be reset here; otherwise a 'username' field error.
  Future<UserAccount> _resettableAccount(String username) async {
    if (Validators.requiredText(username, 'Enter your username') case final e?) throw FieldValidationException({'username': e});
    final account = await _accounts.fetchByUsername(username);
    if (account == null) {
      throw const FieldValidationException({'username': 'No account on this device uses that username'});
    }
    if (account.securityQuestion == null || account.securityAnswerHash == null) {
      throw FieldValidationException({
        'username': account.passwordHash == null
            ? 'This account signs in with Google, so it has no password to reset'
            : 'This account has no security question, so its password can’t be reset',
      });
    }
    return account;
  }

  @override
  Future<FlowStep?> signInWithGoogle() async {
    final google = await _google.signIn();
    if (google == null) return null; // user cancelled

    final linked = await _accounts.fetchByGoogleId(google.id);
    if (linked != null) {
      _setCurrent(linked);
      return FlowStep.home;
    }

    // An existing Pace account whose username is the (Google-verified) email gets Google linked to it.
    final byUsername = await _accounts.fetchByUsername(google.email);
    if (byUsername != null) {
      final updated = byUsername.copyWith(googleId: google.id, displayName: byUsername.displayName ?? google.displayName);
      await _accounts.save(updated);
      _setCurrent(updated);
      return FlowStep.home;
    }

    _setCurrent(await _accounts.create(username: google.email, displayName: google.displayName, googleId: google.id));
    return FlowStep.onboarding;
  }

  @override
  Future<FlowStep> signInWithApple() async => throw const AppException('Sign in with Apple is not implemented yet.');

  @override
  Future<void> signOut() async {
    await _google.signOut();
    _setCurrent(null);
  }

  @override
  Future<void> deleteAccount() async {
    final account = _current;
    if (account != null) await _accounts.delete(account.id);
    await signOut();
  }
}
