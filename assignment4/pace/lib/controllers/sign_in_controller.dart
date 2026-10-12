import '../services/app_exception.dart' show FieldValidationException;
import '../models/navigation.dart' show FlowStep;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/auth_service.dart' show AuthService;
import 'base_controller.dart' show ScreenController;

/// UI state only: submitting flag + inline field errors reported by the service.
/// Validation and the "where next?" decision live in [AuthService].
class SignInController extends ScreenController {
  final AuthService _auth;
  SignInController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  String? emailError;
  String? passwordError;
  bool isSubmitting = false;

  Future<void> signIn(String email, String password) => _submit(() => _auth.signIn(email: email, password: password));
  /// Creates the Pace account on first use; cancelling the Google chooser leaves the user here.
  Future<void> signInWithGoogle() => _submit(_auth.signInWithGoogle);
  // Apple sign-in isn't implemented yet: shows the "not implemented" toast. When it is, switch to
  // _submit(_auth.signInWithApple).
  void signInWithApple() => navigator.openSocialSignIn('apple');
  void forgotPassword() => navigator.openForgotPassword();
  Future<void> createAccount() => _submit(_auth.createAccount);

  /// [action] returns the next step, or null when the user backed out (stay on this screen).
  Future<void> _submit(Future<FlowStep?> Function() action) async {
    emailError = null;
    passwordError = null;
    isSubmitting = true;
    notifyListeners();
    FlowStep? next;
    final ok = await perform(() async {
      try {
        next = await action();
      } on FieldValidationException catch (e) {
        emailError = e.errorFor('email');
        passwordError = e.errorFor('password');
      }
    });
    isSubmitting = false;
    notifyListeners();
    final step = next;
    if (ok && step != null) navigator.openFlowStep(step);
  }
}
