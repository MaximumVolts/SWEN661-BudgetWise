import '../models/settings.dart' show SettingsData;
import 'app_navigator.dart' show AppNavigator;
import '../services/auth_service.dart' show AuthService;
import '../services/settings_service.dart' show SettingsService;
import 'base_controller.dart' show ScreenController;

class SettingsController extends ScreenController {
  final SettingsService _settings;
  final AuthService _auth;
  SettingsController({required SettingsService settings, required AuthService auth, required AppNavigator navigator})
      : _settings = settings,
        _auth = auth,
        super(navigator) {
    // e.g. after editing the profile, the header (name / email / initials) updates on return.
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

  Future<void> pickBillReminders() => refreshIf(navigator.openBillReminderPicker());

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
