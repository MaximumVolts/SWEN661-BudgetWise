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
          emailError: c.errorFor('email'),
          passwordError: c.errorFor('password'),
          confirmPasswordError: c.errorFor('confirmPassword'),
          securityQuestionError: c.errorFor('securityQuestion'),
          securityAnswerError: c.errorFor('securityAnswer'),
          securityQuestions: c.securityQuestions,
          isLoading: c.isSubmitting,
          onSubmit: (name, email, password, confirm, question, answer) => c.submitAccount(
            name: name,
            email: email,
            password: password,
            confirmPassword: confirm,
            securityQuestion: question,
            securityAnswer: answer,
          ),
          onBack: c.back,
          onSignIn: c.signInInstead,
        ),
      );
}
