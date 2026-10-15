export const DATABASE_VERSION = 1;

export const schemaSql = `
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE COLLATE NOCASE,
  display_name TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  password_hash TEXT,
  security_question TEXT,
  security_answer_hash TEXT
);

CREATE TABLE user_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  high_contrast INTEGER NOT NULL DEFAULT 0 CHECK (high_contrast IN (0, 1)),
  colorblind_mode INTEGER NOT NULL DEFAULT 0 CHECK (colorblind_mode IN (0, 1)),
  show_chart_values INTEGER NOT NULL DEFAULT 1 CHECK (show_chart_values IN (0, 1)),
  budget_alerts INTEGER NOT NULL DEFAULT 1 CHECK (budget_alerts IN (0, 1)),
  bill_reminder_days INTEGER DEFAULT 3 CHECK (bill_reminder_days IS NULL OR bill_reminder_days >= 0),
  income_type TEXT,
  onboarding_completed INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_completed IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE user_priorities (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority_id TEXT NOT NULL,
  PRIMARY KEY (user_id, priority_id)
) WITHOUT ROWID;

CREATE TRIGGER users_default_preferences
AFTER INSERT ON users
BEGIN
  INSERT INTO user_preferences (user_id) VALUES (NEW.id);
END;

CREATE TRIGGER user_preferences_touch
AFTER UPDATE ON user_preferences
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE user_preferences SET updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
  WHERE user_id = NEW.user_id;
END;

CREATE TABLE budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (user_id, category_id)
);
CREATE INDEX idx_budgets_user ON budgets(user_id);

CREATE TABLE recurring_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ANNUALLY')),
  first_due TEXT NOT NULL CHECK (first_due GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  category_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('subscription', 'bill')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX idx_recurring_expenses_user ON recurring_expenses(user_id);

CREATE TABLE savings_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  icon_key TEXT NOT NULL DEFAULT 'savings',
  saved_cents INTEGER NOT NULL DEFAULT 0 CHECK (saved_cents >= 0),
  target_cents INTEGER NOT NULL CHECK (target_cents > 0),
  target_date TEXT CHECK (target_date IS NULL OR target_date GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX idx_savings_goals_user ON savings_goals(user_id);

CREATE TABLE goal_contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  goal_id INTEGER NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
  date_label TEXT NOT NULL,
  amount_cents INTEGER NOT NULL
);
CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id);

CREATE TABLE expected_incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  expected_on TEXT NOT NULL CHECK (expected_on GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX idx_expected_incomes_user ON expected_incomes(user_id);

CREATE TABLE plaid_sandbox_test_credentials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  description TEXT NOT NULL,
  source_url TEXT NOT NULL DEFAULT 'https://plaid.com/docs/sandbox/test-credentials/',
  UNIQUE (username, password)
);
INSERT INTO plaid_sandbox_test_credentials (label, username, password, description)
VALUES ('simple', 'user_good', 'pass_good', 'Sandbox test credentials for basic account access.');

CREATE TABLE bank_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider = 'plaid'),
  environment TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment = 'sandbox'),
  provider_item_id TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT NOT NULL,
  sandbox_test_credentials_id INTEGER NOT NULL REFERENCES plaid_sandbox_test_credentials(id),
  credential_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (provider, provider_item_id)
);
CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);

CREATE TABLE bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connection_id INTEGER NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  provider_account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mask TEXT,
  type TEXT NOT NULL CHECK (type IN ('depository', 'credit', 'loan', 'investment', 'other')),
  subtype TEXT,
  current_balance_cents INTEGER,
  available_balance_cents INTEGER,
  currency TEXT NOT NULL DEFAULT 'USD',
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (connection_id, provider_account_id)
);
CREATE INDEX idx_bank_accounts_connection ON bank_accounts(connection_id);

CREATE TABLE bank_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  provider_transaction_id TEXT NOT NULL,
  posted_date TEXT NOT NULL,
  merchant_name TEXT,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  pending INTEGER NOT NULL DEFAULT 0 CHECK (pending IN (0, 1)),
  category_id TEXT,
  note TEXT,
  UNIQUE (account_id, provider_transaction_id)
);
CREATE INDEX idx_bank_transactions_account_date ON bank_transactions(account_id, posted_date DESC);
`;