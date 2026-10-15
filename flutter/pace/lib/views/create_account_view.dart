import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/create_account_controller.dart' show CreateAccountController;
import 'screens/create_account_screen.dart' show CreateAccountScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class CreateAccountView extends StatelessWidget {
  final CreateAccountController controller;
  const CreateAccountView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<CreateAccountController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => CreateAccountScreen(
          nameError: c.errorFor('name'),
          usernameError: c.errorFor('username'),
          passwordError: c.errorFor('password'),
          confirmPasswordError: c.errorFor('confirmPassword'),
          securityQuestionError: c.errorFor('securityQuestion'),
          securityAnswerError: c.errorFor('securityAnswer'),
          plaidClientIdError: c.errorFor('plaidClientId'),
          plaidSecretError: c.errorFor('plaidSecret'),
          securityQuestions: c.securityQuestions,
          isLoading: c.isSubmitting,
          onSubmit: (name, username, password, confirm, question, answer, clientId, secret) => c.submitAccount(
            name: name,
            username: username,
            password: password,
            confirmPassword: confirm,
            securityQuestion: question,
            securityAnswer: answer,
            plaidClientId: clientId,
            plaidSecret: secret,
          ),
          onBack: c.back,
          onSignIn: c.signInInstead,
        ),
      );
}
