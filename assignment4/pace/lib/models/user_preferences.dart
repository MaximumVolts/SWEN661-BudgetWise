/// A user's display and alert preferences (the toggles on the Settings screen).
class UserPreferences {
  /// Darker text, stronger borders and outlines across the app.
  final bool highContrast;
  /// Colorblind mode: status also shown with shapes and patterns, in a colorblind-safe palette.
  final bool colorblindMode;
  final bool showChartValues;
  final bool budgetAlerts;

  const UserPreferences({
    this.highContrast = false,
    this.colorblindMode = false,
    this.showChartValues = true,
    this.budgetAlerts = true,
  });

  /// What applies when nobody is signed in.
  static const defaults = UserPreferences();

  UserPreferences copyWith({bool? highContrast, bool? colorblindMode, bool? showChartValues, bool? budgetAlerts}) =>
      UserPreferences(
        highContrast: highContrast ?? this.highContrast,
        colorblindMode: colorblindMode ?? this.colorblindMode,
        showChartValues: showChartValues ?? this.showChartValues,
        budgetAlerts: budgetAlerts ?? this.budgetAlerts,
      );

  @override
  bool operator ==(Object other) =>
      other is UserPreferences &&
      other.highContrast == highContrast &&
      other.colorblindMode == colorblindMode &&
      other.showChartValues == showChartValues &&
      other.budgetAlerts == budgetAlerts;

  @override
  int get hashCode => Object.hash(highContrast, colorblindMode, showChartValues, budgetAlerts);
}
