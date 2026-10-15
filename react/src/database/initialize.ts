import type { SQLiteDatabase } from 'expo-sqlite';

import { DATABASE_VERSION, schemaSql } from './schema';

export async function initializePaceDatabase(database: SQLiteDatabase) {
  await database.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(`Database version ${currentVersion} is newer than this app supports.`);
  }
  if (currentVersion === DATABASE_VERSION) return;
  if (currentVersion !== 0) {
    throw new Error(`No database migration exists from version ${currentVersion}.`);
  }

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.execAsync(schemaSql);
    await transaction.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  });
}