import '../models/user_preferences.dart' show UserPreferences;

/// Data-access layer for each user's Settings toggles. No business rules.
abstract class PreferencesRepository {
  /// [userId]'s preferences, or the defaults if none are stored yet.
  Future<UserPreferences> load(String userId);

  Future<void> save(String userId, UserPreferences preferences);
}

/// Session-only storage, used by tests and when accounts aren't stored on device.
class InMemoryPreferencesRepository implements PreferencesRepository {
  final _byUser = <String, UserPreferences>{};

  @override
  Future<UserPreferences> load(String userId) async => _byUser[userId] ?? UserPreferences.defaults;

  @override
  Future<void> save(String userId, UserPreferences preferences) async => _byUser[userId] = preferences;
}
