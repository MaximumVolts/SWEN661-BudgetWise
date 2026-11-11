import type { BankTransaction, RecurringStream } from '../models/bankData';
import type { LinkedBankAccount, SandboxTestCredentials } from '../models/linkedBank';
import { AppException } from '../models/appException';
import { isComplete, NO_PLAID_KEYS, type PlaidKeys } from '../models/plaidKeys';
import { parseIsoDate } from '../utils/calendar';
import type { PlaidApi } from './plaidApi';

export const SANDBOX_HOST = 'sandbox.plaid.com';

const UNREACHABLE = "Couldn't reach Plaid's test service. Check your internet connection and try again.";
const FAILED = "Plaid's test service couldn't link the account. Please try again.";
const NOT_CONFIGURED = 'Add your Plaid sandbox keys in Profile to connect a bank.';
const KEYS_REJECTED = "Plaid didn't accept your sandbox keys. Check the client ID and sandbox secret in Profile.";

type Json = Record<string, any>;

/** The fetch Pace uses (injectable for tests). */
export type Fetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{
  status: number;
  text(): Promise<string>;
}>;

/**
 * [PlaidApi] against Plaid's **Sandbox** environment only (https://plaid.com/docs/api/sandbox/).
 *
 * Sandbox is enforced, not configured: the host is a constant with no way to override it, every
 * request is checked against it before sending, and tokens Plaid returns must be sandbox tokens
 * (`public-sandbox-…`, `access-sandbox-…`) or the call fails.
 */
export class SandboxPlaidApi implements PlaidApi {
  private readonly fetch: Fetch;
  private readonly keys: () => Promise<PlaidKeys>;

  /**
   * [keys] supplies the signed-in user's Plaid sandbox keys for each request. Without it, every
   * request fails asking for keys.
   */
  constructor(options: { fetch?: Fetch; keys?: () => Promise<PlaidKeys> } = {}) {
    this.fetch = options.fetch ?? ((url, init) => fetch(url, init));
    this.keys = options.keys ?? (async () => NO_PLAID_KEYS);
  }

  async createSandboxPublicToken(args: { institutionId: string; products: string[]; credentials: SandboxTestCredentials }) {
    const j = await this.post('/sandbox/public_token/create', {
      institution_id: args.institutionId,
      initial_products: args.products,
      options: { override_username: args.credentials.username, override_password: args.credentials.password },
    });
    return sandboxToken(j.public_token, 'public-sandbox-');
  }

  async exchangePublicToken(publicToken: string) {
    const j = await this.post('/item/public_token/exchange', { public_token: publicToken });
    return { accessToken: sandboxToken(j.access_token, 'access-sandbox-'), itemId: String(j.item_id) };
  }

  async getAccounts(args: { accessToken: string; itemId: string }) {
    const j = await this.post('/accounts/get', { access_token: sandboxToken(args.accessToken, 'access-sandbox-') });
    return {
      institutionName: (j.item?.institution_name as string | undefined) ?? undefined,
      accounts: (j.accounts as Json[]).map((a) => toAccount(a, args.itemId)),
    };
  }

  async getBalances(args: { accessToken: string; itemId: string }) {
    const j = await this.post('/accounts/balance/get', { access_token: sandboxToken(args.accessToken, 'access-sandbox-') });
    return (j.accounts as Json[]).map((a) => toAccount(a, args.itemId));
  }

  async syncTransactions(accessToken: string) {
    const token = sandboxToken(accessToken, 'access-sandbox-');
    const byId = new Map<string, BankTransaction>();
    let cursor = '';
    let status: string | undefined;
    // Full sync from the start every time (a few dozen sandbox transactions): follow pages until
    // has_more is false, applying added / modified / removed.
    for (let page = 0; page < 50; page++) {
      const j = await this.post('/transactions/sync', { access_token: token, count: 500, ...(cursor ? { cursor } : {}) });
      for (const t of [...(j.added as Json[]), ...(j.modified as Json[])]) {
        const tx = toTransaction(t);
        byId.set(tx.transactionId, tx);
      }
      for (const r of j.removed as Json[]) byId.delete(r.transaction_id);
      status = (j.transactions_update_status as string | undefined) ?? status;
      cursor = (j.next_cursor as string | undefined) ?? '';
      if (j.has_more !== true) break;
    }
    // NOT_READY: nothing yet. INITIAL_UPDATE_COMPLETE: only the last ~30 days so far.
    // HISTORICAL_UPDATE_COMPLETE (or no status): everything.
    return {
      transactions: [...byId.values()],
      ready: status !== 'NOT_READY' || byId.size > 0,
      complete: status !== 'NOT_READY' && status !== 'INITIAL_UPDATE_COMPLETE',
    };
  }

  async getRecurringStreams(accessToken: string) {
    const j = await this.post(
      '/transactions/recurring/get',
      { access_token: sandboxToken(accessToken, 'access-sandbox-') },
      new Set(['PRODUCT_NOT_READY']), // returns {} while Plaid is still preparing them
    );
    if (Object.keys(j).length === 0) return { streams: [], ready: false };
    return {
      streams: [
        ...((j.inflow_streams as Json[] | undefined) ?? []).map((s) => toStream(s, true)),
        ...((j.outflow_streams as Json[] | undefined) ?? []).map((s) => toStream(s, false)),
      ],
      ready: true,
    };
  }

  async removeItem(accessToken: string) {
    // Already gone at Plaid (removed before, or a reset sandbox) counts as removed.
    await this.post(
      '/item/remove',
      { access_token: sandboxToken(accessToken, 'access-sandbox-') },
      new Set(['ITEM_NOT_FOUND', 'INVALID_ACCESS_TOKEN']),
    );
  }

  /**
   * [alreadyDoneCodes]: Plaid error codes meaning the request's goal is already met; they return
   * an empty result instead of throwing.
   */
  private async post(path: string, body: Json, alreadyDoneCodes = new Set<string>()): Promise<Json> {
    const keys = await this.keys();
    if (!isComplete(keys)) throw new AppException(NOT_CONFIGURED);
    const url = new URL(path, `https://${SANDBOX_HOST}`);
    // Defence in depth: nothing may ever leave for a non-sandbox Plaid host.
    if (url.host !== SANDBOX_HOST || url.protocol !== 'https:') throw new Error(`Refusing non-sandbox Plaid request: ${url}`);

    let response: { status: number; text(): Promise<string> };
    try {
      response = await this.fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: keys.clientId, secret: keys.sandboxSecret, ...body }),
      });
    } catch (e) {
      throw new AppException(UNREACHABLE, { cause: e });
    }

    let json: Json;
    try {
      json = JSON.parse(await response.text());
    } catch (e) {
      throw new AppException(FAILED, { cause: e });
    }
    if (response.status !== 200) {
      // Plaid errors: {error_type, error_code, error_message, display_message, request_id}.
      const code = json.error_code as string | undefined;
      if (code && alreadyDoneCodes.has(code)) return {};
      const message = (json.display_message as string | undefined) ?? (code === 'INVALID_API_KEYS' ? KEYS_REJECTED : FAILED);
      throw new AppException(message, { cause: `${path} → ${response.status} ${code}: ${json.error_message}` });
    }
    return json;
  }
}

/** [value] if it is a sandbox token with [prefix]; otherwise fails closed. */
function sandboxToken(value: unknown, prefix: string): string {
  if (typeof value === 'string' && value.startsWith(prefix)) return value;
  throw new AppException(FAILED, { cause: 'Plaid returned a non-sandbox token' });
}

function toAccount(a: Json, itemId: string): LinkedBankAccount {
  const balances: Json = a.balances ?? {};
  return {
    accountId: a.account_id,
    itemId,
    name: a.name ?? a.official_name ?? 'Account',
    mask: a.mask ?? null,
    type: a.type ?? 'other',
    subtype: a.subtype ?? null,
    currentBalance: typeof balances.current === 'number' ? balances.current : null,
    availableBalance: typeof balances.available === 'number' ? balances.available : null,
    currency: balances.iso_currency_code ?? null,
  };
}

function toTransaction(t: Json): BankTransaction {
  return {
    transactionId: t.transaction_id,
    accountId: t.account_id,
    amount: Number(t.amount),
    date: parseIsoDate(t.date)!,
    name: t.name ?? '',
    merchantName: t.merchant_name ?? null,
    pending: t.pending === true,
    categoryPrimary: t.personal_finance_category?.primary ?? null,
  };
}

function toStream(s: Json, inflow: boolean): RecurringStream {
  const amountOf = (v: Json | undefined) => Math.abs(Number(v?.amount ?? 0));
  return {
    streamId: s.stream_id,
    accountId: s.account_id,
    description: s.description ?? '',
    merchantName: s.merchant_name ?? null,
    frequency: s.frequency ?? 'UNKNOWN',
    averageAmount: amountOf(s.average_amount),
    lastAmount: amountOf(s.last_amount),
    lastDate: parseIsoDate(s.last_date) ?? null,
    nextDate: parseIsoDate(s.predicted_next_date) ?? null,
    isActive: s.is_active === true,
    isInflow: inflow,
    categoryPrimary: s.personal_finance_category?.primary ?? null,
    transactionIds: (s.transaction_ids as string[] | undefined) ?? [],
  };
}
