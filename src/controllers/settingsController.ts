import { BILL_REMINDERS, type BillReminder } from '../models/userPreferences';
import { useAppNavigator } from '../navigation/appNavigator';
import type { ReminderChoiceResult } from '../services/billReminderService';
import { useDialogs } from '../state/DialogContext';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useStateFor } from '../utils/useStateFor';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

const NOTIFICATIONS_OFF =
  "Notifications are turned off for Pace, so reminders will only show in the app. You can turn them on in your phone's settings.";

/** What to tell the user after they choose when to be reminded. */
const REMINDER_NOTICE: Record<Exclude<ReminderChoiceResult, 'unchanged'>, (r: BillReminder) => string> = {
  off: () => 'Bill reminders off',
  on: (r) => `Bill reminders: ${r.label.toLowerCase()}`,
  blocked: () => NOTIFICATIONS_OFF,
};

/** A setting with an on / off switch. */
export type SettingToggle = 'highContrast' | 'colorblindMode' | 'showChartValues' | 'budgetAlerts';

/** 15 - Settings: profile, accounts & data, display, notifications (bill reminders), sign out. */
export function useSettingsController() {
  const { settings, reminders, auth } = useServices();
  const { signOut } = useSession();
  const nav = useAppNavigator();
  const { confirm, choose } = useDialogs();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => settings.load(), [settings], [settings.changes]);
  // Changes show at once (optimistically); replaced whenever the settings reload.
  const [data, setData] = useStateFor(state.data, state.data);

  /** Optimistic toggle: shows the new value at once, puts it back if saving fails. */
  const toggle = async (key: SettingToggle, value: boolean) => {
    if (!data) return;
    const before = data;
    setData({ ...data, [key]: value });
    const save = {
      highContrast: () => settings.setHighContrast(value),
      colorblindMode: () => settings.setColorblindMode(value),
      showChartValues: () => settings.setShowChartValues(value),
      budgetAlerts: () => settings.setBudgetAlerts(value),
    }[key];
    if (!(await perform(save))) return setData(before);
    if (key === 'colorblindMode') {
      notify(value ? 'Colorblind mode on: status uses blue and orange, with shapes and patterns' : 'Colorblind mode off');
    }
  };

  /** When bill reminders come. BillReminderService saves the choice and asks for notification permission. */
  const pickReminder = async () => {
    if (!data) return;
    const id = await choose({
      title: 'Remind me about bills',
      subtitle: 'As a notification on this phone at 9 AM, and in Notifications.',
      options: BILL_REMINDERS.map((r) => ({ id: r.id, label: r.label })),
      selectedId: data.billReminder.id,
    });
    const picked = BILL_REMINDERS.find((r) => r.id === id);
    if (!picked) return;
    let result: ReminderChoiceResult | undefined;
    if (!(await perform(async () => (result = await reminders.choose(picked))))) return;
    const outcome = result as ReminderChoiceResult;
    if (outcome === 'unchanged') return;
    setData({ ...data, billReminder: picked });
    notify(REMINDER_NOTICE[outcome](picked));
  };

  const sendTestReminder = async () => {
    let result: string | undefined;
    if (!(await perform(async () => (result = await reminders.sendTest())))) return;
    notify(result === 'sent' ? 'Test reminder sent. Check your notifications.' : NOTIFICATIONS_OFF);
  };

  const deleteAccount = async () => {
    if (!(await confirm({ title: 'Delete account?', message: 'This permanently deletes your account and data. This can’t be undone.', action: 'Delete' })))
      return;
    await perform(() => auth.deleteAccount());
  };

  return {
    state,
    reload,
    /** The settings as shown (with any change not saved yet). */
    data,
    toggle,
    pickReminder,
    sendTestReminder,
    pickTheme: () => notify('Theme picker is not implemented yet.'),
    signOut: () => perform(signOut),
    deleteAccount,
    close: nav.back,
    openProfile: nav.openProfile,
    openAccounts: nav.openAccounts,
    openBudgetCategories: nav.openManageBudgets,
    openStatements: nav.openStatements,
  };
}

export type SettingsController = ReturnType<typeof useSettingsController>;
