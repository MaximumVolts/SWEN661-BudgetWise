/// Settings screen.
library;

import 'user_preferences.dart' show BillReminder;

class SettingsData {
  final String name;
  final String username;
  final String initials;
  final int connectedAccountCount;
  final int accountsNeedingAttention;
  final String themeLabel;
  final BillReminder billReminder;
  final bool highContrast;
  final bool colorblindMode;
  final bool showChartValues;
  final bool budgetAlerts;
  final String footerLabel;
  const SettingsData({
    required this.name,
    required this.username,
    required this.initials,
    this.connectedAccountCount = 0,
    this.accountsNeedingAttention = 0,
    this.themeLabel = 'Light',
    this.billReminder = BillReminder.threeDays,
    this.highContrast = false,
    this.colorblindMode = false,
    this.showChartValues = true,
    this.budgetAlerts = true,
    this.footerLabel = '',
  });

  String get billReminderLabel => billReminder.label;

  SettingsData copyWith({bool? highContrast, bool? colorblindMode, bool? showChartValues, bool? budgetAlerts}) => SettingsData(
        name: name,
        username: username,
        initials: initials,
        connectedAccountCount: connectedAccountCount,
        accountsNeedingAttention: accountsNeedingAttention,
        themeLabel: themeLabel,
        billReminder: billReminder,
        highContrast: highContrast ?? this.highContrast,
        colorblindMode: colorblindMode ?? this.colorblindMode,
        showChartValues: showChartValues ?? this.showChartValues,
        budgetAlerts: budgetAlerts ?? this.budgetAlerts,
        footerLabel: footerLabel,
      );
}
