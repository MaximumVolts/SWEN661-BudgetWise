/**
 * The on-device SQLite schema, the one and only definition of it.
 *
 * Conventions:
 *  - dates are 'YYYY-MM-DD' text, times ISO-8601 UTC text
 *  - booleans are INTEGER 0/1
 *  - money is INTEGER cents (never REAL) to avoid rounding errors
 *  - every user-owned row cascades away with its user
 *
 * To change it, add a step to MIGRATIONS (never edit a step that has shipped): each runs once, in
 * order, and `PRAGMA user_version` records how many have run.
 */
export const MIGRATIONS: string[] = [
  // 1: the first version.
  `
  CREATE TABLE users (
      id                   INTEGER PRIMARY KEY AUTOINCREMENT,
      username             TEXT    NOT NULL UNIQUE COLLATE NOCASE,   -- how the user signs in
      display_name         TEXT,
      password_hash        TEXT    NOT NULL,                         -- 'pbkdf2-sha256$…', never the password
      security_question    TEXT,                                     -- asked before a password reset
      security_answer_hash TEXT,                                     -- hash of the normalised answer
      created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
  );

  -- One row per user, created with the user. Columns match the toggles on Settings.
  CREATE TABLE user_preferences (
      user_id            INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      high_contrast      INTEGER NOT NULL DEFAULT 0 CHECK (high_contrast IN (0, 1)),
      colorblind_mode    INTEGER NOT NULL DEFAULT 0 CHECK (colorblind_mode IN (0, 1)),
      show_chart_values  INTEGER NOT NULL DEFAULT 1 CHECK (show_chart_values IN (0, 1)),
      budget_alerts      INTEGER NOT NULL DEFAULT 1 CHECK (budget_alerts IN (0, 1)),
      -- Days before a bill is due to send a reminder (0 = on the day); NULL = reminders off.
      bill_reminder_days INTEGER DEFAULT 3 CHECK (bill_reminder_days IS NULL OR bill_reminder_days >= 0)
  );

  CREATE TRIGGER users_default_preferences AFTER INSERT ON users
  BEGIN
      INSERT INTO user_preferences (user_id) VALUES (NEW.id);
  END;

  -- Each user's Plaid *Sandbox* API keys. Pace only ever calls sandbox.plaid.com.
  -- Prototype shortcut: Plaid expects the secret to live on a server, not on the device.
  CREATE TABLE plaid_sandbox_keys (
      user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      client_id      TEXT NOT NULL CHECK (length(client_id) > 0),
      sandbox_secret TEXT NOT NULL CHECK (length(sandbox_secret) > 0)
  );

  -- A monthly limit for one spending category; at most one per category per user.
  CREATE TABLE budgets (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category_id         TEXT    NOT NULL,
      monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
      UNIQUE (user_id, category_id)
  );

  -- Bills and subscriptions the user tracks by hand (the bank's own come from Plaid).
  CREATE TABLE recurring_expenses (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      frequency    TEXT    NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ANNUALLY')),
      first_due    TEXT    NOT NULL,
      category_id  TEXT    NOT NULL,
      kind         TEXT    NOT NULL CHECK (kind IN ('subscription', 'bill'))
  );

  CREATE TABLE savings_goals (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
      icon_key     TEXT    NOT NULL DEFAULT 'savings',
      saved_cents  INTEGER NOT NULL DEFAULT 0 CHECK (saved_cents >= 0),
      target_cents INTEGER NOT NULL CHECK (target_cents > 0),
      target_date  TEXT
  );

  -- Money put toward a goal, deleted with it.
  CREATE TABLE goal_contributions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id      INTEGER NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
      date_label   TEXT    NOT NULL,
      amount_cents INTEGER NOT NULL
  );

  -- One-off money a user expects, added to the cash flow projection.
  CREATE TABLE expected_incomes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      expected_on  TEXT    NOT NULL
  );

  -- Banks linked through Plaid's sandbox (one row per Plaid "Item"). The access token is not
  -- stored here: it lives in the device's secure storage, under the item id.
  CREATE TABLE linked_items (
      item_id                   TEXT PRIMARY KEY,
      user_id                   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      institution_id            TEXT,
      institution_name          TEXT NOT NULL,
      sandbox_credentials_label TEXT NOT NULL DEFAULT 'simple',
      linked_at                 TEXT NOT NULL
  );

  CREATE TABLE linked_accounts (
      account_id        TEXT    PRIMARY KEY,
      item_id           TEXT    NOT NULL REFERENCES linked_items(item_id) ON DELETE CASCADE,
      name              TEXT    NOT NULL,
      mask              TEXT,
      type              TEXT    NOT NULL,
      subtype           TEXT,
      current_cents     INTEGER,
      available_cents   INTEGER,
      currency          TEXT
  );

  -- The user's own edits on top of bank transactions. Banks never see these.
  CREATE TABLE transaction_annotations (
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      transaction_id TEXT    NOT NULL,
      category_ids   TEXT,                  -- JSON array of category ids, primary first
      note           TEXT,
      PRIMARY KEY (user_id, transaction_id)
  );

  -- Per recurring payment: the due date last marked paid, and whether tracking is paused.
  CREATE TABLE recurring_stream_states (
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stream_id     TEXT    NOT NULL,
      paid_due_date TEXT,
      paused        INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0, 1)),
      PRIMARY KEY (user_id, stream_id)
  );
  `,
];
