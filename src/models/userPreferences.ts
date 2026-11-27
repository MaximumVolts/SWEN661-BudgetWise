/** When to remind the user about a bill, if at all. */
export interface BillReminder {
  id: 'off' | 'onDueDate' | 'oneDay' | 'threeDays' | 'oneWeek';
  /** Days before the due date; null = no reminders. */
  days: number | null;
  label: string;
}

export const Reminder = {
  off: { id: 'off', days: null, label: 'Off' },
  onDueDate: { id: 'onDueDate', days: 0, label: 'On the due date' },
  oneDay: { id: 'oneDay', days: 1, label: '1 day before' },
  threeDays: { id: 'threeDays', days: 3, label: '3 days before' },
  oneWeek: { id: 'oneWeek', days: 7, label: '1 week before' },
} as const satisfies Record<string, BillReminder>;

export const BILL_REMINDERS: BillReminder[] = Object.values(Reminder);

/** The option for [days] as stored (null = off); unknown values fall back to 3 days before. */
export const reminderFromDays = (days: number | null): BillReminder =>
  days === null ? Reminder.off : (BILL_REMINDERS.find((r) => r.days === days) ?? Reminder.threeDays);

/** A user's display and alert preferences (the toggles and pickers on the Settings screen). */
export interface UserPreferences {
  /** Darker text, stronger borders and outlines across the app. */
  highContrast: boolean;
  /** Colorblind mode: status also shown with shapes and patterns, in a colorblind-safe palette. */
  colorblindMode: boolean;
  showChartValues: boolean;
  budgetAlerts: boolean;
  /** When bill reminders come (in-app notifications and push notifications). */
  billReminder: BillReminder;
  /** Messages at the top of the screen stay until closed, instead of going after a while (WCAG 2.2.1). */
  keepNotices: boolean;
  /** Shortcuts that are a single key (? for the shortcuts list); off, only Ctrl/⌘ shortcuts work (WCAG 2.1.4). */
  singleKeyShortcuts: boolean;
  /** No animations: dialogs and screens appear and go without fading or sliding (WCAG 2.3.3). */
  reduceMotion: boolean;
}

/** What applies when nobody is signed in. */
export const DEFAULT_PREFERENCES: UserPreferences = {
  highContrast: false,
  colorblindMode: false,
  showChartValues: true,
  budgetAlerts: true,
  billReminder: Reminder.threeDays,
  keepNotices: false,
  singleKeyShortcuts: true,
  reduceMotion: false,
};

export const samePreferences = (a: UserPreferences, b: UserPreferences) =>
  a.highContrast === b.highContrast &&
  a.colorblindMode === b.colorblindMode &&
  a.showChartValues === b.showChartValues &&
  a.budgetAlerts === b.budgetAlerts &&
  a.billReminder.id === b.billReminder.id &&
  a.keepNotices === b.keepNotices &&
  a.singleKeyShortcuts === b.singleKeyShortcuts &&
  a.reduceMotion === b.reduceMotion;
