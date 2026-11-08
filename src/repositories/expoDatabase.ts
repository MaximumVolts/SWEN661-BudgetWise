import { openDatabaseAsync } from 'expo-sqlite';
import { PaceDatabase, type SqlDatabase } from './database';

export const DATABASE_NAME = 'pace.db';

/** The app's database on this device (expo-sqlite). */
export const deviceDatabase = () =>
  new PaceDatabase(async () => {
    const db = await openDatabaseAsync(DATABASE_NAME);
    // expo-sqlite takes parameters as an array, like SqlDatabase.
    return db as unknown as SqlDatabase;
  });
