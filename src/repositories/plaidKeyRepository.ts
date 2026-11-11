import type { PlaidKeys } from '../models/plaidKeys';
import { type PaceDatabase, rowId } from './database';

/** Data access for each user's Plaid sandbox keys. No business rules (format checks are in services). */
export interface PlaidKeyRepository {
  /** [userId]'s keys, or undefined if they haven't entered any. */
  load(userId: string): Promise<PlaidKeys | undefined>;
  /** Stores [keys] for [userId], replacing any they had. */
  save(userId: string, keys: PlaidKeys): Promise<void>;
}

export class InMemoryPlaidKeyRepository implements PlaidKeyRepository {
  private byUser = new Map<string, PlaidKeys>();
  async load(userId: string) {
    return this.byUser.get(userId);
  }
  async save(userId: string, keys: PlaidKeys) {
    this.byUser.set(userId, keys);
  }
}

/** [PlaidKeyRepository] over the `plaid_sandbox_keys` table (one row per user). */
export class SqlitePlaidKeyRepository implements PlaidKeyRepository {
  constructor(private readonly database: PaceDatabase) {}

  async load(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return undefined;
    const db = await this.database.connection;
    const r = await db.getFirstAsync<{ client_id: string; sandbox_secret: string }>(
      'SELECT client_id, sandbox_secret FROM plaid_sandbox_keys WHERE user_id = ?',
      [user],
    );
    return r ? { clientId: r.client_id, sandboxSecret: r.sandbox_secret } : undefined;
  }

  async save(userId: string, keys: PlaidKeys) {
    const user = rowId(userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('INSERT OR REPLACE INTO plaid_sandbox_keys (user_id, client_id, sandbox_secret) VALUES (?, ?, ?)', [
      user,
      keys.clientId,
      keys.sandboxSecret,
    ]);
  }
}
