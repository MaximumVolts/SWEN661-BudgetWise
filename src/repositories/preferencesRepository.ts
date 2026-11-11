import { DEFAULT_PREFERENCES, reminderFromDays, type UserPreferences } from '../models/userPreferences';
import { type PaceDatabase, rowId } from './database';

/** Data access for each user's Settings toggles. No business rules. */
export interface PreferencesRepository {
  /** [userId]'s preferences, or the defaults if none are stored yet. */
  load(userId: string): Promise<UserPreferences>;
  save(userId: string, preferences: UserPreferences): Promise<void>;
}

export class InMemoryPreferencesRepository implements PreferencesRepository {
  private byUser = new Map<string, UserPreferences>();
  async load(userId: string) {
    return this.byUser.get(userId) ?? DEFAULT_PREFERENCES;
  }
  async save(userId: string, preferences: UserPreferences) {
    this.byUser.set(userId, preferences);
  }
}

interface PreferencesRow {
  high_contrast: number;
  colorblind_mode: number;
  show_chart_values: number;
  budget_alerts: number;
  bill_reminder_days: number | null;
}

/** [PreferencesRepository] over `user_preferences` (a row is created with each user). */
export class SqlitePreferencesRepository implements PreferencesRepository {
  constructor(private readonly database: PaceDatabase) {}

  async load(userId: string): Promise<UserPreferences> {
    const user = rowId(userId);
    if (user === undefined) return DEFAULT_PREFERENCES;
    const db = await this.database.connection;
    const r = await db.getFirstAsync<PreferencesRow>('SELECT * FROM user_preferences WHERE user_id = ?', [user]);
    if (!r) return DEFAULT_PREFERENCES;
    return {
      highContrast: r.high_contrast === 1,
      colorblindMode: r.colorblind_mode === 1,
      showChartValues: r.show_chart_values === 1,
      budgetAlerts: r.budget_alerts === 1,
      billReminder: reminderFromDays(r.bill_reminder_days),
    };
  }

  async save(userId: string, p: UserPreferences) {
    const user = rowId(userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    const values = [+p.highContrast, +p.colorblindMode, +p.showChartValues, +p.budgetAlerts, p.billReminder.days];
    const { changes } = await db.runAsync(
      'UPDATE user_preferences SET high_contrast = ?, colorblind_mode = ?, show_chart_values = ?, budget_alerts = ?, bill_reminder_days = ? WHERE user_id = ?',
      [...values, user],
    );
    if (changes === 0) {
      await db.runAsync(
        'INSERT INTO user_preferences (high_contrast, colorblind_mode, show_chart_values, budget_alerts, bill_reminder_days, user_id) VALUES (?, ?, ?, ?, ?, ?)',
        [...values, user],
      );
    }
  }
}
