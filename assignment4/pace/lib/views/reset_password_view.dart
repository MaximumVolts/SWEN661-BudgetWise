import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/reset_password_controller.dart' show ResetPasswordController;
import 'screens/reset_password_screen.dart' show ResetPasswordScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class ResetPasswordView extends StatelessWidget {
  final ResetPasswordController controller;
  const ResetPasswordView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<ResetPasswordController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => ResetPasswordScreen(
          question: c.question,
          usernameError: c.errorFor('username'),
          answerError: c.errorFor('securityAnswer'),
          passwordError: c.errorFor('password'),
          confirmPasswordError: c.errorFor('confirmPassword'),
          isLoading: c.isSubmitting,
          onLookUp: c.lookUp,
          onReset: (answer, password, confirm) => c.reset(answer: answer, newPassword: password, confirmPassword: confirm),
          onBack: c.back,
          onSignIn: c.signInInstead,
        ),
      );
}
