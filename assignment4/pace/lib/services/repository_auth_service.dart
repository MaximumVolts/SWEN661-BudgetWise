import 'dart:async' show StreamController;
import '../models/navigation.dart' show FlowStep;
import '../models/user_account.dart' show UserAccount;
import '../repositories/user_account_repository.dart' show UserAccountRepository;
import '../models/app_exception.dart' show AppException, FieldValidationException;
import 'auth_service.dart' show AuthService;
import '../repositories/google_account_repository.dart' show GoogleAccountRepository;
import 'password_hasher.dart' show PasswordHasher;
import 'validators.dart' show Validators;

/// [AuthService] backed by a [UserAccountRepository], a [PasswordHasher] and Google Sign-In.
/// BUSINESS RULES: credential validation, creating / matching Pace accounts, password resets
/// via security question (with lockout), and where each way of signing in leads
/// (new account → onboarding, existing account → home).
///
/// Everything happens on the device: there is no backend, so Google ID tokens are not
/// verified server-side.
class RepositoryAuthService implements AuthService {
  /// Same message for an unknown email and a wrong password, so sign-in doesn't reveal which
  /// emails have accounts.
  static const _badCredentials = 'Email or password is incorrect';

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
  final PasswordHasher _hasher;
  final DateTime Function() _now;
  final _changes = StreamController<bool>.broadcast();
  /// Per-email (lower-cased) wrong-answer count and lock expiry, for this app session.
  final _resetFailures = <String, ({int count, DateTime? lockedUntil})>{};
  UserAccount? _current;

  RepositoryAuthService({
    required UserAccountRepository accounts,
    required GoogleAccountRepository google,
    PasswordHasher hasher = const PasswordHasher(),
    DateTime Function()? now,
  })  : _accounts = accounts,
        _google = google,
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
  Future<FlowStep> signIn({required String email, required String password}) async {
    final errors = <String, String>{
      if (Validators.email(email) != null) 'email': Validators.email(email)!,
      if (password.isEmpty) 'password': 'Enter your password',
    };
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    final account = await _accounts.fetchByEmail(email);
    final hash = account?.passwordHash;
    // Accounts created with Google have no password; they fail here like an unknown email.
    if (account == null || hash == null || !await _hasher.verify(password, hash)) {
      throw const FieldValidationException({'password': _badCredentials}, _badCredentials);
    }
    _setCurrent(account);
    return FlowStep.home;
  }

  @override
  Future<FlowStep> createAccount({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    required String securityQuestion,
    required String securityAnswer,
  }) async {
    final errors = <String, String>{
      if (Validators.requiredText(name, 'Enter your name') case final e?) 'name': e,
      if (Validators.email(email) case final e?) 'email': e,
      if (Validators.newPassword(password) case final e?) 'password': e,
      if (Validators.passwordsMatch(password, confirmPassword) case final e?) 'confirmPassword': e,
      if (!_questions.contains(securityQuestion)) 'securityQuestion': 'Choose a security question',
      if (Validators.securityAnswer(securityAnswer) case final e?) 'securityAnswer': e,
    };
    if (!errors.containsKey('email') && await _accounts.fetchByEmail(email) != null) {
      errors['email'] = 'An account with this email already exists';
    }
    if (errors.isNotEmpty) throw FieldValidationException(errors);

    _setCurrent(await _accounts.create(
      email: email.trim(),
      displayName: name.trim(),
      passwordHash: await _hasher.hash(password),
      securityQuestion: securityQuestion,
      securityAnswerHash: await _hasher.hash(_normaliseAnswer(securityAnswer)),
    ));
    return FlowStep.onboarding;
  }

  @override
  Future<String> securityQuestionFor(String email) async =>
      (await _resettableAccount(email)).securityQuestion!;

  @override
  Future<FlowStep> resetPassword({
    required String email,
    required String securityAnswer,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final account = await _resettableAccount(email);
    final key = account.email!.toLowerCase();
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

  /// The account for [email] if its password can be reset here; otherwise an 'email' field error.
  Future<UserAccount> _resettableAccount(String email) async {
    if (Validators.email(email) case final e?) throw FieldValidationException({'email': e});
    final account = await _accounts.fetchByEmail(email);
    if (account == null) {
      throw const FieldValidationException({'email': 'No account on this device uses that email'});
    }
    if (account.securityQuestion == null || account.securityAnswerHash == null) {
      throw FieldValidationException({
        'email': account.passwordHash == null
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

    // An existing Pace account with the same (Google-verified) email gets Google linked to it.
    final byEmail = await _accounts.fetchByEmail(google.email);
    if (byEmail != null) {
      final updated = byEmail.copyWith(googleId: google.id, displayName: byEmail.displayName ?? google.displayName);
      await _accounts.save(updated);
      _setCurrent(updated);
      return FlowStep.home;
    }

    _setCurrent(await _accounts.create(email: google.email, displayName: google.displayName, googleId: google.id));
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
