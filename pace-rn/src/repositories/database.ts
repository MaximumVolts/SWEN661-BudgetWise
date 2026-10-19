import { MIGRATIONS } from './schema';

export type SqlValue = string | number | null;
export type SqlRow = Record<string, SqlValue>;

/**
 * The SQL calls repositories make. expo-sqlite's SQLiteDatabase provides them on the device;
 * tests use an in-process SQLite with the same schema.
 */
export interface SqlDatabase {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: SqlValue[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getAllAsync<T = SqlRow>(sql: string, params?: SqlValue[]): Promise<T[]>;
  getFirstAsync<T = SqlRow>(sql: string, params?: SqlValue[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

/** Brings [db] up to the latest schema (see MIGRATIONS) and turns on foreign keys. */
export async function migrate(db: SqlDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  const version = (await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version'))?.user_version ?? 0;
  for (let v = version; v < MIGRATIONS.length; v++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[v]);
      await db.execAsync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}

/**
 * The app's database, opened and migrated on first use (so building services never touches the
 * disk). [open] gives the raw connection.
 */
export class PaceDatabase {
  private ready?: Promise<SqlDatabase>;
  constructor(private readonly open: () => Promise<SqlDatabase>) {}

  get connection(): Promise<SqlDatabase> {
    return (this.ready ??= this.open().then(async (db) => {
      await migrate(db);
      return db;
    }));
  }
}

/** Integer cents for an amount (money is stored as cents). */
export const cents = (amount: number) => Math.round(amount * 100);
/** An amount from integer cents. */
export const amount = (c: SqlValue) => Number(c) / 100;

/** The INTEGER row id behind an app id string, or undefined if it can't be one. */
export function rowId(id: string | undefined | null): number | undefined {
  return id && /^\d+$/.test(id) ? Number(id) : undefined;
}
