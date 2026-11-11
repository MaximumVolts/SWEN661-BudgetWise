import { createHash } from 'crypto';
import type { DesktopBridge } from '@/repositories/desktop/desktopBridge';
import {
  DesktopNotifications,
  DesktopStatementSaver,
  DesktopVault,
  desktopDatabase,
  desktopFetch,
} from '@/repositories/desktop/desktopRepositories';
import { SqliteGoalRepository } from '@/repositories/goalRepository';
import { PasswordHasher } from '@/services/passwordHasher';
import { jsPbkdf2, webCryptoPbkdf2 } from '@/services/pbkdf2';
import { memoryDatabase } from './support/memoryDatabase';

/** A stand-in for Electron's main process: an in-process SQLite plus recorded calls. */
async function fakeBridge() {
  const { raw } = await memoryDatabase();
  const calls: { channel: string; args: unknown[] }[] = [];
  const record =
    <R>(channel: string, result: R) =>
    async (...args: unknown[]) => {
      calls.push({ channel, args });
      return result;
    };
  const secrets = new Map<string, string>();
  const bridge: DesktopBridge = {
    platform: 'test',
    db: {
      exec: (sql) => raw.execAsync(sql),
      run: (sql, params) => raw.runAsync(sql, params),
      all: (sql, params) => raw.getAllAsync(sql, params),
      first: (sql, params) => raw.getFirstAsync(sql, params),
    },
    vault: {
      get: async (k) => secrets.get(k),
      set: async (k, v) => void secrets.set(k, v),
      delete: async (k) => void secrets.delete(k),
    },
    notifications: {
      supported: record('supported', true),
      show: record('show', undefined),
      schedule: record('schedule', undefined),
      cancelAll: record('cancelAll', undefined),
    },
    saveStatement: record('saveStatement', true),
    plaidFetch: async (url, init) => (calls.push({ channel: 'plaidFetch', args: [url, init] }), { status: 200, text: '{"ok":true}' }),
  };
  return { bridge, calls, secrets };
}

describe('desktop (Electron) repositories', () => {
  it('hashes passwords with WebCrypto exactly like the pure-JavaScript PBKDF2', async () => {
    const salt = new Uint8Array(createHash('sha256').update('salt').digest());
    expect(await webCryptoPbkdf2('correct horse', salt, 1000, 32)).toEqual(await jsPbkdf2('correct horse', salt, 1000, 32));

    // A password hashed on desktop verifies with the phone's scheme, and the reverse.
    const desktop = new PasswordHasher(1000, webCryptoPbkdf2);
    const phone = new PasswordHasher(1000, jsPbkdf2);
    expect(await phone.verify('pw-123456', await desktop.hash('pw-123456'))).toBe(true);
    expect(await desktop.verify('pw-123456', await phone.hash('pw-123456'))).toBe(true);
    expect(await desktop.verify('wrong', await phone.hash('pw-123456'))).toBe(false);
  });

  it('migrates the database through the bridge and runs the real repositories on it', async () => {
    const { bridge } = await fakeBridge();
    const database = desktopDatabase(bridge);
    const goals = new SqliteGoalRepository(database);
    expect(await goals.fetchGoals('1')).toEqual([]);
    const version = await (await database.connection).getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(version?.user_version).toBeGreaterThan(0);
  });

  it('commits a transaction, and rolls back a failed one', async () => {
    const { bridge } = await fakeBridge();
    const db = await desktopDatabase(bridge).connection;
    await db.execAsync('CREATE TABLE t (v INTEGER)');
    await db.withTransactionAsync(async () => void (await db.runAsync('INSERT INTO t VALUES (?)', [1])));
    await expect(
      db.withTransactionAsync(async () => {
        await db.runAsync('INSERT INTO t VALUES (?)', [2]);
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    // The queue keeps working after a failure.
    await db.withTransactionAsync(async () => void (await db.runAsync('INSERT INTO t VALUES (?)', [3])));
    expect(await db.getAllAsync('SELECT v FROM t ORDER BY v')).toEqual([{ v: 1 }, { v: 3 }]);
  });

  it('keeps secrets under the same key scheme as the phone', async () => {
    const { bridge, secrets } = await fakeBridge();
    const vault = new DesktopVault(bridge);
    await vault.set('plaid/item 1', 'access-sandbox-x');
    expect([...secrets.keys()]).toEqual(['pace.plaid_item_1']);
    expect(await vault.get('plaid/item 1')).toBe('access-sandbox-x');
    await vault.delete('plaid/item 1');
    expect(await vault.get('plaid/item 1')).toBeUndefined();
  });

  it('passes notifications, statements and Plaid requests to the main process', async () => {
    const { bridge, calls } = await fakeBridge();
    const at = new Date(2026, 10, 20, 9);
    const notifications = new DesktopNotifications(bridge);
    expect(await notifications.requestPermission()).toBe(true);
    await notifications.schedule({ id: 7, title: 'Rent', body: 'Due tomorrow', at });
    expect(calls.at(-1)).toEqual({ channel: 'schedule', args: [{ id: 7, title: 'Rent', body: 'Due tomorrow', at: at.getTime() }] });

    const file = { fileName: 'pace.csv', mimeType: 'text/csv', format: 'csv' as const, content: 'a,b' };
    expect(await new DesktopStatementSaver(bridge).save(file)).toBe(true);
    expect(calls.at(-1)).toEqual({ channel: 'saveStatement', args: [file] });

    const response = await desktopFetch(bridge)('https://sandbox.plaid.com/accounts/get', { method: 'POST', headers: {}, body: '{}' });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('{"ok":true}');
  });
});
