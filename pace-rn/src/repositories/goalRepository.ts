import type { SavingsGoal } from '../models/goal';
import { isoDate, parseIsoDate } from '../utils/calendar';
import { amount, cents, type PaceDatabase, rowId } from './database';

/** Data access for each user's savings goals. No business rules (see GoalService). */
export interface GoalRepository {
  /** [userId]'s goals, oldest first. */
  fetchGoals(userId: string): Promise<SavingsGoal[]>;
  fetchGoal(userId: string, id: string): Promise<SavingsGoal | undefined>;
  /** Replaces the goal with the same id, or inserts it (a goal with an empty id is new). Returns its id. */
  saveGoal(userId: string, goal: SavingsGoal): Promise<string>;
  deleteGoal(userId: string, id: string): Promise<void>;
}

export class InMemoryGoalRepository implements GoalRepository {
  private byUser = new Map<string, SavingsGoal[]>();
  private nextId = 1;

  constructor(seed: Record<string, SavingsGoal[]> = {}) {
    for (const [user, goals] of Object.entries(seed)) this.byUser.set(user, [...goals]);
  }

  async fetchGoals(userId: string) {
    return [...(this.byUser.get(userId) ?? [])];
  }

  async fetchGoal(userId: string, id: string) {
    return this.byUser.get(userId)?.find((g) => g.id === id);
  }

  async saveGoal(userId: string, goal: SavingsGoal) {
    const goals = this.byUser.get(userId) ?? [];
    const i = goal.id ? goals.findIndex((g) => g.id === goal.id) : -1;
    if (i >= 0) {
      goals[i] = goal;
      this.byUser.set(userId, goals);
      return goal.id;
    }
    const id = goal.id || `goal-${this.nextId++}`;
    this.byUser.set(userId, [...goals, { ...goal, id }]);
    return id;
  }

  async deleteGoal(userId: string, id: string) {
    this.byUser.set(userId, (this.byUser.get(userId) ?? []).filter((g) => g.id !== id));
  }
}

interface GoalRow {
  id: number;
  name: string;
  icon_key: string;
  saved_cents: number;
  target_cents: number;
  target_date: string | null;
}

/** [GoalRepository] over `savings_goals` and `goal_contributions` (cents, 'YYYY-MM-DD' dates). */
export class SqliteGoalRepository implements GoalRepository {
  constructor(private readonly database: PaceDatabase) {}

  private async goal(r: GoalRow): Promise<SavingsGoal> {
    const db = await this.database.connection;
    const contributions = await db.getAllAsync<{ date_label: string; amount_cents: number }>(
      'SELECT date_label, amount_cents FROM goal_contributions WHERE goal_id = ? ORDER BY id DESC',
      [r.id],
    );
    return {
      id: String(r.id),
      name: r.name,
      iconKey: r.icon_key,
      saved: amount(r.saved_cents),
      target: amount(r.target_cents),
      targetDate: parseIsoDate(r.target_date),
      contributions: contributions.map((c) => ({ dateLabel: c.date_label, amount: amount(c.amount_cents) })),
    };
  }

  async fetchGoals(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return [];
    const db = await this.database.connection;
    const rows = await db.getAllAsync<GoalRow>('SELECT * FROM savings_goals WHERE user_id = ? ORDER BY id', [user]);
    return Promise.all(rows.map((r) => this.goal(r)));
  }

  async fetchGoal(userId: string, id: string) {
    const user = rowId(userId);
    const row = rowId(id);
    if (user === undefined || row === undefined) return undefined;
    const db = await this.database.connection;
    const r = await db.getFirstAsync<GoalRow>('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?', [row, user]);
    return r ? this.goal(r) : undefined;
  }

  async saveGoal(userId: string, goal: SavingsGoal) {
    const user = rowId(userId);
    if (user === undefined) return goal.id;
    const db = await this.database.connection;
    let id = rowId(goal.id);
    await db.withTransactionAsync(async () => {
      const values = [
        goal.name ?? '',
        goal.iconKey,
        cents(goal.saved ?? 0),
        cents(goal.target ?? 0),
        goal.targetDate ? isoDate(goal.targetDate) : null,
      ];
      const updated =
        id === undefined
          ? 0
          : (
              await db.runAsync(
                'UPDATE savings_goals SET name = ?, icon_key = ?, saved_cents = ?, target_cents = ?, target_date = ? WHERE id = ? AND user_id = ?',
                [...values, id, user],
              )
            ).changes;
      if (updated === 0) {
        id = (
          await db.runAsync(
            'INSERT INTO savings_goals (name, icon_key, saved_cents, target_cents, target_date, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [...values, user],
          )
        ).lastInsertRowId;
      }
      // Contributions are stored oldest first, so ids grow with time; goals list them newest first.
      await db.runAsync('DELETE FROM goal_contributions WHERE goal_id = ?', [id!]);
      for (const c of [...goal.contributions].reverse()) {
        await db.runAsync('INSERT INTO goal_contributions (goal_id, date_label, amount_cents) VALUES (?, ?, ?)', [
          id!,
          c.dateLabel,
          cents(c.amount),
        ]);
      }
    });
    return String(id);
  }

  async deleteGoal(userId: string, id: string) {
    const user = rowId(userId);
    const row = rowId(id);
    if (user === undefined || row === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM savings_goals WHERE id = ? AND user_id = ?', [row, user]);
  }
}
