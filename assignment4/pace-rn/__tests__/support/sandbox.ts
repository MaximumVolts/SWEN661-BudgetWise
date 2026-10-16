// Shared test harness: Plaid sandbox replay + the app's real services on an in-process database.
import { readFileSync } from 'fs';
import { join } from 'path';
import { FieldValidationException } from '@/models/appException';
import type { FlowStep } from '@/models/navigation';
import { InMemoryDeviceNotifications } from '@/repositories/deviceNotifications';
import type { Fetch } from '@/repositories/sandboxPlaidApi';
import { InMemoryVault } from '@/repositories/secretVault';
import { InMemoryStatementSaver } from '@/repositories/statementSaver';
import type { BankDataRepository } from '@/repositories/bankDataRepository';
import { type AppServices, createApp } from '@/services/appServices';
import type { AuthService } from '@/services/authService';
import { PasswordHasher } from '@/services/passwordHasher';
import { memoryDatabase } from './memoryDatabase';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Sandbox keys in Plaid's format, for test accounts (requests are replayed, never sent). */
export const TEST_PLAID_CLIENT_ID = '0123456789abcdef01234567';
export const TEST_PLAID_SECRET = '0123456789abcdef0123456789abcd';

/** The fixtures were captured from Plaid's sandbox on 2026-10-12, so tests use that date as "today". */
export const SANDBOX_TODAY = new Date(2026, 9, 12, 9);

const fixture = (name: string) => readFileSync(join(__dirname, '..', 'fixtures', 'plaid_sandbox', `${name}.json`), 'utf8');

/** Replays real responses captured from Plaid's sandbox (__tests__/fixtures/plaid_sandbox). */
export class SandboxReplay {
  readonly requests: { url: URL; body: Json }[] = [];
  /** Items linked so far; each link gets its own item id, as at Plaid. */
  private linked = 0;
  transactionsReady = true;
  /** False: Plaid has only sent its first batch (the last ~30 days), like right after linking. */
  historyReady = true;
  /** Endpoint path -> a canned reply instead of the normal one (e.g. a Plaid error). */
  readonly overrides = new Map<string, { status: number; body: Json }>();

  /** The first batch Plaid sends after linking: transactions from the last 30 days only. */
  private static initialBatch(): string {
    const j = JSON.parse(fixture('transactions_sync')) as Json;
    const cutoff = new Date(SANDBOX_TODAY.getTime() - 30 * 86_400_000);
    j.added = (j.added as Json[]).filter((t) => new Date(`${t.date}T00:00:00`) >= cutoff);
    j.transactions_update_status = 'INITIAL_UPDATE_COMPLETE';
    return JSON.stringify(j);
  }

  readonly fetch: Fetch = async (url, init) => {
    const u = new URL(url);
    const body = JSON.parse(init.body) as Json;
    this.requests.push({ url: u, body });
    if (u.host !== 'sandbox.plaid.com' || u.protocol !== 'https:') throw new Error(`Non-sandbox request: ${url}`);
    const respond = (status: number, text: string) => ({ status, text: async () => text });
    const override = this.overrides.get(u.pathname);
    if (override) return respond(override.status, JSON.stringify(override.body));
    // Linking a bank: Plaid's sandbox shortcut, then the token exchange.
    switch (u.pathname) {
      case '/sandbox/public_token/create':
        return respond(200, JSON.stringify({ public_token: 'public-sandbox-test', request_id: 'r1' }));
      case '/item/public_token/exchange':
        if (body.public_token !== 'public-sandbox-test') throw new Error('Wrong public token');
        return respond(200, JSON.stringify({ access_token: 'access-sandbox-test', item_id: `item-linked-${++this.linked}`, request_id: 'r2' }));
    }
    if (body.access_token !== 'access-sandbox-test') throw new Error(`Missing/wrong access token for ${u.pathname}`);
    switch (u.pathname) {
      case '/accounts/get':
      case '/accounts/balance/get':
        return respond(200, fixture('accounts_balance_get'));
      case '/item/remove':
        return respond(200, JSON.stringify({ request_id: 'r3' }));
      case '/transactions/sync':
        return this.transactionsReady
          ? respond(200, this.historyReady ? fixture('transactions_sync') : SandboxReplay.initialBatch())
          : respond(
              200,
              JSON.stringify({
                added: [], modified: [], removed: [], accounts: [],
                has_more: false, next_cursor: '', transactions_update_status: 'NOT_READY',
              }),
            );
      case '/transactions/recurring/get':
        return this.transactionsReady
          ? respond(200, fixture('transactions_recurring_get'))
          : respond(400, JSON.stringify({ error_type: 'ITEM_ERROR', error_code: 'PRODUCT_NOT_READY' }));
      default:
        return respond(404, JSON.stringify({ error_code: 'NOT_FOUND' }));
    }
  };

  calls(path: string) {
    return this.requests.filter((r) => r.url.pathname === path).length;
  }
}

/** Creates (and signs in) the test user Ada, password "secret123", security answer "Rex". */
export const createAda = (auth: AuthService, username = 'ada'): Promise<FlowStep> =>
  auth.createAccount({
    name: 'Ada',
    username,
    password: 'secret123',
    confirmPassword: 'secret123',
    securityQuestion: 'What was the name of your first pet?',
    securityAnswer: 'Rex',
    plaidClientId: TEST_PLAID_CLIENT_ID,
    plaidSecret: TEST_PLAID_SECRET,
  });

/** The field errors [body] fails with (it must throw a FieldValidationException). */
export async function fieldErrors(body: () => Promise<unknown>): Promise<Record<string, string>> {
  try {
    await body();
  } catch (e) {
    if (e instanceof FieldValidationException) return e.fieldErrors;
    throw e;
  }
  throw new Error('Expected a FieldValidationException');
}

export interface SandboxApp {
  services: AppServices;
  /** The shared bank data repository behind the services (to inspect or stop its re-checks). */
  bankData: BankDataRepository;
  plaid: SandboxReplay;
  /** "Today" for the services; change [clock.today] to move time. */
  clock: { today: Date };
  notifications: InMemoryDeviceNotifications;
  saver: InMemoryStatementSaver;
  vault: InMemoryVault;
  database: Awaited<ReturnType<typeof memoryDatabase>>;
  /** Ada's id (undefined with [signIn] false). */
  userId?: string;
}

/**
 * The app's real services (SQLite on sql.js, Plaid replayed), with Ada signed up and First
 * Platypus Bank linked through the sandbox flow. [linkBank] false: no bank; [signIn] false: nobody.
 */
export async function sandboxServices(
  opts: { plaid?: SandboxReplay; today?: Date; linkBank?: boolean; signIn?: boolean; budgets?: Record<string, number> } = {},
): Promise<SandboxApp> {
  const plaid = opts.plaid ?? new SandboxReplay();
  const clock = { today: opts.today ?? SANDBOX_TODAY };
  const database = await memoryDatabase();
  const notifications = new InMemoryDeviceNotifications();
  const saver = new InMemoryStatementSaver();
  const vault = new InMemoryVault();
  const { services, repositories } = createApp({
    database: database.database,
    fetch: plaid.fetch,
    vault,
    hasher: new PasswordHasher(1000),
    deviceNotifications: notifications,
    statementSaver: saver,
    bankDataTiming: { retryEveryMs: 20 },
    now: () => clock.today,
  });
  const app: SandboxApp = { services, bankData: repositories.bankData, plaid, clock, notifications, saver, vault, database };
  if (opts.signIn === false) return app;
  await createAda(services.auth);
  app.userId = services.auth.currentUserId;
  if (opts.linkBank !== false) {
    const ready = plaid.transactionsReady;
    await services.bankLink.startLink('ins_109508'); // First Platypus Bank
    plaid.transactionsReady = ready;
  }
  for (const [category, limit] of Object.entries(opts.budgets ?? {})) await services.budgets.createBudget(category, String(limit));
  return app;
}

/** The budgets the Flutter suite's test user has (they apply to every month). */
export const TEST_BUDGETS = { food: 400, shopping: 600, transport: 150, travel: 600, utilities: 1200, personal: 120 };
