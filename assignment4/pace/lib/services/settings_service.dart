import '../models/settings.dart' show SettingsData;
import '../models/user_preferences.dart' show BillReminder, UserPreferences;

abstract class SettingsService {
  Future<SettingsData> load();
  Future<void> setHighContrast(bool value);
  Future<void> setColorblindMode(bool value);
  Future<void> setShowChartValues(bool value);
  Future<void> setBudgetAlerts(bool value);
  /// When bill reminders come (in-app and push notifications), or [BillReminder.off].
  Future<void> setBillReminder(BillReminder reminder);

  /// Emits when data shown on Settings changed elsewhere (e.g. the profile was edited).
  Stream<void> get changes;

  /// The preferences in effect now: the signed-in user's, or the defaults when signed out.
  Future<UserPreferences> preferences();

  /// Emits the preferences in effect whenever they change: a toggle, signing in, or signing out.
  /// The app applies them (high contrast, colorblind mode) everywhere.
  Stream<UserPreferences> get preferenceChanges;
}
