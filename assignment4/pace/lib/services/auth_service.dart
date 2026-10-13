import '../models/navigation.dart' show FlowStep;

/// Authentication & session.
///
/// BUSINESS RULES THAT LIVE HERE (not in controllers/views):
///  - credential validation: throw [FieldValidationException] with 'username' / 'password' messages
///    (see services/validators.dart)
///  - account lockout / rate limiting, token storage and refresh
///  - deciding where the user goes next ([FlowStep]): signing in to an existing account goes
///    straight to home; only a newly created account starts onboarding
abstract class AuthService {
  /// Current session state. The router's default guard uses it to keep signed-out users on public routes.
  bool get isSignedIn;
  /// Emits whenever the session changes (sign-in, sign-out, token expiry). The router re-validates the stack.
  Stream<bool> get signedInChanges;

  Future<FlowStep> signIn({required String username, required String password});
  /// Questions offered at sign-up; one is asked before a password reset.
  List<String> get securityQuestions;

  /// Creates a Pace account with a password and security question, signs the user in, and
  /// returns the first step of sign-up (onboarding). Throws [FieldValidationException] with
  /// 'name' / 'username' / 'password' / 'confirmPassword' / 'securityQuestion' / 'securityAnswer' /
  /// 'plaidClientId' / 'plaidSecret' messages when the input breaks a rule (including an username
  /// already in use). The Plaid sandbox keys are stored with the account and used to link banks.
  Future<FlowStep> createAccount({
    required String name,
    required String username,
    required String password,
    required String confirmPassword,
    required String securityQuestion,
    required String securityAnswer,
    required String plaidClientId,
    required String plaidSecret,
  });

  /// Step 1 of a password reset: the security question for [username]. Throws
  /// [FieldValidationException] ('username') when there's no account, or it can't be reset.
  Future<String> securityQuestionFor(String username);

  /// Step 2: checks the security answer, sets the new password, signs the user in and returns
  /// where to go (home). Throws [FieldValidationException] with 'securityAnswer' / 'password' /
  /// 'confirmPassword' messages, or AppException after too many wrong answers.
  Future<FlowStep> resetPassword({
    required String username,
    required String securityAnswer,
    required String newPassword,
    required String confirmPassword,
  });
  /// Signs in with Google, creating the Pace account the first time that Google user signs in.
  /// New account → onboarding; existing account → home. Returns null if the user cancelled.
  Future<FlowStep?> signInWithGoogle();
  Future<FlowStep> signInWithApple();
  Future<void> signOut();
  Future<void> deleteAccount();
}
