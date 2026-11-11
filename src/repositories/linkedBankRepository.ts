import type { LinkedBankAccount, LinkedItem } from '../models/linkedBank';
import { amount, cents, type PaceDatabase, rowId } from './database';
import type { SecretVault } from './secretVault';

/** Data access for banks linked through Plaid. No business rules (see BankLinkService). */
export interface LinkedBankRepository {
  itemsFor(userId: string): Promise<LinkedItem[]>;
  accountsFor(userId: string): Promise<LinkedBankAccount[]>;
  /** Inserts or replaces [item] and replaces all of its accounts with [accounts]. */
  saveItem(item: LinkedItem, accounts: LinkedBankAccount[]): Promise<void>;
  /** Removes the item and its accounts. */
  deleteItem(itemId: string): Promise<void>;
}

export class InMemoryLinkedBankRepository implements LinkedBankRepository {
  private items: LinkedItem[] = [];
  private accounts: LinkedBankAccount[] = [];

  async itemsFor(userId: string) {
    return this.items.filter((i) => i.userId === userId);
  }

  async accountsFor(userId: string) {
    const ids = new Set(this.items.filter((i) => i.userId === userId).map((i) => i.itemId));
    return this.accounts.filter((a) => ids.has(a.itemId));
  }

  async saveItem(item: LinkedItem, accounts: LinkedBankAccount[]) {
    await this.deleteItem(item.itemId);
    this.items.push(item);
    this.accounts.push(...accounts);
  }

  async deleteItem(itemId: string) {
    this.items = this.items.filter((i) => i.itemId !== itemId);
    this.accounts = this.accounts.filter((a) => a.itemId !== itemId);
  }
}

interface ItemRow {
  item_id: string;
  user_id: number;
  institution_id: string | null;
  institution_name: string;
  sandbox_credentials_label: string;
  linked_at: string;
}

interface AccountRow {
  account_id: string;
  item_id: string;
  name: string;
  mask: string | null;
  type: string;
  subtype: string | null;
  current_cents: number | null;
  available_cents: number | null;
  currency: string | null;
}

/**
 * [LinkedBankRepository] over `linked_items` / `linked_accounts`. Each Item's Plaid access token is
 * kept in [vault] (the device's secure storage), never in the database.
 */
export class SqliteLinkedBankRepository implements LinkedBankRepository {
  constructor(
    private readonly database: PaceDatabase,
    private readonly vault: SecretVault,
  ) {}

  private static tokenKey = (itemId: string) => `plaid_token.${itemId}`;

  async itemsFor(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return [];
    const db = await this.database.connection;
    const rows = await db.getAllAsync<ItemRow>('SELECT * FROM linked_items WHERE user_id = ? ORDER BY linked_at', [user]);
    const items: LinkedItem[] = [];
    for (const r of rows) {
      items.push({
        itemId: r.item_id,
        userId: String(r.user_id),
        institutionId: r.institution_id,
        institutionName: r.institution_name,
        accessToken: (await this.vault.get(SqliteLinkedBankRepository.tokenKey(r.item_id))) ?? '',
        sandboxCredentialsLabel: r.sandbox_credentials_label,
        linkedAt: new Date(r.linked_at),
      });
    }
    return items;
  }

  async accountsFor(userId: string) {
    const user = rowId(userId);
    if (user === undefined) return [];
    const db = await this.database.connection;
    const rows = await db.getAllAsync<AccountRow>(
      'SELECT a.* FROM linked_accounts a JOIN linked_items i ON i.item_id = a.item_id WHERE i.user_id = ? ORDER BY i.linked_at, a.rowid',
      [user],
    );
    return rows.map(
      (r): LinkedBankAccount => ({
        accountId: r.account_id,
        itemId: r.item_id,
        name: r.name,
        mask: r.mask,
        type: r.type,
        subtype: r.subtype,
        currentBalance: r.current_cents === null ? null : amount(r.current_cents),
        availableBalance: r.available_cents === null ? null : amount(r.available_cents),
        currency: r.currency,
      }),
    );
  }

  async saveItem(item: LinkedItem, accounts: LinkedBankAccount[]) {
    const user = rowId(item.userId);
    if (user === undefined) return;
    const db = await this.database.connection;
    await this.vault.set(SqliteLinkedBankRepository.tokenKey(item.itemId), item.accessToken);
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM linked_items WHERE item_id = ?', [item.itemId]);
      await db.runAsync(
        'INSERT INTO linked_items (item_id, user_id, institution_id, institution_name, sandbox_credentials_label, linked_at) VALUES (?, ?, ?, ?, ?, ?)',
        [item.itemId, user, item.institutionId ?? null, item.institutionName, item.sandboxCredentialsLabel, item.linkedAt.toISOString()],
      );
      for (const a of accounts) {
        await db.runAsync(
          'INSERT OR REPLACE INTO linked_accounts (account_id, item_id, name, mask, type, subtype, current_cents, available_cents, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            a.accountId,
            item.itemId,
            a.name,
            a.mask ?? null,
            a.type,
            a.subtype ?? null,
            a.currentBalance == null ? null : cents(a.currentBalance),
            a.availableBalance == null ? null : cents(a.availableBalance),
            a.currency ?? null,
          ],
        );
      }
    });
  }

  async deleteItem(itemId: string) {
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM linked_items WHERE item_id = ?', [itemId]);
    await this.vault.delete(SqliteLinkedBankRepository.tokenKey(itemId));
  }
}
