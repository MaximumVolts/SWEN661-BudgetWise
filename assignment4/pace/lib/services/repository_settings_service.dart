import 'dart:async' show StreamController, StreamSubscription;
import '../models/settings.dart' show SettingsData;
import '../models/user_preferences.dart' show BillReminder, UserPreferences;
import '../repositories/linked_bank_repository.dart' show LinkedBankRepository;
import '../repositories/preferences_repository.dart' show PreferencesRepository;
import 'profile_service.dart' show ProfileService;
import 'settings_service.dart' show SettingsService;

/// [SettingsService] that stores each user's toggles via [PreferencesRepository] (on device).
/// BUSINESS RULES: preferences belong to the signed-in user; signed out, the defaults apply.
/// Every change (a toggle, signing in or out) is announced on [preferenceChanges].
class RepositorySettingsService implements SettingsService {
  final ProfileService _profile;
  final PreferencesRepository _store;
  final LinkedBankRepository _banks;
  final String? Function() _currentUserId;
  final _preferenceChanges = StreamController<UserPreferences>.broadcast();
  StreamSubscription<bool>? _session;

  /// [signedInChanges]: AuthService.signedInChanges, so a new user's preferences take effect.
  RepositorySettingsService({
    required ProfileService profile,
    required PreferencesRepository store,
    required LinkedBankRepository banks,
    required String? Function() currentUserId,
    Stream<bool>? signedInChanges,
  })  : _profile = profile,
        _store = store,
        _banks = banks,
        _currentUserId = currentUserId {
    _session = signedInChanges?.listen((_) async => _preferenceChanges.add(await preferences()));
  }

  @override
  Stream<void> get changes => _profile.changes;

  @override
  Stream<UserPreferences> get preferenceChanges => _preferenceChanges.stream;

  @override
  Future<UserPreferences> preferences() async {
    final userId = _currentUserId();
    return userId == null ? UserPreferences.defaults : _store.load(userId);
  }

  @override
  Future<SettingsData> load() async {
    final me = await _profile.load();
    final prefs = await preferences();
    final userId = _currentUserId();
    final linkedAccounts = userId == null ? 0 : (await _banks.accountsFor(userId)).length;
    return SettingsData(
      name: me.name,
      username: me.username,
      initials: me.initials,
      connectedAccountCount: linkedAccounts,
      billReminder: prefs.billReminder,
      highContrast: prefs.highContrast,
      colorblindMode: prefs.colorblindMode,
      showChartValues: prefs.showChartValues,
      budgetAlerts: prefs.budgetAlerts,
      footerLabel: 'PROTOTYPE · PLAID SANDBOX DATA',
    );
  }

  Future<void> _update(UserPreferences Function(UserPreferences p) change) async {
    final userId = _currentUserId();
    if (userId == null) return;
    final next = change(await _store.load(userId));
    await _store.save(userId, next);
    _preferenceChanges.add(next);
  }

  @override
  Future<void> setHighContrast(bool v) => _update((p) => p.copyWith(highContrast: v));
  @override
  Future<void> setColorblindMode(bool v) => _update((p) => p.copyWith(colorblindMode: v));
  @override
  Future<void> setShowChartValues(bool v) => _update((p) => p.copyWith(showChartValues: v));
  @override
  Future<void> setBudgetAlerts(bool v) => _update((p) => p.copyWith(budgetAlerts: v));
  @override
  Future<void> setBillReminder(BillReminder reminder) => _update((p) => p.copyWith(billReminder: reminder));

  void dispose() {
    _session?.cancel();
    _preferenceChanges.close();
  }
}
