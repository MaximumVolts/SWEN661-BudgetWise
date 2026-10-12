import '../services/auth_service.dart' show AuthService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// UI state only: submitting flag + inline field errors reported by the service.
/// The account rules (validation, duplicate emails, password hashing) live in [AuthService].
class CreateAccountController extends FormController {
  final AuthService _auth;
  CreateAccountController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  List<String> get securityQuestions => _auth.securityQuestions;

  Future<void> submitAccount({
    required String name,
    required String email,
    required String password,
    required String confirmPassword,
    required String securityQuestion,
    required String securityAnswer,
  }) =>
      submitStep(() => _auth.createAccount(
            name: name,
            email: email,
            password: password,
            confirmPassword: confirmPassword,
            securityQuestion: securityQuestion,
            securityAnswer: securityAnswer,
          ));

  void signInInstead() => navigator.back();
}
