import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 04 - Accounts: the linked banks' accounts and live balances. */
export function useAccountsController() {
  const { accounts, bankLink } = useServices();
  const nav = useAppNavigator();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload, refresh } = useAsyncData(() => accounts.getAccounts(), [accounts], [bankLink.dataUpdates]);
  return {
    state,
    reload,
    back: nav.back,
    openOptions: nav.openProfile,
    openAccount: () => notify('Account details are not implemented yet.'),
    addAccount: nav.openAddAccount,
    /** Fetches the latest balances from the bank now. */
    sync: async () => {
      if (await perform(() => accounts.reconnect())) await refresh();
    },
  };
}

export type AccountsController = ReturnType<typeof useAccountsController>;
