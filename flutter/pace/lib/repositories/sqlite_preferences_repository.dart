import '../models/user_preferences.dart' show BillReminder, UserPreferences;
import 'preferences_repository.dart' show PreferencesRepository;
import 'sqlite_repository.dart' show SqliteRepository;

/// [PreferencesRepository] over the `user_preferences` table. Every user gets a row with the
/// defaults when they're created (trigger `users_default_preferences`); [save] also inserts one if
/// it's missing.
class SqlitePreferencesRepository extends SqliteRepository implements PreferencesRepository {
  SqlitePreferencesRepository(super.database);

  static int _bit(bool v) => v ? 1 : 0;

  @override
  Future<UserPreferences> load(String userId) =>
      forUser(userId, orElse: UserPreferences.defaults, action: (db, user) async {
        final rows = await db.query('user_preferences',
            columns: ['high_contrast', 'colorblind_mode', 'show_chart_values', 'budget_alerts', 'bill_reminder_days'],
            where: 'user_id = ?',
            whereArgs: [user]);
        if (rows.isEmpty) return UserPreferences.defaults;
        final r = rows.single;
        return UserPreferences(
          highContrast: r['high_contrast'] == 1,
          colorblindMode: r['colorblind_mode'] == 1,
          showChartValues: r['show_chart_values'] == 1,
          budgetAlerts: r['budget_alerts'] == 1,
          billReminder: BillReminder.fromDays(r['bill_reminder_days'] as int?),
        );
      });

  @override
  Future<void> save(String userId, UserPreferences p) => forUser(userId, orElse: null, action: (db, user) async {
        final values = {
          'high_contrast': _bit(p.highContrast),
          'colorblind_mode': _bit(p.colorblindMode),
          'show_chart_values': _bit(p.showChartValues),
          'budget_alerts': _bit(p.budgetAlerts),
          'bill_reminder_days': p.billReminder.days,
        };
        await db.transaction((txn) async {
          final updated = await txn.update('user_preferences', values, where: 'user_id = ?', whereArgs: [user]);
          if (updated == 0) await txn.insert('user_preferences', {'user_id': user, ...values});
        });
      });
}
