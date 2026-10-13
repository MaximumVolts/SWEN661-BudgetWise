import '../services/auth_service.dart' show AuthService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

/// UI state only: submitting flag + inline field errors reported by the service.
/// The account rules (validation, duplicate usernames, password hashing) live in [AuthService].
class CreateAccountController extends FormController {
  final AuthService _auth;
  CreateAccountController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  List<String> get securityQuestions => _auth.securityQuestions;

  Future<void> submitAccount({
    required String name,
    required String username,
    required String password,
    required String confirmPassword,
    required String securityQuestion,
    required String securityAnswer,
    required String plaidClientId,
    required String plaidSecret,
  }) =>
      submitStep(() => _auth.createAccount(
            name: name,
            username: username,
            password: password,
            confirmPassword: confirmPassword,
            securityQuestion: securityQuestion,
            securityAnswer: securityAnswer,
            plaidClientId: plaidClientId,
            plaidSecret: plaidSecret,
          ));

  void signInInstead() => navigator.back();
}
