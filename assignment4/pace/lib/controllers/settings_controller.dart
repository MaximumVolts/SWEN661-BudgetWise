import '../models/settings.dart' show SettingsData;
import 'app_navigator.dart' show AppNavigator;
import '../services/auth_service.dart' show AuthService;
import '../models/user_preferences.dart' show BillReminder;
import '../services/bill_reminder_service.dart' show BillReminderService, TestReminderResult;
import '../services/settings_service.dart' show SettingsService;
import 'base_controller.dart' show ScreenController;

class SettingsController extends ScreenController {
  final SettingsService _settings;
  final AuthService _auth;
  final BillReminderService _reminders;
  SettingsController(
      {required SettingsService settings,
      required AuthService auth,
      required BillReminderService reminders,
      required AppNavigator navigator})
      : _settings = settings,
        _auth = auth,
        _reminders = reminders,
        super(navigator) {
    // e.g. after editing the profile, the header (name / username / initials) updates on return.
    refreshOn(_settings.changes);
  }


  SettingsData? data;

  @override
  Future<void> fetch() async => data = await _settings.load();

  Future<void> _toggle(SettingsData Function(SettingsData d) apply, Future<void> Function() save) async {
    final before = data;
    if (before == null) return;
    data = apply(before);
    notifyListeners();
    if (!await perform(save)) {
      data = before;
      notifyListeners();
    }
  }

  Future<void> setHighContrast(bool v) => _toggle((d) => d.copyWith(highContrast: v), () => _settings.setHighContrast(v));
  Future<void> setColorblindMode(bool v) async {
    await _toggle((d) => d.copyWith(colorblindMode: v), () => _settings.setColorblindMode(v));
    if (data?.colorblindMode != v) return; // saving failed: the error is shown instead
    showNotice(v
        ? 'Colorblind mode on: status uses blue and orange, with shapes and patterns'
        : 'Colorblind mode off');
  }
  Future<void> setShowChartValues(bool v) => _toggle((d) => d.copyWith(showChartValues: v), () => _settings.setShowChartValues(v));
  Future<void> setBudgetAlerts(bool v) => _toggle((d) => d.copyWith(budgetAlerts: v), () => _settings.setBudgetAlerts(v));

  Future<void> pickTheme() => refreshIf(navigator.openThemePicker());

  static const _notificationsOff =
      "Notifications are turned off for Pace, so reminders will only show in the app. You can turn them on in your phone's settings.";

  /// Picks when bill reminders come. Turning them on asks for notification permission.
  Future<void> pickBillReminders() async {
    final current = data?.billReminder;
    if (current == null) return;
    final picked = await navigator.pickBillReminder(current);
    if (picked == null || picked == current) return;
    if (!await perform(() => _settings.setBillReminder(picked))) return;
    await refresh();
    if (picked == BillReminder.off) return showNotice('Bill reminders off');
    showNotice(await _reminders.enable(picked) ? 'Bill reminders: ${picked.label.toLowerCase()}' : _notificationsOff);
  }

  /// Shows a sample bill reminder notification now.
  Future<void> sendTestReminder() async {
    TestReminderResult? result;
    if (!await perform(() async => result = await _reminders.sendTest())) return;
    showNotice(result == TestReminderResult.sent ? 'Test reminder sent. Check your notifications.' : _notificationsOff);
  }

  void openProfile() => navigator.openProfile();
  void openConnectedAccounts() => navigator.openConnectedAccounts();
  void openBudgetCategories() => navigator.openBudgetCategoriesSettings();
  void openStatementExport() => navigator.openStatementExport();

  Future<void> signOut() async {
    if (await perform(_auth.signOut)) navigator.openSignIn();
  }

  Future<void> deleteAccount() async {
    if (!await navigator.confirmDeleteAccount()) return;
    if (await perform(_auth.deleteAccount)) navigator.openSignIn();
  }
}
