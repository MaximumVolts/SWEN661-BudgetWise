import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 05 - Dashboard (Home). Everything shown is derived by DashboardService; reloads when bank data, bills, budgets or cash flow change. */
export function useDashboardController() {
  const s = useServices();
  const nav = useAppNavigator();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload, refresh } = useAsyncData(() => s.dashboard.load(), [s], [
    s.bankLink.dataUpdates,
    s.bills.changes,
    s.budgets.changes,
    s.cashFlow.changes,
  ]);

  /** Fetches the latest bank data now, then shows it. */
  const sync = async () => {
    if (await perform(() => s.dashboard.sync())) await refresh();
  };

  return {
    state,
    reload,
    sync,
    paydayInfo: () => notify('Estimated from the recurring deposits your bank detected.'),
    openSettings: nav.openSettings,
    openNotifications: nav.openNotifications,
    openTransactions: () => nav.openTransactions(),
    openTransaction: nav.openTransaction,
    openAddAccount: nav.openAddAccount,
    openAccounts: nav.openAccounts,
    openBudgets: nav.openBudgets,
    openBudgetCategory: (id: string) => nav.openBudgetCategory(id),
    openBills: () => nav.openBills(),
    openBill: nav.openBill,
    openTrends: nav.openTrends,
    /** The featured trend's action: the transactions behind it (TrendService says which). */
    openTrendTransactions: (trendId: string) => nav.openTransactions(s.trends.transactionFilterFor(trendId)),
    openTool: nav.openTool,
  };
}

export type DashboardController = ReturnType<typeof useDashboardController>;
