import type { UserAccount } from '../models/userAccount';
import { type PaceDatabase, rowId } from './database';

export type NewUserAccount = Omit<UserAccount, 'id'>;

/** Data access for Pace accounts: reads and writes records, no business rules (see AuthService). */
export interface UserAccountRepository {
  /** undefined when no account with [id] exists. */
  fetchById(id: string): Promise<UserAccount | undefined>;
  /** Case-insensitive. undefined when no account uses [username]. */
  fetchByUsername(username: string): Promise<UserAccount | undefined>;
  /** Stores a new account and returns it with its id. */
  create(account: NewUserAccount): Promise<UserAccount>;
  /** Replaces the stored account with the same id. */
  save(account: UserAccount): Promise<void>;
  /** Deletes the account and (in SQLite) everything that belongs to it. */
  delete(id: string): Promise<void>;
}

/** Session-only storage (tests). */
export class InMemoryUserAccountRepository implements UserAccountRepository {
  private accounts: UserAccount[] = [];
  private nextId = 1;

  async fetchById(id: string) {
    return this.accounts.find((a) => a.id === id);
  }

  async fetchByUsername(username: string) {
    const u = username.trim().toLowerCase();
    return this.accounts.find((a) => a.username.toLowerCase() === u);
  }

  async create(account: NewUserAccount) {
    const created = { ...account, id: `u${this.nextId++}`, username: account.username.trim() };
    this.accounts.push(created);
    return created;
  }

  async save(account: UserAccount) {
    this.accounts = this.accounts.map((a) => (a.id === account.id ? account : a));
  }

  async delete(id: string) {
    this.accounts = this.accounts.filter((a) => a.id !== id);
  }
}

interface UserRow {
  id: number;
  username: string;
  display_name: string | null;
  password_hash: string;
  security_question: string | null;
  security_answer_hash: string | null;
}

const fromRow = (r: UserRow): UserAccount => ({
  id: String(r.id),
  username: r.username,
  displayName: r.display_name ?? undefined,
  passwordHash: r.password_hash,
  securityQuestion: r.security_question ?? undefined,
  securityAnswerHash: r.security_answer_hash ?? undefined,
});

/** [UserAccountRepository] over the `users` table; deleting a user cascades to everything they own. */
export class SqliteUserAccountRepository implements UserAccountRepository {
  constructor(private readonly database: PaceDatabase) {}

  async fetchById(id: string) {
    const row = rowId(id);
    if (row === undefined) return undefined;
    const db = await this.database.connection;
    const r = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE id = ?', [row]);
    return r ? fromRow(r) : undefined;
  }

  /** The username column is COLLATE NOCASE, so this ignores case. */
  async fetchByUsername(username: string) {
    const db = await this.database.connection;
    const r = await db.getFirstAsync<UserRow>('SELECT * FROM users WHERE username = ?', [username.trim()]);
    return r ? fromRow(r) : undefined;
  }

  async create(a: NewUserAccount) {
    const db = await this.database.connection;
    const { lastInsertRowId } = await db.runAsync(
      'INSERT INTO users (username, display_name, password_hash, security_question, security_answer_hash) VALUES (?, ?, ?, ?, ?)',
      [a.username.trim(), a.displayName ?? null, a.passwordHash, a.securityQuestion ?? null, a.securityAnswerHash ?? null],
    );
    return { ...a, username: a.username.trim(), id: String(lastInsertRowId) };
  }

  async save(a: UserAccount) {
    const row = rowId(a.id);
    if (row === undefined) return;
    const db = await this.database.connection;
    await db.runAsync(
      'UPDATE users SET username = ?, display_name = ?, password_hash = ?, security_question = ?, security_answer_hash = ? WHERE id = ?',
      [a.username, a.displayName ?? null, a.passwordHash, a.securityQuestion ?? null, a.securityAnswerHash ?? null, row],
    );
  }

  async delete(id: string) {
    const row = rowId(id);
    if (row === undefined) return;
    const db = await this.database.connection;
    await db.runAsync('DELETE FROM users WHERE id = ?', [row]);
  }
}
