/// When to remind the user about a bill, if at all.
enum BillReminder {
  off(null, 'Off'),
  onDueDate(0, 'On the due date'),
  oneDay(1, '1 day before'),
  threeDays(3, '3 days before'),
  oneWeek(7, '1 week before');

  /// Days before the due date; null = no reminders.
  final int? days;
  final String label;
  const BillReminder(this.days, this.label);

  /// The option for [days] as stored (null = off); unknown values fall back to [threeDays].
  static BillReminder fromDays(int? days) =>
      days == null ? off : values.firstWhere((r) => r.days == days, orElse: () => threeDays);
}

/// A user's display and alert preferences (the toggles and pickers on the Settings screen).
class UserPreferences {
  /// Darker text, stronger borders and outlines across the app.
  final bool highContrast;
  /// Colorblind mode: status also shown with shapes and patterns, in a colorblind-safe palette.
  final bool colorblindMode;
  final bool showChartValues;
  final bool budgetAlerts;
  /// When bill reminders come (in-app notifications and push notifications).
  final BillReminder billReminder;

  const UserPreferences({
    this.highContrast = false,
    this.colorblindMode = false,
    this.showChartValues = true,
    this.budgetAlerts = true,
    this.billReminder = BillReminder.threeDays,
  });

  /// What applies when nobody is signed in.
  static const defaults = UserPreferences();

  UserPreferences copyWith({
    bool? highContrast,
    bool? colorblindMode,
    bool? showChartValues,
    bool? budgetAlerts,
    BillReminder? billReminder,
  }) =>
      UserPreferences(
        highContrast: highContrast ?? this.highContrast,
        colorblindMode: colorblindMode ?? this.colorblindMode,
        showChartValues: showChartValues ?? this.showChartValues,
        budgetAlerts: budgetAlerts ?? this.budgetAlerts,
        billReminder: billReminder ?? this.billReminder,
      );

  @override
  bool operator ==(Object other) =>
      other is UserPreferences &&
      other.highContrast == highContrast &&
      other.colorblindMode == colorblindMode &&
      other.showChartValues == showChartValues &&
      other.budgetAlerts == budgetAlerts &&
      other.billReminder == billReminder;

  @override
  int get hashCode => Object.hash(highContrast, colorblindMode, showChartValues, budgetAlerts, billReminder);
}
