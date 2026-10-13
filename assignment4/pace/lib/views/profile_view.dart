import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/profile_controller.dart' show ProfileController;
import 'screens/profile_screen.dart' show ProfileScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class ProfileView extends StatelessWidget {
  final ProfileController controller;
  const ProfileView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<ProfileController>(
        controller: controller,
        builder: (context, c) => ProfileScreen(
          data: c.data!,
          nameError: c.errorFor('name'),
          plaidClientIdError: c.errorFor('plaidClientId'),
          plaidSecretError: c.errorFor('plaidSecret'),
          isSaving: c.isSubmitting,
          justSaved: c.justSaved,
          onSave: (name, clientId, secret) => c.save(name: name, plaidClientId: clientId, plaidSecret: secret),
          onEdited: c.edited,
          onBack: c.back,
          banks: c.banks,
          isConnectingBank: c.isConnectingBank,
          removingBankId: c.removingBankId,
          onConnectBank: c.connectBank,
          onRemoveBank: c.removeBank,
        ),
      );
}
