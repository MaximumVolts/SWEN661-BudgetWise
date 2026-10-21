import { amount, cents, type PaceDatabase, rowId } from './database';

/**
 * Data access for budgets: a user's monthly limit per category id. The limit applies to every
 * month. No business rules (validation lives in BudgetService).
 */
export interface BudgetRepository {
  /** categoryId → monthly limit, for [userId], in creation order. */
  limitsFor(userId: string): Promise<Map<string, number>>;
  /** Inserts or replaces the budget for ([userId], [categoryId]). */
  save(userId: string, categoryId: string, monthlyLimit: number): Promise<void>;
  /** Moves [userId]'s budget from [fromCategoryId] to [toCategoryId] with a new limit. */
  replace(userId: string, fromCategoryId: string, toCategoryId: string, monthlyLimit: number): Promise<void>;
  delete(userId: string, categoryId: string): Promise<void>;
}

export class InMemoryBudgetRepository implements BudgetRepository {
  private limits = new Map<string, Map<string, number>>();
  private mine(userId: string) {
    let m = this.limits.get(userId);
    if (!m) this.limits.set(userId, (m = new Map()));
    return m;
  }
  async limitsFor(userId: string) {
    return new Map(this.limits.get(userId) ?? []);
  }
  async save(userId: string, categoryId: string, monthlyLimit: number) {
    this.mine(userId).set(categoryId, monthlyLimit);
  }
  async replace(userId: string, from: string, to: string, monthlyLimit: number) {
    const m = this.mine(userId);
    m.delete(from);
    m.set(to, monthlyLimit);
  }
  async delete(userId: string, categoryId: string) {
    this.limits.get(userId)?.delete(categoryId);
  }
}

/** [BudgetRepository] over the `budgets` table (limits in integer cents). */
export class SqliteBudgetRepository implements BudgetRepository {
  constructor(private readonly database: PaceDatabase) {}

  async limitsFor(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return new Map<string, number>();
    const db = await this.database.connection;
    const rows = await db.getAllAsync<{ category_id: string; monthly_limit_cents: number }>(
      'SELECT category_id, monthly_limit_cents FROM budgets WHERE user_id = ? ORDER BY id',
      [user],
    );
    return new Map(rows.map((r) => [r.category_id, amount(r.monthly_limit_cents)]));
  }

  async save(userId: string, categoryId: string, monthlyLimit: number) {
    const user = rowId(userId);
    if (user === undefined) return;
    await this.upsert(user, categoryId, monthlyLimit);
  }

  async replace(userId: string, from: string, to: string, monthlyLimit: number) {
    const user = rowId(userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    await db.withTransactionAsync(async () => {
      if (from !== to) await db.runAsync('DELETE FROM budgets WHERE user_id = ? AND category_id = ?', [user, from]);
      await this.upsert(user, to, monthlyLimit);
    });
  }

  async delete(userId: string, categoryId: string) {
    const user = rowId(userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM budgets WHERE user_id = ? AND category_id = ?', [user, categoryId]);
  }

  /** Update the (user, category) row if it exists (keeping its order), else insert it. */
  private async upsert(user: number, categoryId: string, monthlyLimit: number) {
    const db = await this.database.connection;
    const { changes } = await db.runAsync('UPDATE budgets SET monthly_limit_cents = ? WHERE user_id = ? AND category_id = ?', [
      cents(monthlyLimit),
      user,
      categoryId,
    ]);
    if (changes === 0) {
      await db.runAsync('INSERT INTO budgets (user_id, category_id, monthly_limit_cents) VALUES (?, ?, ?)', [
        user,
        categoryId,
        cents(monthlyLimit),
      ]);
    }
  }
}
