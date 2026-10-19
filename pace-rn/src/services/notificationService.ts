import { BUDGET_STATUS_LABEL, remaining } from '../models/budget';
import { formatMoney } from '../models/money';
import type { DeepLinkTarget } from '../models/navigation';
import type { NotificationItem, NotificationsData } from '../models/notification';
import { DEFAULT_PREFERENCES, type UserPreferences } from '../models/userPreferences';
import type { BillService } from './billService';
import type { BudgetService } from './budgetService';
import { dateOnly, daysBetween } from '../utils/calendar';

/**
 * BUSINESS RULES: which events create notifications (overdue, over budget, near limit, reminders),
 * "new" vs read, filter semantics, and what each notification points at.
 */
export interface NotificationService {
  /** [filterIndex] indexes NotificationsData.filterLabels (All / Bills / Budgets / Goals). */
  getNotifications(filterIndex: number): Promise<NotificationsData>;
  markAllRead(): Promise<void>;
  /** Runs the primary inline action of a notification (e.g. "Mark as paid"). */
  runPrimaryAction(notificationId: string): Promise<void>;
  /** The user opened a notification: marks it read and returns where it leads (undefined = nowhere). */
  open(notificationId: string): Promise<DeepLinkTarget | undefined>;
}

const FILTERS = ['Bills', 'Budgets', 'Goals'];

/**
 * [NotificationService] raising alerts from the linked banks' data in Plaid (sandbox).
 * BUSINESS RULES: overdue bills; bills due within the user's reminder window (3 days unless they
 * chose otherwise; none when off); this month's budgets that are over or near their limit (as
 * BudgetService rates them). "Read" state is kept for this session.
 */
export class PlaidNotificationService implements NotificationService {
  private readonly read = new Set<string>();
  private readonly preferences: () => Promise<UserPreferences>;
  private readonly now: () => Date;

  /** [preferences]: the signed-in user's (SettingsService.preferences), for their reminder setting. */
  constructor(
    private readonly bills: BillService,
    private readonly budgets: BudgetService,
    opts: { preferences?: () => Promise<UserPreferences>; now?: () => Date } = {},
  ) {
    this.preferences = opts.preferences ?? (async () => DEFAULT_PREFERENCES);
    this.now = opts.now ?? (() => new Date());
  }

  private async all(): Promise<NotificationItem[]> {
    const today = dateOnly(this.now());
    const items: NotificationItem[] = [];
    const isNew = (id: string) => !this.read.has(id);
    const reminderDays = (await this.preferences()).billReminder.days; // null: reminders off
    for (const { bill, due } of await this.bills.upcomingWithDates()) {
      const days = daysBetween(today, due);
      if (bill.isOverdue) {
        const id = `overdue-${bill.id}`;
        items.push({
          id,
          kind: 'overdue',
          isNew: isNew(id),
          metaLabel: 'Bill overdue',
          title: `${bill.title} is overdue`,
          body: `${formatMoney(bill.amount)} · ${bill.subtitle}.`,
          primaryActionLabel: 'Mark as paid',
          secondaryActionLabel: 'View bill',
        });
      } else if (reminderDays !== null && days <= reminderDays) {
        const id = `reminder-${bill.id}`;
        items.push({
          id,
          kind: 'reminder',
          isNew: isNew(id),
          metaLabel: 'Bill reminder',
          title: `${bill.title} is due ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`,
          body: `${formatMoney(bill.amount)} · ${bill.subtitle}.`,
        });
      }
    }
    // This month's budgets; whether one is over / near its limit is the budget service's rule.
    for (const c of (await this.budgets.getOverview('')).categories) {
      if (c.status === 'over') {
        const id = `over-${c.id}`;
        items.push({
          id,
          kind: 'overBudget',
          isNew: isNew(id),
          metaLabel: BUDGET_STATUS_LABEL.over,
          title: `${c.name} is ${formatMoney(-remaining(c))} over`,
          body: `You've spent ${formatMoney(c.spent)} of your ${formatMoney(c.limit, 0)} limit.`,
        });
      } else if (c.status === 'nearLimit') {
        const id = `near-${c.id}`;
        items.push({
          id,
          kind: 'nearLimit',
          isNew: isNew(id),
          metaLabel: BUDGET_STATUS_LABEL.nearLimit,
          title: `${c.name} is near its limit`,
          body: `${formatMoney(remaining(c))} left this month.`,
        });
      }
    }
    return items;
  }

  async getNotifications(filterIndex: number): Promise<NotificationsData> {
    const all = await this.all();
    const unread = all.filter((n) => n.isNew).length;
    const items =
      filterIndex === 1
        ? all.filter((n) => n.kind === 'overdue' || n.kind === 'reminder')
        : filterIndex === 2
          ? all.filter((n) => n.kind === 'overBudget' || n.kind === 'nearLimit')
          : filterIndex === 3
            ? []
            : all;
    return { filterLabels: [`All · ${unread} new`, ...FILTERS], selectedFilter: filterIndex, items };
  }

  async markAllRead() {
    for (const n of await this.all()) this.read.add(n.id);
  }

  /** "Mark as paid" on an overdue bill. */
  async runPrimaryAction(notificationId: string) {
    if (notificationId.startsWith('overdue-')) await this.bills.markPaid(notificationId.slice('overdue-'.length));
    this.read.add(notificationId);
  }

  async open(notificationId: string): Promise<DeepLinkTarget | undefined> {
    this.read.add(notificationId);
    const dash = notificationId.indexOf('-');
    const kind = notificationId.slice(0, dash);
    const id = notificationId.slice(dash + 1);
    if (kind === 'overdue' || kind === 'reminder') return { kind: 'bill', id }; // that bill's details
    if (kind === 'over' || kind === 'near') return { kind: 'budgetCategory', id };
    return undefined;
  }
}
