import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/accounts_controller.dart' show AccountsController;
import 'screens/accounts_screen.dart' show AccountsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class AccountsView extends StatelessWidget {
  final AccountsController controller;
  const AccountsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<AccountsController>(
        controller: controller,
        builder: (context, c) => AccountsScreen(
          groups: c.data!.groups,
          banner: c.data!.banner,
          emptyMessage: c.data!.emptyMessage,
          onReconnect: c.reconnect,
          onDismissBanner: c.dismissBanner,
          onLinkAccount: c.linkAccount,
          onMenu: c.openMenu,
          onAccountTap: c.openAccount,
        ),
      );
}
