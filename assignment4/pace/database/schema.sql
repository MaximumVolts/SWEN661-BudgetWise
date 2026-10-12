-- Pace prototype database schema (SQLite).
--
-- Stores the app user's account and preferences. The bank_* tables are prepared for a
-- bank-linking provider (e.g. Plaid) but stay empty: the prototype is not connected to
-- real banks.
--
-- Conventions:
--   * dates/times are ISO-8601 UTC text, e.g. '2026-10-09T14:30:00Z'
--   * booleans are INTEGER 0/1
--   * money is INTEGER cents (never REAL) to avoid rounding errors
--   * foreign keys require `PRAGMA foreign_keys = ON;` on every connection
--
-- Build:  sqlite3 pace.db < schema.sql

PRAGMA foreign_keys = ON;
PRAGMA user_version = 1;  -- bump when the schema changes

BEGIN;

-- ── The app user ─────────────────────────────────────────────────────────────

CREATE TABLE users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT    UNIQUE COLLATE NOCASE,
    display_name TEXT,
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- One row per user. Columns match the toggles/pickers on the Settings screen.
CREATE TABLE user_preferences (
    user_id              INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme                TEXT    NOT NULL DEFAULT 'light'
                                 CHECK (theme IN ('light', 'dark', 'system')),
    high_contrast        INTEGER NOT NULL DEFAULT 0 CHECK (high_contrast IN (0, 1)),
    chart_patterns       INTEGER NOT NULL DEFAULT 1 CHECK (chart_patterns IN (0, 1)),
    show_chart_values    INTEGER NOT NULL DEFAULT 1 CHECK (show_chart_values IN (0, 1)),
    budget_alerts        INTEGER NOT NULL DEFAULT 1 CHECK (budget_alerts IN (0, 1)),
    bill_reminder_days   INTEGER NOT NULL DEFAULT 3 CHECK (bill_reminder_days >= 0),
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

-- ── Bank data (prepared for a linking provider; empty in the prototype) ──────

-- One login at one institution (a Plaid "Item"). The provider's access token is NOT stored
-- here; credential_ref is the key it is kept under in the device's secure storage.
CREATE TABLE bank_connections (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         TEXT    NOT NULL,              -- e.g. 'plaid'
    provider_item_id TEXT    NOT NULL,
    institution_id   TEXT,
    institution_name TEXT    NOT NULL,
    credential_ref   TEXT,
    status           TEXT    NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'expired', 'revoked')),
    last_synced_at   TEXT,
    created_at       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
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
