import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/connect_bank_controller.dart' show ConnectBankController;
import 'screens/connect_bank_screen.dart' show ConnectBankScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class ConnectBankView extends StatelessWidget {
  final ConnectBankController controller;
  const ConnectBankView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<ConnectBankController>(
        controller: controller,
        autoLoad: false,
        builder: (context, c) => ConnectBankScreen(
          isLoading: c.isConnecting,
          onConnect: c.connect,
          onBack: c.back,
        ),
      );
}
