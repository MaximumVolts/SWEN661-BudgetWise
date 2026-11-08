import type { StatementFile } from '../../models/statement';
import { PaceDatabase, type SqlDatabase, type SqlValue } from '../database';
import type { DeviceNotifications } from '../deviceNotifications';
import type { Fetch } from '../sandboxPlaidApi';
import type { SecretVault } from '../secretVault';
import type { StatementSaver } from '../statementSaver';
import type { DesktopBridge } from './desktopBridge';

/**
 * [SqlDatabase] on the desktop app's SQLite file (node:sqlite in Electron's main process).
 * Transactions run one at a time; like expo-sqlite, other queries issued while one is open join it.
 */
export class DesktopSqlDatabase implements SqlDatabase {
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private readonly bridge: DesktopBridge) {}

  execAsync(sql: string) {
    return this.bridge.db.exec(sql);
  }
  runAsync(sql: string, params: SqlValue[] = []) {
    return this.bridge.db.run(sql, params);
  }
  async getAllAsync<T>(sql: string, params: SqlValue[] = []) {
    return (await this.bridge.db.all(sql, params)) as T[];
  }
  async getFirstAsync<T>(sql: string, params: SqlValue[] = []) {
    return (await this.bridge.db.first(sql, params)) as T | null;
  }
  withTransactionAsync(task: () => Promise<void>): Promise<void> {
    const run = this.queue.then(async () => {
      await this.bridge.db.exec('BEGIN');
      try {
        await task();
        await this.bridge.db.exec('COMMIT');
      } catch (e) {
        await this.bridge.db.exec('ROLLBACK');
        throw e;
      }
    });
    this.queue = run.catch(() => {});
    return run;
  }
}

/** The desktop app's database, opened and migrated on first use. */
export const desktopDatabase = (bridge: DesktopBridge) => new PaceDatabase(async () => new DesktopSqlDatabase(bridge));

/** Secrets encrypted with the OS keychain (Electron safeStorage: DPAPI, Keychain, libsecret). */
export class DesktopVault implements SecretVault {
  private static key = (k: string) => `pace.${k.replace(/[^A-Za-z0-9._-]/g, '_')}`;
  constructor(private readonly bridge: DesktopBridge) {}
  get(key: string) {
    return this.bridge.vault.get(DesktopVault.key(key));
  }
  set(key: string, value: string) {
    return this.bridge.vault.set(DesktopVault.key(key), value);
  }
  delete(key: string) {
    return this.bridge.vault.delete(DesktopVault.key(key));
  }
}

/**
 * System notifications from the desktop app. Scheduled reminders fire while Pace is open (or
 * minimised); the app reschedules them each time it starts.
 */
export class DesktopNotifications implements DeviceNotifications {
  constructor(private readonly bridge: DesktopBridge) {}
  requestPermission() {
    return this.bridge.notifications.supported();
  }
  show(n: { id: number; title: string; body: string }) {
    return this.bridge.notifications.show(n);
  }
  schedule(n: { id: number; title: string; body: string; at: Date }) {
    return this.bridge.notifications.schedule({ id: n.id, title: n.title, body: n.body, at: n.at.getTime() });
  }
  cancelAll() {
    return this.bridge.notifications.cancelAll();
  }
}

/** Saves statements where the user picks in a Save dialog (PDFs are printed from their HTML). */
export class DesktopStatementSaver implements StatementSaver {
  constructor(private readonly bridge: DesktopBridge) {}
  save(file: StatementFile) {
    return this.bridge.saveStatement({ fileName: file.fileName, mimeType: file.mimeType, format: file.format, content: file.content });
  }
}

/** Plaid sandbox requests, sent by Electron's main process. */
export const desktopFetch =
  (bridge: DesktopBridge): Fetch =>
  async (url, init) => {
    const { status, text } = await bridge.plaidFetch(url, init);
    return { status, text: async () => text };
  };
