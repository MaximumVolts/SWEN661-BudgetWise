import '../services/auth_service.dart' show AuthService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show FormController;

enum ResetStep { username, answer }

/// UI state for the two-step reset (username → security question). The rules (who can reset,
/// answer checking, lockout, password strength) live in [AuthService].
/// Field errors are keyed 'username', 'securityAnswer', 'password', 'confirmPassword'.
class ResetPasswordController extends FormController {
  final AuthService _auth;
  ResetPasswordController({required AuthService auth, required AppNavigator navigator})
      : _auth = auth,
        super(navigator);

  ResetStep step = ResetStep.username;
  String username = '';
  /// The account's security question, once step 1 succeeds.
  String? question;

  /// Step 1: look up the account's security question.
  Future<void> lookUp(String username) => submit(() async {
        question = await _auth.securityQuestionFor(username);
        this.username = username.trim();
        step = ResetStep.answer;
      });

  /// Step 2: answer the question and choose a new password; success signs in.
  Future<void> reset({required String answer, required String newPassword, required String confirmPassword}) =>
      submitStep(() => _auth.resetPassword(
            username: username,
            securityAnswer: answer,
            newPassword: newPassword,
            confirmPassword: confirmPassword,
          ));

  /// Back from step 2 returns to step 1; from step 1 it leaves the screen.
  @override
  void back() {
    if (step == ResetStep.answer) {
      step = ResetStep.username;
      question = null;
      fieldErrors = const {};
      notifyListeners();
    } else {
      navigator.back();
    }
  }

  void signInInstead() => navigator.back();
}
