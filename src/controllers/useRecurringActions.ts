import { useCallback } from 'react';
import type { RecurringAction } from '../models/recurring';
import { useAppNavigator } from '../navigation/appNavigator';
import { type ChoiceOption, useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';

const ACTION_OPTION: Record<RecurringAction, Omit<ChoiceOption, 'id'>> = {
  details: { label: 'View details', icon: 'info-outline' },
  markPaid: { label: 'Mark next payment as paid', icon: 'check-circle-outline' },
  pause: { label: 'Pause tracking', icon: 'pause-circle-outline' },
  resume: { label: 'Resume tracking', icon: 'play-circle-outline' },
  edit: { label: 'Edit', icon: 'edit' },
  delete: { label: 'Delete', icon: 'delete-outline', destructive: true },
};

/**
 * Shared controller logic: carries out what the user picks for a bill or subscription (from its
 * menu on Bills, or on its details page). The service decides what's allowed; this only dispatches.
 */
export function useRecurringActions(onDeleted?: () => void) {
  const { bills } = useServices();
  const nav = useAppNavigator();
  const { confirm, choose } = useDialogs();
  const perform = useAction();

  const run = useCallback(
    async (action: RecurringAction, id: string, name: string) => {
      switch (action) {
        case 'details':
          return nav.openBill(id);
        case 'markPaid':
          return perform(() => bills.markPaid(id));
        case 'pause':
        case 'resume':
          return perform(() => bills.setSubscriptionPaused(id, action === 'pause'));
        case 'edit':
          return nav.openBillForm(id);
        case 'delete':
          if (!(await confirm({ title: `Stop tracking ${name}?`, message: 'It will be deleted from Pace. Nothing changes at your bank.', action: 'Delete' })))
            return;
          if (await perform(() => bills.deleteRecurring(id))) onDeleted?.();
      }
    },
    [bills, nav, confirm, perform, onDeleted],
  );

  /** The item's menu, with the actions the service offers for it. */
  const openMenu = useCallback(
    async (name: string, id: string, actions: RecurringAction[]) => {
      const picked = await choose({ title: name, options: actions.map((a) => ({ id: a, ...ACTION_OPTION[a] })) });
      if (picked) await run(picked as RecurringAction, id, name);
    },
    [choose, run],
  );

  return { run, openMenu };
}
