import '../services/auth_service.dart' show AuthService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

enum ResetStep { email, answer }

/// UI state for the two-step reset (email → security question). The rules (who can reset,
/// answer checking, lockout, password strength) live in [AuthService].
/// Field errors are keyed 'email', 'securityAnswer', 'password', 'confirmPassword'.
class ResetPasswordController extends FormController {
  final AuthService _auth;
  ResetPasswordController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  ResetStep step = ResetStep.email;
  String email = '';
  /// The account's security question, once step 1 succeeds.
  String? question;

  /// Step 1: look up the account's security question.
  Future<void> lookUp(String email) => submit(() async {
        question = await _auth.securityQuestionFor(email);
        this.email = email.trim();
        step = ResetStep.answer;
      });

  /// Step 2: answer the question and choose a new password; success signs in.
  Future<void> reset({required String answer, required String newPassword, required String confirmPassword}) =>
      submitStep(() => _auth.resetPassword(
            email: email,
            securityAnswer: answer,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          ));

  /// Back from step 2 returns to step 1; from step 1 it leaves the screen.
  @override
  void back() {
    if (step == ResetStep.answer) {
      step = ResetStep.email;
      question = null;
      fieldErrors = const {};
      notifyListeners();
    } else {
      navigator.back();
    }
  }

  void signInInstead() => navigator.back();
}
