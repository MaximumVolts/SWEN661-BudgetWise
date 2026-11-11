import { type PaceDatabase, rowId } from './database';

/** Reports whose look each user can customize. */
export type ReportId = 'comparison';

/**
 * Data access for how each user likes a report shown (stored as JSON). No business rules: what
 * comes back is whatever was stored, and the report's service checks it.
 */
export interface ReportPreferencesRepository {
  /** [userId]'s stored choices for [report], or undefined if none are stored. */
  load(userId: string, report: ReportId): Promise<unknown>;
  save(userId: string, report: ReportId, options: object): Promise<void>;
}

export class InMemoryReportPreferencesRepository implements ReportPreferencesRepository {
  private stored = new Map<string, string>();
  async load(userId: string, report: ReportId) {
    const json = this.stored.get(`${userId}/${report}`);
    return json === undefined ? undefined : JSON.parse(json);
  }
  async save(userId: string, report: ReportId, options: object) {
    this.stored.set(`${userId}/${report}`, JSON.stringify(options));
  }
}

/** [ReportPreferencesRepository] over `report_preferences`. */
export class SqliteReportPreferencesRepository implements ReportPreferencesRepository {
  constructor(private readonly database: PaceDatabase) {}

  async load(userId: string, report: ReportId): Promise<unknown> {
    const user = rowId(userId);
    if (user === undefined) return undefined;
    const db = await this.database.connection;
    const row = await db.getFirstAsync<{ options: string }>('SELECT options FROM report_preferences WHERE user_id = ? AND report = ?', [user, report]);
    if (!row) return undefined;
    try {
      return JSON.parse(row.options);
    } catch {
      return undefined;
    }
  }

  async save(userId: string, report: ReportId, options: object) {
    const user = rowId(userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    await db.runAsync(
      'INSERT INTO report_preferences (user_id, report, options) VALUES (?, ?, ?) ON CONFLICT (user_id, report) DO UPDATE SET options = excluded.options',
      [user, report, JSON.stringify(options)],
    );
  }
}
