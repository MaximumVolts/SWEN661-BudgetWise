/**
 * One of Plaid's *published* sandbox test users (https://plaid.com/docs/sandbox/test-credentials/).
 * Public documentation values that only work against Plaid's sandbox; never real bank credentials.
 */
export interface SandboxTestCredentials {
  label: string;
  username: string;
  password: string;
}

/** "Sandbox simple test credentials": basic account access to most Plaid products. */
export const SIMPLE_SANDBOX_CREDENTIALS: SandboxTestCredentials = { label: 'simple', username: 'user_good', password: 'pass_good' };

/** One bank login linked through Plaid (a Plaid "Item"). */
export interface LinkedItem {
  itemId: string;
  /** The Pace account that linked it. */
  userId: string;
  institutionId?: string | null;
  institutionName: string;
  /** Plaid access token (sandbox: `access-sandbox-…`). Secret: never shown in the UI. */
  accessToken: string;
  sandboxCredentialsLabel: string;
  linkedAt: Date;
}

/** One account inside a [LinkedItem] (checking, savings, credit card…). */
export interface LinkedBankAccount {
  accountId: string;
  itemId: string;
  name: string;
  /** Last digits of the account number, e.g. "0000". */
  mask?: string | null;
  /** depository, credit, loan, investment, other */
  type: string;
  /** checking, savings, credit card… */
  subtype?: string | null;
  currentBalance?: number | null;
  availableBalance?: number | null;
  currency?: string | null;
}

/** A linked bank as shown to the user (e.g. on Profile). No tokens or account numbers. */
export interface BankConnection {
  itemId: string;
  institutionName: string;
  accountCount: number;
  /** e.g. "Oct 12". */
  linkedOnLabel: string;
  /** Always true in this prototype: only Plaid Sandbox test banks can be linked. */
  isSandbox: boolean;
}

/** One of Plaid's sandbox test banks that can be linked (Accounts → Add an account). */
export interface SandboxInstitution {
  /** Plaid's institution id, e.g. "ins_109508". */
  id: string;
  name: string;
  /** Already connected for the signed-in user (each test bank can be linked once). */
  isLinked: boolean;
}
