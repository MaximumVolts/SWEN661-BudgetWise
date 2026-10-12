import '../models/dashboard.dart' show DashboardData;

/// BUSINESS RULES: everything on Home is derived here — "cannot spend" figure, comparison with the
/// previous period, projection, payday estimate, which trend is featured, budget status thresholds
/// (on track / near limit / over), which bills are "upcoming".
abstract class DashboardService {
  Future<DashboardData> load();
  /// Pulls fresh data from linked institutions (throttled / rate-limited as you see fit).
  Future<void> sync();
}
