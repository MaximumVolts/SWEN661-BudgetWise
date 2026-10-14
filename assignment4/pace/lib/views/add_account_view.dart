import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/add_account_controller.dart' show AddAccountController;
import 'screens/add_account_screen.dart' show AddAccountScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class AddAccountView extends StatelessWidget {
  final AddAccountController controller;
  const AddAccountView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<AddAccountController>(
        controller: controller,
        builder: (context, c) => AddAccountScreen(
          institutions: c.institutions,
          selectedId: c.selectedId,
          isConnecting: c.isConnecting,
          onSelect: c.select,
          onConnect: c.connect,
          onBack: c.back,
        ),
      );
}
