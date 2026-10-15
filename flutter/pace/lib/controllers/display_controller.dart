import '../models/user_preferences.dart' show UserPreferences;
import '../services/settings_service.dart' show SettingsService;
import 'base_controller.dart' show BaseController;

/// App-wide display preferences (high contrast, colorblind mode, chart values) for the app
/// root: the signed-in user's, or the defaults when signed out. Follows every change.
class DisplayController extends BaseController {
  final SettingsService _settings;
  DisplayController({required SettingsService settings}) : _settings = settings {
    listen(_settings.preferenceChanges, _set);
  }

  UserPreferences preferences = UserPreferences.defaults;

  @override
  Future<void> fetch() async => _set(await _settings.preferences());

  void _set(UserPreferences p) {
    if (p == preferences) return;
    preferences = p;
    notifyListeners();
  }

}
