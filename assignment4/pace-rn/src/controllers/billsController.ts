import type { RecurringItem } from '../models/bill';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';
import { useRecurringActions } from './useRecurringActions';

/**
 * 11 / 12 - Bills: upcoming payments, and everything recurring (subscriptions and bills).
 * [view]: which tab is showing (it's part of the route, so other screens can open either).
 */
export function useBillsController(view?: string) {
  const { bills, bankLink } = useServices();
  const nav = useAppNavigator();
  const { openMenu } = useRecurringActions();
  const tab = view === 'recurring' ? 1 : 0;
  const { state, reload } = useAsyncData(
    async () => ({ upcoming: await bills.getUpcoming(), recurring: await bills.getRecurring() }),
    [bills],
    [bills.changes, bankLink.dataUpdates],
  );

  return {
    state,
    reload,
    tab,
    selectTab: (i: number) => nav.showBillsView(i === 1 ? 'recurring' : 'upcoming'),
    addBill: () => nav.openBillForm(),
    openBill: nav.openBill,
    /** The item's menu, with the actions BillService allows for it. */
    openMenu: (item: RecurringItem) => openMenu(item.name, item.id, bills.actionsFor(item)),
  };
}

export type BillsController = ReturnType<typeof useBillsController>;
