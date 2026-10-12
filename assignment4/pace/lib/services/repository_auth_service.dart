import 'dart:async' show StreamController;
import '../models/navigation.dart' show FlowStep;
import '../models/user_account.dart' show UserAccount;
import '../repositories/user_account_repository.dart' show UserAccountRepository;
import 'app_exception.dart' show AppException, FieldValidationException;
import 'auth_service.dart' show AuthService;
import 'google_account_service.dart' show GoogleAccountService;
import 'validators.dart' show Validators;

/// [AuthService] backed by a [UserAccountRepository] and Google Sign-In.
/// BUSINESS RULES: credential validation, creating / matching Pace accounts, and where each
/// way of signing in leads (new account → onboarding, existing account → home).
///
/// Prototype limits: there is no password store or backend, so email sign-in accepts any
/// valid email + non-empty password, and Google ID tokens are not verified server-side.
class RepositoryAuthService implements AuthService {
  final UserAccountRepository _accounts;
  final GoogleAccountService _google;
  final _changes = StreamController<bool>.broadcast();
  UserAccount? _current;

  RepositoryAuthService({required UserAccountRepository accounts, required GoogleAccountService google})
      : _accounts = accounts,
        _google = google;

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
    _setCurrent(await _accounts.fetchByEmail(email) ?? await _accounts.create(email: email));
    return FlowStep.home;
  }

  @override
  Future<FlowStep> createAccount() async {
    _setCurrent(await _accounts.create());
    return FlowStep.onboarding;
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
  Future<void> sendPasswordReset(String email) async {}

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
