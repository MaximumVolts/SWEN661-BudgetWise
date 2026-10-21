import initSqlJs from 'sql.js';
import { PaceDatabase, type SqlDatabase, type SqlValue } from '@/repositories/database';

let sqlJs: ReturnType<typeof initSqlJs> | undefined;

/**
 * A fresh in-process SQLite database (sql.js) behind the same interface as expo-sqlite, migrated to
 * the app's real schema. [open] again with the same [file] bytes to simulate an app restart.
 */
export async function memoryDatabase(file?: Uint8Array): Promise<{ database: PaceDatabase; raw: SqlDatabase; export(): Uint8Array }> {
  const SQL = await (sqlJs ??= initSqlJs());
  const db = new SQL.Database(file);

  const all = <T>(sql: string, params: SqlValue[] = []): T[] => {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  };

  const raw: SqlDatabase = {
    async execAsync(sql) {
      db.exec(sql);
    },
    async runAsync(sql, params = []) {
      db.run(sql, params);
      const changes = db.getRowsModified();
      const lastInsertRowId = Number(all<{ id: number }>('SELECT last_insert_rowid() AS id')[0].id);
      return { lastInsertRowId, changes };
    },
    async getAllAsync<T>(sql: string, params?: SqlValue[]) {
      return all<T>(sql, params);
    },
    async getFirstAsync<T>(sql: string, params?: SqlValue[]) {
      return all<T>(sql, params)[0] ?? null;
    },
    async withTransactionAsync(task) {
      db.exec('BEGIN');
      try {
        await task();
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };

  const database = new PaceDatabase(async () => raw);
  await database.connection;
  return { database, raw, export: () => db.export() };
}
