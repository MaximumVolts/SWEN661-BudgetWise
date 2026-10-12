import '../models/settings.dart' show SettingsData;
import '../services/app_navigator.dart' show AppNavigator, ExternalLink;
import '../services/auth_service.dart' show AuthService;
import '../services/settings_service.dart' show SettingsService;
import 'base_controller.dart' show ScreenController;

class SettingsController extends ScreenController {
  final SettingsService _settings;
  final AuthService _auth;
  SettingsController({required SettingsService settings, required AuthService auth, required AppNavigator navigator})
      : _settings = settings,
        _auth = auth,
        super(navigator);

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
  Future<void> setChartPatterns(bool v) => _toggle((d) => d.copyWith(chartPatterns: v), () => _settings.setChartPatterns(v));
  Future<void> setShowChartValues(bool v) => _toggle((d) => d.copyWith(showChartValues: v), () => _settings.setShowChartValues(v));
  Future<void> setBudgetAlerts(bool v) => _toggle((d) => d.copyWith(budgetAlerts: v), () => _settings.setBudgetAlerts(v));

  Future<void> pickTheme() async {
    if (await navigator.openThemePicker()) await refresh();
  }

  Future<void> pickBillReminders() async {
    if (await navigator.openBillReminderPicker()) await refresh();
  }

  void openProfile() => navigator.openProfile();
  void openConnectedAccounts() => navigator.openConnectedAccounts();
  void openBudgetCategories() => navigator.openBudgetCategoriesSettings();
  void openStatementExport() => navigator.openStatementExport();
  void openPasswordSecurity() => navigator.openPasswordSecurity();
  void openTerms() => navigator.openExternal(ExternalLink.termsOfUse);
  void openPrivacy() => navigator.openExternal(ExternalLink.privacyPolicy);

  Future<void> signOut() async {
    if (await perform(_auth.signOut)) navigator.openSignIn();
  }

  Future<void> deleteAccount() async {
    if (!await navigator.confirmDeleteAccount()) return;
    if (await perform(_auth.deleteAccount)) navigator.openSignIn();
  }
}
