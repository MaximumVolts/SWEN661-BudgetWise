import '../models/settings.dart' show SettingsData;

abstract class SettingsService {
  Future<SettingsData> load();
  Future<void> setHighContrast(bool value);
  Future<void> setChartPatterns(bool value);
  Future<void> setShowChartValues(bool value);
  Future<void> setBudgetAlerts(bool value);
}
