import { useState } from 'react';
import type { DeepLinkTarget } from '../models/navigation';
import type { NotificationItem } from '../models/notification';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** The filters, until the service sends its own labels. */
export const NOTIFICATION_FILTERS = ['All', 'Bills', 'Budgets', 'Goals'];

/** 14 - Notifications: alerts the services raise (overdue / due bills, budgets over or near their limit). */
export function useNotificationsController() {
  const { notifications, bills, budgets, bankLink } = useServices();
  const nav = useAppNavigator();
  const perform = useAction();
  const [filter, setFilter] = useState(0);
  const { state, reload, refresh } = useAsyncData(() => notifications.getNotifications(filter), [notifications, filter], [
    bills.changes,
    budgets.changes,
    bankLink.dataUpdates,
  ]);

  const markAllRead = async () => {
    if (await perform(() => notifications.markAllRead())) await refresh();
  };
  const runPrimary = async (n: NotificationItem) => {
    if (await perform(() => notifications.runPrimaryAction(n.id))) await refresh();
  };
  /** The service marks it read and says where it leads; this screen closes, then goes there. */
  const open = async (n: NotificationItem) => {
    let target: DeepLinkTarget | undefined;
    if (!(await perform(async () => (target = await notifications.open(n.id))))) return;
    if (!target) return refresh();
    nav.back();
    nav.openTarget(target);
  };

  return {
    state,
    reload,
    filter,
    filterLabels: state.data?.filterLabels ?? NOTIFICATION_FILTERS,
    setFilter,
    markAllRead,
    runPrimary,
    open,
    close: nav.back,
  };
}

export type NotificationsController = ReturnType<typeof useNotificationsController>;
