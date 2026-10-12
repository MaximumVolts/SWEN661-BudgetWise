/// Settings screen.
library;

class SettingsData {
  final String name;
  final String email;
  final String initials;
  final int connectedAccountCount;
  final int accountsNeedingAttention;
  final String themeLabel;
  final String billReminderLabel;
  final bool highContrast;
  final bool colorblindMode;
  final bool showChartValues;
  final bool budgetAlerts;
  final String footerLabel;
  const SettingsData({
    required this.name,
    required this.email,
    required this.initials,
    this.connectedAccountCount = 0,
    this.accountsNeedingAttention = 0,
    this.themeLabel = 'Light',
    this.billReminderLabel = '',
    this.highContrast = false,
    this.colorblindMode = false,
    this.showChartValues = true,
    this.budgetAlerts = true,
    this.footerLabel = '',
  });

  SettingsData copyWith({bool? highContrast, bool? colorblindMode, bool? showChartValues, bool? budgetAlerts}) => SettingsData(
        name: name,
        email: email,
        initials: initials,
        connectedAccountCount: connectedAccountCount,
        accountsNeedingAttention: accountsNeedingAttention,
        themeLabel: themeLabel,
        billReminderLabel: billReminderLabel,
        highContrast: highContrast ?? this.highContrast,
        colorblindMode: colorblindMode ?? this.colorblindMode,
        showChartValues: showChartValues ?? this.showChartValues,
        budgetAlerts: budgetAlerts ?? this.budgetAlerts,
        footerLabel: footerLabel,
      );
}
