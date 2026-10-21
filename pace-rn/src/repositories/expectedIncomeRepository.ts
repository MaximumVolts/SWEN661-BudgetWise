import type { ExpectedIncome } from '../models/cashFlow';
import { isoDate, parseIsoDate } from '../utils/calendar';
import { amount, cents, type PaceDatabase, rowId } from './database';

/** Data access for one-off income a user expects. No business rules. */
export interface ExpectedIncomeRepository {
  /** [userId]'s expected income, soonest first. */
  listFor(userId: string): Promise<ExpectedIncome[]>;
  /** Stores [income] (its id is ignored) and returns the new id. */
  add(userId: string, income: ExpectedIncome): Promise<string>;
  delete(userId: string, id: string): Promise<void>;
}

export class InMemoryExpectedIncomeRepository implements ExpectedIncomeRepository {
  private byUser = new Map<string, ExpectedIncome[]>();
  private nextId = 1;

  async listFor(userId: string) {
    return [...(this.byUser.get(userId) ?? [])].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async add(userId: string, income: ExpectedIncome) {
    const id = String(this.nextId++);
    this.byUser.set(userId, [...(this.byUser.get(userId) ?? []), { ...income, id }]);
    return id;
  }

  async delete(userId: string, id: string) {
    this.byUser.set(userId, (this.byUser.get(userId) ?? []).filter((i) => i.id !== id));
  }
}

/** [ExpectedIncomeRepository] over `expected_incomes` (cents, 'YYYY-MM-DD' dates). */
export class SqliteExpectedIncomeRepository implements ExpectedIncomeRepository {
  constructor(private readonly database: PaceDatabase) {}

  async listFor(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return [];
    const db = await this.database.connection;
    const rows = await db.getAllAsync<{ id: number; name: string; amount_cents: number; expected_on: string }>(
      'SELECT * FROM expected_incomes WHERE user_id = ? ORDER BY expected_on, id',
      [user],
    );
    return rows.map((r) => ({ id: String(r.id), name: r.name, amount: amount(r.amount_cents), date: parseIsoDate(r.expected_on)! }));
  }

  async add(userId: string, income: ExpectedIncome) {
    const user = rowId(userId);
    if (user === undefined) return '';
    const db = await this.database.connection;
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO expected_incomes (user_id, name, amount_cents, expected_on) VALUES (?, ?, ?, ?)',
      [user, income.name, cents(income.amount), isoDate(income.date)],
    );
    return String(lastInsertRowId);
  }

  async delete(userId: string, id: string) {
    const user = rowId(userId);
    const row = rowId(id);
    if (user === undefined || row === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM expected_incomes WHERE id = ? AND user_id = ?', [row, user]);
  }
}
