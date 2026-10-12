import 'package:flutter/material.dart' show BuildContext, StatelessWidget, Widget;
import '../controllers/settings_controller.dart' show SettingsController;
import 'screens/settings_screen.dart' show SettingsScreen;
import 'widgets/controller_scope.dart' show ControllerScope;

class SettingsView extends StatelessWidget {
  final SettingsController controller;
  const SettingsView({super.key, required this.controller});

  @override
  Widget build(BuildContext context) => ControllerScope<SettingsController>(
        controller: controller,
        builder: (context, c) => SettingsScreen(
          data: c.data!,
          onClose: c.back,
          onProfile: c.openProfile,
          onConnectedAccounts: c.openConnectedAccounts,
          onBudgetCategories: c.openBudgetCategories,
          onStatementExport: c.openStatementExport,
          onTheme: c.pickTheme,
          onHighContrastChanged: c.setHighContrast,
          onColorblindModeChanged: c.setColorblindMode,
          onShowChartValuesChanged: c.setShowChartValues,
          onBillReminders: c.pickBillReminders,
          onBudgetAlertsChanged: c.setBudgetAlerts,
          onSignOut: c.signOut,
          onDeleteAccount: c.deleteAccount,
        ),
      );
}
