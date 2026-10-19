import '../services/auth_service.dart' show AuthService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// UI state only: submitting flag + inline field errors reported by the service.
/// Validation and the "where next?" decision live in [AuthService].
class SignInController extends FormController {
  final AuthService _auth;
  SignInController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  String? get usernameError => errorFor('username');
  String? get passwordError => errorFor('password');

  Future<void> signIn(String username, String password) => submitStep(() => _auth.signIn(username: username, password: password));
  Future<void> signInWithGoogle() => submitStep(_auth.signInWithGoogle);
  void signInWithApple() => navigator.openSocialSignIn('apple');
  void forgotPassword() => navigator.openForgotPassword();
  void createAccount() => navigator.openCreateAccount();
}
