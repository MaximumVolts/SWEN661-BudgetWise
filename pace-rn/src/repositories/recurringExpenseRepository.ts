import { frequencyFromCode, type RecurringExpense, type RecurringKind } from '../models/recurring';
import { isoDate, parseIsoDate } from '../utils/calendar';
import { amount, cents, type PaceDatabase, rowId } from './database';

/** Data access for the recurring expenses a user adds by hand. No business rules. */
export interface RecurringExpenseRepository {
  /** [userId]'s expenses, oldest first. */
  listFor(userId: string): Promise<RecurringExpense[]>;
  /** Inserts [expense] (empty id) or updates it; returns it with its id. */
  save(userId: string, expense: RecurringExpense): Promise<RecurringExpense>;
  delete(userId: string, id: string): Promise<void>;
}

export class InMemoryRecurringExpenseRepository implements RecurringExpenseRepository {
  private byUser = new Map<string, Map<string, RecurringExpense>>();
  private nextId = 1;

  async listFor(userId: string) {
    return [...(this.byUser.get(userId)?.values() ?? [])];
  }

  async save(userId: string, expense: RecurringExpense) {
    const saved = expense.id ? expense : { ...expense, id: String(this.nextId++) };
    let mine = this.byUser.get(userId);
    if (!mine) this.byUser.set(userId, (mine = new Map()));
    mine.set(saved.id, saved);
    return saved;
  }

  async delete(userId: string, id: string) {
    this.byUser.get(userId)?.delete(id);
  }
}

interface ExpenseRow {
  id: number;
  name: string;
  amount_cents: number;
  frequency: string;
  first_due: string;
  category_id: string;
  kind: RecurringKind;
}

/** [RecurringExpenseRepository] over `recurring_expenses` (cents, dates as 'YYYY-MM-DD'). */
export class SqliteRecurringExpenseRepository implements RecurringExpenseRepository {
  constructor(private readonly database: PaceDatabase) {}

  async listFor(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return [];
    const db = await this.database.connection;
    const rows = await db.getAllAsync<ExpenseRow>('SELECT * FROM recurring_expenses WHERE user_id = ? ORDER BY id', [user]);
    return rows.map(
      (r): RecurringExpense => ({
        id: String(r.id),
        name: r.name,
        amount: amount(r.amount_cents),
        frequency: frequencyFromCode(r.frequency),
        firstDue: parseIsoDate(r.first_due)!,
        categoryId: r.category_id,
        kind: r.kind,
      }),
    );
  }

  async save(userId: string, e: RecurringExpense) {
    const user = rowId(userId);
    if (user === undefined) return e;
    const db = await this.database.connection;
    const values = [e.name, cents(e.amount), e.frequency.code, isoDate(e.firstDue), e.categoryId, e.kind];
    const id = rowId(e.id);
    if (id === undefined) {
      const { lastInsertRowId } = await db.runAsync(
        'INSERT INTO recurring_expenses (name, amount_cents, frequency, first_due, category_id, kind, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [...values, user],
      );
      return { ...e, id: String(lastInsertRowId) };
    }
    await db.runAsync(
      'UPDATE recurring_expenses SET name = ?, amount_cents = ?, frequency = ?, first_due = ?, category_id = ?, kind = ? WHERE id = ? AND user_id = ?',
      [...values, id, user],
    );
    return e;
  }

  async delete(userId: string, id: string) {
    const user = rowId(userId);
    const row = rowId(id);
    if (user === undefined || row === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM recurring_expenses WHERE id = ? AND user_id = ?', [row, user]);
  }
}
