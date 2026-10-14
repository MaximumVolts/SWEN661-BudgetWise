-- Pace prototype database schema (SQLite).
--
-- Stores the app user's account and preferences. Bank linking uses Plaid's **Sandbox** only:
-- bank_connections can only hold sandbox Items, created with one of Plaid's published test
-- credentials (plaid_sandbox_test_credentials). The prototype is never connected to real banks.
--
-- Conventions:
--   * dates/times are ISO-8601 UTC text, e.g. '2026-10-09T14:30:00Z'
--   * booleans are INTEGER 0/1
--   * money is INTEGER cents (never REAL) to avoid rounding errors
--   * foreign keys require `PRAGMA foreign_keys = ON;` on every connection
--
-- This file is the one and only schema: the complete, current one. Create a database with:
--   sqlite3 new.db < schema.sql
-- The app does the same on first launch, then keeps that database. To change the schema, edit
-- this file and bump user_version below: on next launch the app rebuilds an older database from
-- this file and copies its data back into the tables / columns that still exist (new columns get
-- their DEFAULT, so give new NOT NULL columns one; renamed or removed ones lose their data).
-- Statements must end with ';' (trigger bodies end with 'END;'); PRAGMA / BEGIN / COMMIT
-- lines are for the sqlite3 CLI and are skipped by the app.

PRAGMA foreign_keys = ON;
PRAGMA user_version = 13;

BEGIN;

-- ── The app user ─────────────────────────────────────────────────────────────

-- Pace accounts. Secrets are only ever stored as salted PBKDF2-SHA256 hashes
-- ('pbkdf2-sha256$<iterations>$<salt>$<hash>'); password_hash is NULL for Google-only accounts.
CREATE TABLE users (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    username             TEXT    UNIQUE COLLATE NOCASE, -- how the user signs in
    -- Accounts created before usernames signed in with an email; it stays their username until
    -- the account is next saved (the app reads it when username is NULL). New accounts leave it NULL.
    email                TEXT    UNIQUE COLLATE NOCASE,
    display_name         TEXT,
    created_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    password_hash        TEXT,
    security_question    TEXT,                     -- asked before a password reset
    security_answer_hash TEXT,                     -- hash of the normalised answer
    google_id            TEXT                      -- Google's stable user id, if linked
);

CREATE UNIQUE INDEX idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- One row per user. Columns match the toggles/pickers on the Settings screen.
CREATE TABLE user_preferences (
    user_id              INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme                TEXT    NOT NULL DEFAULT 'light'
                                 CHECK (theme IN ('light', 'dark', 'system')),
    high_contrast        INTEGER NOT NULL DEFAULT 0 CHECK (high_contrast IN (0, 1)),
    -- Colorblind mode: status shown with shapes / patterns too, and a colorblind-safe palette.
    colorblind_mode      INTEGER NOT NULL DEFAULT 0 CHECK (colorblind_mode IN (0, 1)),
    show_chart_values    INTEGER NOT NULL DEFAULT 1 CHECK (show_chart_values IN (0, 1)),
    budget_alerts        INTEGER NOT NULL DEFAULT 1 CHECK (budget_alerts IN (0, 1)),
    -- Days before a bill is due to send a reminder (0 = on the day); NULL = reminders off.
    bill_reminder_days   INTEGER DEFAULT 3 CHECK (bill_reminder_days IS NULL OR bill_reminder_days >= 0),
    -- Onboarding answers: IncomeOption id ('steady' | 'variable'), set once onboarding finishes.
    income_type          TEXT,
    onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
    updated_at           TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Onboarding "what matters to you" choices (PriorityOption ids: 'spend', 'bills', 'budget', 'subs', 'goal').
CREATE TABLE user_priorities (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    priority_id TEXT    NOT NULL,
    PRIMARY KEY (user_id, priority_id)
) WITHOUT ROWID;

-- Every new user gets a preferences row with the defaults above.
CREATE TRIGGER users_default_preferences
AFTER INSERT ON users
BEGIN
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
END;

CREATE TRIGGER user_preferences_touch
AFTER UPDATE ON user_preferences
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE user_preferences
    SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE user_id = NEW.user_id;
END;

-- ── Budgets ──────────────────────────────────────────────────────────────────

-- A monthly spending limit for one category (Pace category ids, e.g. 'food'); at most one budget
-- per category per user. The limit applies to every month; the spending measured against it is
-- each month's own, from the linked bank's transactions.
CREATE TABLE budgets (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         TEXT    NOT NULL,
    monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
    created_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at          TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (user_id, category_id)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);

-- ── Recurring expenses the user adds ─────────────────────────────────────────

-- Bills and subscriptions the user tracks by hand (the bank's own recurring payments come from
-- Plaid). Payments fall on first_due, then every `frequency` after it.
CREATE TABLE recurring_expenses (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    frequency    TEXT    NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ANNUALLY')),
    first_due    TEXT    NOT NULL CHECK (first_due GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    category_id  TEXT    NOT NULL,
    kind         TEXT    NOT NULL CHECK (kind IN ('subscription', 'bill')),
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_recurring_expenses_user ON recurring_expenses(user_id);

-- ── Savings goals ────────────────────────────────────────────────────────────

-- What a user is saving toward, kept separate from spending budgets.
CREATE TABLE savings_goals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
    icon_key     TEXT    NOT NULL DEFAULT 'savings',
    saved_cents  INTEGER NOT NULL DEFAULT 0 CHECK (saved_cents >= 0),
    target_cents INTEGER NOT NULL CHECK (target_cents > 0),
    target_date  TEXT    CHECK (target_date IS NULL OR target_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);

-- Money put toward a goal (deleted with it).
CREATE TABLE goal_contributions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id      INTEGER NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    date_label   TEXT    NOT NULL,
    amount_cents INTEGER NOT NULL
);

CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id);

-- ── Expected income ──────────────────────────────────────────────────────────

-- One-off money a user expects (a refund, a freelance payment…), added to the cash flow projection.
CREATE TABLE expected_incomes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT    NOT NULL CHECK (length(trim(name)) > 0),
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    expected_on  TEXT    NOT NULL CHECK (expected_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_expected_incomes_user ON expected_incomes(user_id);

-- ── Plaid Sandbox API keys ───────────────────────────────────────────────────

-- Each user's Plaid *Sandbox* API keys (https://dashboard.plaid.com/developers/keys), entered when
-- they create their account or on Profile. Bank linking calls Plaid with the signed-in user's keys.
-- Sandbox keys only: Pace only ever calls sandbox.plaid.com. Prototype shortcut: Plaid expects the
-- secret to live on a server, not on the device.
CREATE TABLE plaid_sandbox_keys (
    user_id        INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    client_id      TEXT    NOT NULL CHECK (length(client_id) > 0),
    sandbox_secret TEXT    NOT NULL CHECK (length(sandbox_secret) > 0),
    updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- ── Plaid Sandbox test credentials ───────────────────────────────────────────

-- Plaid's *published* sandbox test users (https://plaid.com/docs/sandbox/test-credentials/).
-- These are public, documentation-provided values that only work against sandbox.plaid.com;
-- they are not secrets and give no access to any real bank. Real bank credentials must never
-- be stored anywhere in Pace.
CREATE TABLE plaid_sandbox_test_credentials (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    label       TEXT    NOT NULL UNIQUE,            -- short key used by the app, e.g. 'simple'
    username    TEXT    NOT NULL,                   -- sent as options.override_username
    password    TEXT    NOT NULL,                   -- sent as options.override_password
    description TEXT    NOT NULL,
    source_url  TEXT    NOT NULL DEFAULT 'https://plaid.com/docs/sandbox/test-credentials/',
    UNIQUE (username, password)
);

-- Sandbox simple test credentials: "basic account access to most Plaid products".
INSERT INTO plaid_sandbox_test_credentials (label, username, password, description) VALUES
    ('simple', 'user_good', 'pass_good', 'Sandbox simple test credentials: basic account access to most Plaid products.');

-- ── Bank data (Plaid Sandbox only) ───────────────────────────────────────────

-- One login at one institution (a Plaid "Item"). The provider's access token is NOT stored
-- here; credential_ref is the key it is kept under in the device's secure storage.
-- environment is pinned to 'sandbox': the database refuses any non-sandbox connection.
CREATE TABLE bank_connections (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider                 TEXT    NOT NULL CHECK (provider = 'plaid'),
    environment              TEXT    NOT NULL DEFAULT 'sandbox' CHECK (environment = 'sandbox'),
    provider_item_id         TEXT    NOT NULL,
    institution_id           TEXT,                  -- e.g. 'ins_109508' (First Platypus Bank, sandbox)
    institution_name         TEXT    NOT NULL,
    -- Which published test user created the Item.
    sandbox_test_credentials_id INTEGER NOT NULL REFERENCES plaid_sandbox_test_credentials(id),
    credential_ref           TEXT,
    status                   TEXT    NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'expired', 'revoked')),
    last_synced_at           TEXT,
    created_at               TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (provider, provider_item_id)
);

CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);

CREATE TABLE bank_accounts (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    connection_id           INTEGER NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
    provider_account_id     TEXT    NOT NULL,
    name                    TEXT    NOT NULL,       -- e.g. 'Everyday Checking'
    mask                    TEXT,                   -- last digits, e.g. '0000'
    type                    TEXT    NOT NULL
                                    CHECK (type IN ('depository', 'credit', 'loan', 'investment', 'other')),
    subtype                 TEXT,                   -- e.g. 'checking', 'savings', 'credit card'
    current_balance_cents   INTEGER,
    available_balance_cents INTEGER,
    currency                TEXT    NOT NULL DEFAULT 'USD',
    updated_at              TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE (connection_id, provider_account_id)
);

CREATE INDEX idx_bank_accounts_connection ON bank_accounts(connection_id);

-- Negative amount_cents = money out, positive = money in (same sign rule as the app's TransactionItem).
CREATE TABLE bank_transactions (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id              INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
    provider_transaction_id TEXT    NOT NULL,
    posted_date             TEXT    NOT NULL,       -- 'YYYY-MM-DD'
    merchant_name           TEXT,
    description             TEXT    NOT NULL,
    amount_cents            INTEGER NOT NULL,
    currency                TEXT    NOT NULL DEFAULT 'USD',
    pending                 INTEGER NOT NULL DEFAULT 0 CHECK (pending IN (0, 1)),
    category_id             TEXT,                   -- app category id, e.g. 'food'; user can change it
    note                    TEXT,
    UNIQUE (account_id, provider_transaction_id)
);

CREATE INDEX idx_bank_transactions_account_date ON bank_transactions(account_id, posted_date DESC);

COMMIT;
