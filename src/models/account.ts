/** Linked bank accounts, as shown on Accounts. */
export interface LinkedAccount {
  id: string;
  name: string;
  /** "Checking ••0000" */
  subtitle: string;
  balance: number;
  iconKey: string;
  /** "Plaid Sandbox · updated just now" */
  syncLabel: string;
}

export interface AccountGroup {
  title: string;
  institution: string;
  accounts: LinkedAccount[];
}

/** Totals across every linked account (desktop's summary cards). */
export interface AccountsSummary {
  /** What the cash accounts (checking, savings…) hold. */
  cash: number;
  cashAccounts: number;
  /** What's owed on credit cards and loans, as a positive amount. */
  owed: number;
  owedAccounts: number;
}

export interface AccountsData {
  groups: AccountGroup[];
  /** Absent when no bank is linked. */
  summary?: AccountsSummary;
  /** Shown instead of the list when [groups] is empty (e.g. "No bank connected yet…"). */
  emptyMessage?: string;
}
