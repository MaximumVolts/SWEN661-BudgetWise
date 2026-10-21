import { formatMoney } from '../models/money';
import { type BillReminder, type UserPreferences } from '../models/userPreferences';
import type { DeviceNotifications } from '../repositories/deviceNotifications';
import type { Subscribable } from '../utils/events';
import type { BillService } from './billService';
import { addDays, dateOnly, daysBetween, isAfter } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';

/** What happened when the user asked for a test reminder: sent, or blocked (notifications off for Pace). */
export type TestReminderResult = 'sent' | 'blocked';

/**
 * What happened when the user chose when to be reminded: nothing changed, reminders turned off,
 * on, or on but blocked (notifications are off for Pace, so they only show in the app).
 */
export type ReminderChoiceResult = 'unchanged' | 'off' | 'on' | 'blocked';

export const REMINDER_HOUR = 9;
const TEST_ID = 0;

/** "Rent is due in 3 days" / "…due tomorrow" / "…due today". */
export function reminderTitle(bill: string, daysBefore: number): string {
  if (daysBefore === 0) return `${bill} is due today`;
  if (daysBefore === 1) return `${bill} is due tomorrow`;
  return `${bill} is due in ${daysBefore} days`;
}

/**
 * Bill reminders as push notifications.
 * BUSINESS RULES: one reminder per upcoming (not overdue) bill, at 9 AM on the day the user's
 * reminder setting says (the due date, or 1, 3 or 7 days before); none when reminders are off or
 * nobody is signed in; a reminder whose time has already passed isn't sent (the in-app
 * notifications cover it); the reminders are redone whenever the bills, the reminder setting, the
 * bank data or the signed-in user change.
 */
export class BillReminderService {
  private readonly bills: BillService;
  private readonly preferences: () => Promise<UserPreferences>;
  private readonly savePreference: (reminder: BillReminder) => Promise<void>;
  private readonly isSignedIn: () => boolean;
  private readonly device: DeviceNotifications;
  private readonly changes: Subscribable<unknown>;
  private readonly now: () => Date;

  constructor(opts: {
    bills: BillService;
    preferences: () => Promise<UserPreferences>;
    /** Saves the user's reminder setting. */
    savePreference: (reminder: BillReminder) => Promise<void>;
    isSignedIn: () => boolean;
    device: DeviceNotifications;
    /** Emits when anything the reminders depend on may have changed. */
    changes: Subscribable<unknown>;
    now?: () => Date;
  }) {
    this.bills = opts.bills;
    this.preferences = opts.preferences;
    this.savePreference = opts.savePreference;
    this.isSignedIn = opts.isSignedIn;
    this.device = opts.device;
    this.changes = opts.changes;
    this.now = opts.now ?? (() => new Date());
  }

  /**
   * Keeps the phone's reminders in step from now on: reschedules at once and after every change.
   * Returns a function that stops it. A failed reschedule is retried on the next change.
   */
  keepScheduled(): () => void {
    const reschedule = () => void this.reschedule().catch(() => {});
    reschedule();
    return this.changes.subscribe(reschedule);
  }

  /**
   * The user chose when to be reminded: saves it and, when reminders are on, asks for notification
   * permission.
   */
  async choose(reminder: BillReminder): Promise<ReminderChoiceResult> {
    if ((await this.preferences()).billReminder.id === reminder.id) return 'unchanged';
    await this.savePreference(reminder);
    if (reminder.days === null) return 'off';
    return (await this.enable(reminder)) ? 'on' : 'blocked';
  }

  /**
   * Replaces the scheduled reminders with ones for the bills coming up now. Call when the bills,
   * the reminder setting or the signed-in user may have changed.
   */
  async reschedule() {
    await this.device.cancelAll();
    if (!this.isSignedIn()) return;
    const days = (await this.preferences()).billReminder.days;
    if (days === null) return;
    const now = this.now();
    let id = 1; // 0 is the test reminder
    for (const { bill, due } of await this.bills.upcomingWithDates()) {
      if (bill.isOverdue) continue;
      const day = addDays(dateOnly(due), -days);
      const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), REMINDER_HOUR);
      if (!isAfter(at, now)) continue;
      await this.device.schedule({
        id: id++,
        title: reminderTitle(bill.title, days),
        body: `${formatMoney(bill.amount)} · due ${DateLabels.short(due)}`,
        at,
      });
    }
  }

  /** Asks for permission if needed, then shows a sample reminder right away (for the next bill if any). */
  async sendTest(): Promise<TestReminderResult> {
    if (!(await this.device.requestPermission())) return 'blocked';
    const next = (await this.bills.upcomingWithDates()).find((u) => !u.bill.isOverdue);
    const today = dateOnly(this.now());
    await this.device.show({
      id: TEST_ID,
      title: next ? `Test: ${reminderTitle(next.bill.title, daysBetween(today, dateOnly(next.due)))}` : 'Bill reminders are working',
      body: next ? `${formatMoney(next.bill.amount)} · due ${DateLabels.short(next.due)}` : "You'll be reminded before your bills are due.",
    });
    return 'sent';
  }

  /**
   * Turning reminders on: asks for notification permission. False when it's blocked, so the user
   * can be told reminders will only show inside Pace.
   */
  async enable(reminder: BillReminder): Promise<boolean> {
    return reminder.days === null || this.device.requestPermission();
  }
}
