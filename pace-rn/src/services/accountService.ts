import type { AccountsData } from '../models/account';
import { isLinked } from '../models/bankData';
import type { LinkedBankAccount } from '../models/linkedBank';
import { BankDataService } from './bankDataService';
import { DateLabels } from '../utils/dateLabels';

/**
 * BUSINESS RULES: grouping accounts by institution, money owed shown as negative, sync freshness
 * labels.
 */
export interface AccountService {
  getAccounts(): Promise<AccountsData>;
  /** Re-fetches from the bank. */
  reconnect(): Promise<void>;
}

export const NO_BANK_MESSAGE =
  "No bank connected yet. Connect Plaid's test bank from your Profile to see your accounts here.";

/** Credit cards and loans are money owed, so they count against you. */
export const isLiability = (a: LinkedBankAccount) => a.type === 'credit' || a.type === 'loan';

export function balanceOf(a: LinkedBankAccount): number {
  const current = a.currentBalance ?? a.availableBalance ?? 0;
  return isLiability(a) ? -current : current;
}

/** e.g. "Checking ••0000" */
export function accountSubtitle(a: LinkedBankAccount): string {
  const kind = a.subtype || a.type;
  const label = kind ? kind[0].toUpperCase() + kind.slice(1) : 'Account';
  return a.mask ? `${label} ••${a.mask}` : label;
}

export function accountIcon(a: LinkedBankAccount): string {
  switch (a.type) {
    case 'depository':
      return a.subtype === 'checking' ? 'bank' : 'savings';
    case 'credit':
      return 'card';
    case 'loan':
      return a.subtype === 'mortgage' || a.subtype === 'home equity' ? 'home' : a.subtype === 'auto' ? 'car' : 'bills';
    case 'investment':
      return 'chart';
    default:
      return 'wallet';
  }
}

/** [AccountService] showing the linked banks' live balances from Plaid (sandbox): one group per bank. */
export class PlaidAccountService extends BankDataService implements AccountService {
  async getAccounts(): Promise<AccountsData> {
    const snap = await this.bankData.load();
    if (!isLinked(snap)) return { groups: [], emptyMessage: NO_BANK_MESSAGE };
    const synced = `Plaid Sandbox · updated ${DateLabels.ago(snap.fetchedAt, this.currentTime())}`;
    return {
      groups: Object.entries(snap.institutions).map(([itemId, name]) => ({
        title: name,
        institution: 'Plaid Sandbox test bank',
        accounts: snap.accounts
          .filter((a) => a.itemId === itemId)
          .map((a) => ({
            id: a.accountId,
            name: a.name,
            subtitle: accountSubtitle(a),
            balance: balanceOf(a),
            iconKey: accountIcon(a),
            syncLabel: synced,
          })),
      })),
    };
  }

  async reconnect() {
    await this.bankData.load({ refresh: true });
  }
}
