import '../models/navigation.dart' show FlowStep;

/// Authentication & session.
///
/// BUSINESS RULES THAT LIVE HERE (not in controllers/views):
///  - credential validation: throw [FieldValidationException] with 'email' / 'password' messages
///    (see services/validators.dart)
///  - account lockout / rate limiting, token storage and refresh
///  - deciding where the user goes next ([FlowStep]): signing in to an existing account goes
///    straight to home; only a newly created account starts onboarding
abstract class AuthService {
  /// Current session state. The router's default guard uses it to keep signed-out users on public routes.
  bool get isSignedIn;
  /// Emits whenever the session changes (sign-in, sign-out, token expiry). The router re-validates the stack.
  Stream<bool> get signedInChanges;

  Future<FlowStep> signIn({required String email, required String password});
  /// Starts a new account and returns the first step of sign-up (onboarding).
  /// No credentials form is designed yet; add parameters here when one is.
  Future<FlowStep> createAccount();
  /// Signs in with Google, creating the Pace account the first time that Google user signs in.
  /// New account → onboarding; existing account → home. Returns null if the user cancelled.
  Future<FlowStep?> signInWithGoogle();
  Future<FlowStep> signInWithApple();
  Future<void> sendPasswordReset(String email);
  Future<void> signOut();
  Future<void> deleteAccount();
}
