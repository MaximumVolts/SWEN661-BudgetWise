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

export interface AccountsData {
  groups: AccountGroup[];
  /** Shown instead of the list when [groups] is empty (e.g. "No bank connected yet…"). */
  emptyMessage?: string;
}
