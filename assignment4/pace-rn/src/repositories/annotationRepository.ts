import { isoDate, parseIsoDate } from '../utils/calendar';
import { type PaceDatabase, rowId } from './database';

/**
 * The user's own edits on top of bank data: categories they chose, notes, bills marked paid and
 * subscriptions paused. Banks never see these. No business rules.
 */
export interface AnnotationRepository {
  /** Transaction id → the categories the user chose, in order (the first is primary). */
  categoryOverrides(userId: string): Promise<Record<string, string[]>>;
  setCategoryOverride(userId: string, transactionId: string, categoryIds: string[]): Promise<void>;
  /** Transaction id → note. */
  notes(userId: string): Promise<Record<string, string>>;
  /** Sets the note ('' removes it). */
  setNote(userId: string, transactionId: string, note: string): Promise<void>;
  /** Recurring stream id → the due date the user marked as paid. */
  paidBills(userId: string): Promise<Map<string, Date>>;
  markBillPaid(userId: string, streamId: string, dueDate: Date): Promise<void>;
  pausedSubscriptions(userId: string): Promise<Set<string>>;
  setSubscriptionPaused(userId: string, streamId: string, paused: boolean): Promise<void>;
}

export class InMemoryAnnotationRepository implements AnnotationRepository {
  private categories = new Map<string, Record<string, string[]>>();
  private noteMap = new Map<string, Record<string, string>>();
  private paid = new Map<string, Map<string, Date>>();
  private paused = new Map<string, Set<string>>();

  private of<T>(map: Map<string, T>, userId: string, make: () => T): T {
    let v = map.get(userId);
    if (v === undefined) map.set(userId, (v = make()));
    return v;
  }

  async categoryOverrides(userId: string) {
    return { ...(this.categories.get(userId) ?? {}) };
  }
  async setCategoryOverride(userId: string, transactionId: string, categoryIds: string[]) {
    this.of(this.categories, userId, () => ({}) as Record<string, string[]>)[transactionId] = [...categoryIds];
  }
  async notes(userId: string) {
    return { ...(this.noteMap.get(userId) ?? {}) };
  }
  async setNote(userId: string, transactionId: string, note: string) {
    const mine = this.of(this.noteMap, userId, () => ({}) as Record<string, string>);
    if (note) mine[transactionId] = note;
    else delete mine[transactionId];
  }
  async paidBills(userId: string) {
    return new Map(this.paid.get(userId) ?? []);
  }
  async markBillPaid(userId: string, streamId: string, dueDate: Date) {
    this.of(this.paid, userId, () => new Map()).set(streamId, dueDate);
  }
  async pausedSubscriptions(userId: string) {
    return new Set(this.paused.get(userId) ?? []);
  }
  async setSubscriptionPaused(userId: string, streamId: string, paused: boolean) {
    const mine = this.of(this.paused, userId, () => new Set<string>());
    if (paused) mine.add(streamId);
    else mine.delete(streamId);
  }
}

/** [AnnotationRepository] over `transaction_annotations` and `recurring_stream_states`. */
export class SqliteAnnotationRepository implements AnnotationRepository {
  constructor(private readonly database: PaceDatabase) {}

  private async forUser<T>(userId: string, orElse: T, action: (user: number) => Promise<T>): Promise<T> {
    const user = rowId(userId);
    return user === undefined ? orElse : action(user);
  }

  /** Updates the row for [key] if it exists, else inserts it. */
  private async upsert(table: string, key: Record<string, string | number>, values: Record<string, string | number | null>) {
    const db = await this.database.connection;
    const where = Object.keys(key).map((k) => `${k} = ?`).join(' AND ');
    const set = Object.keys(values).map((k) => `${k} = ?`).join(', ');
    const { changes } = await db.runAsync(`UPDATE ${table} SET ${set} WHERE ${where}`, [...Object.values(values), ...Object.values(key)]);
    if (changes === 0) {
      const columns = [...Object.keys(key), ...Object.keys(values)];
      await db.runAsync(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, [
        ...Object.values(key),
        ...Object.values(values),
      ]);
    }
  }

  categoryOverrides(userId: string) {
    return this.forUser(userId, {} as Record<string, string[]>, async (user) => {
      const db = await this.database.connection;
      const rows = await db.getAllAsync<{ transaction_id: string; category_ids: string }>(
        'SELECT transaction_id, category_ids FROM transaction_annotations WHERE user_id = ? AND category_ids IS NOT NULL',
        [user],
      );
      return Object.fromEntries(rows.map((r) => [r.transaction_id, JSON.parse(r.category_ids) as string[]]));
    });
  }

  setCategoryOverride(userId: string, transactionId: string, categoryIds: string[]) {
    return this.forUser(userId, undefined, (user) =>
      this.upsert('transaction_annotations', { user_id: user, transaction_id: transactionId }, { category_ids: JSON.stringify(categoryIds) }),
    );
  }

  notes(userId: string) {
    return this.forUser(userId, {} as Record<string, string>, async (user) => {
      const db = await this.database.connection;
      const rows = await db.getAllAsync<{ transaction_id: string; note: string }>(
        'SELECT transaction_id, note FROM transaction_annotations WHERE user_id = ? AND note IS NOT NULL',
        [user],
      );
      return Object.fromEntries(rows.map((r) => [r.transaction_id, r.note]));
    });
  }

  setNote(userId: string, transactionId: string, note: string) {
    return this.forUser(userId, undefined, (user) =>
      this.upsert('transaction_annotations', { user_id: user, transaction_id: transactionId }, { note: note || null }),
    );
  }

  paidBills(userId: string) {
    return this.forUser(userId, new Map<string, Date>(), async (user) => {
      const db = await this.database.connection;
      const rows = await db.getAllAsync<{ stream_id: string; paid_due_date: string }>(
        'SELECT stream_id, paid_due_date FROM recurring_stream_states WHERE user_id = ? AND paid_due_date IS NOT NULL',
        [user],
      );
      return new Map(rows.map((r) => [r.stream_id, parseIsoDate(r.paid_due_date)!]));
    });
  }

  markBillPaid(userId: string, streamId: string, dueDate: Date) {
    return this.forUser(userId, undefined, (user) =>
      this.upsert('recurring_stream_states', { user_id: user, stream_id: streamId }, { paid_due_date: isoDate(dueDate) }),
    );
  }

  pausedSubscriptions(userId: string) {
    return this.forUser(userId, new Set<string>(), async (user) => {
      const db = await this.database.connection;
      const rows = await db.getAllAsync<{ stream_id: string }>(
        'SELECT stream_id FROM recurring_stream_states WHERE user_id = ? AND paused = 1',
        [user],
      );
      return new Set(rows.map((r) => r.stream_id));
    });
  }

  setSubscriptionPaused(userId: string, streamId: string, paused: boolean) {
    return this.forUser(userId, undefined, (user) =>
      this.upsert('recurring_stream_states', { user_id: user, stream_id: streamId }, { paused: paused ? 1 : 0 }),
    );
  }
}
