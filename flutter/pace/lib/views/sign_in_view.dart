import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/sign_in_controller.dart' show SignInController;
import 'screens/sign_in_screen.dart' show SignInScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class SignInView extends StatelessWidget {
  final SignInController controller;
  const SignInView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<SignInController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => SignInScreen(
          usernameError: c.usernameError,
          passwordError: c.passwordError,
          isLoading: c.isSubmitting,
          onSignIn: c.signIn,
          onForgotPassword: c.forgotPassword,
          onContinueWithGoogle: c.signInWithGoogle,
          onContinueWithApple: c.signInWithApple,
          onCreateAccount: c.createAccount,
        ),
      );
}
