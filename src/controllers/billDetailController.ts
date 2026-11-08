import type { RecurringAction } from '../models/recurring';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';
import { useRecurringActions } from './useRecurringActions';

/**
 * One bill or subscription: what it costs, when it's next due, where it comes from, price changes,
 * its payments, and actions (mark paid, pause / resume, edit / delete for ones the user added).
 */
export function useBillDetailController(id: string) {
  const { bills, bankLink } = useServices();
  const nav = useAppNavigator();
  const { state, reload } = useAsyncData(() => bills.getDetail(id), [bills, id], [bills.changes, bankLink.dataUpdates]);
  // Once it's deleted there's nothing to show here.
  const { run } = useRecurringActions(nav.back);

  return {
    state,
    reload,
    back: nav.back,
    /** Carries out [action] on the bill being shown. */
    act: (action: RecurringAction) => state.data && run(action, state.data.id, state.data.name),
    openTransaction: nav.openTransaction,
  };
}

export type BillDetailController = ReturnType<typeof useBillDetailController>;
