import { AppException } from '@/models/appException';
import type { BillItem } from '@/models/bill';
import { CHOOSABLE_FREQUENCIES, Frequency } from '@/models/recurring';
import { DEFAULT_PREFERENCES, Reminder, type UserPreferences } from '@/models/userPreferences';
import { InMemoryDeviceNotifications } from '@/repositories/deviceNotifications';
import { InMemoryGoalRepository } from '@/repositories/goalRepository';
import { BillReminderService } from '@/services/billReminderService';
import type { BillService, RecurringInput, UpcomingBill } from '@/services/billService';
import type { BudgetService } from '@/services/budgetService';
import { parseLimit } from '@/services/budgetService';
import { RepositoryGoalService } from '@/services/goalService';
import { PlaidNotificationService } from '@/services/notificationService';
import { RecurringSchedule } from '@/services/recurringSchedule';
import { Emitter } from '@/utils/events';
import { fieldErrors, type SandboxApp, sandboxServices } from './support/sandbox';
jest.setTimeout(30000);
const OCT_12 = new Date(2026, 9, 12, 9);

describe('bill reminders', () => {
  const bill = (name: string, due: Date, overdue = false): UpcomingBill => ({
    bill: { id: name, title: name, subtitle: 'Monthly', amount: 50, iconKey: 'bills', isOverdue: overdue } satisfies BillItem,
    due,
  });
  let upcoming: UpcomingBill[];
  let prefs: UserPreferences;
  let signedIn: boolean;
  let device: InMemoryDeviceNotifications;
  let reminders: BillReminderService;
  let changes: Emitter<unknown>;
  // Bills due on fixed dates (the only part of BillService reminders use).
  const bills = { upcomingWithDates: async () => upcoming } as unknown as BillService;
  const noBudgets = { getOverview: async () => ({ summary: {}, categories: [] }) } as unknown as BudgetService;

  beforeEach(() => {
    upcoming = [
      bill('Late fee', new Date(2026, 9, 1), true),
      bill('Phone', new Date(2026, 9, 14)), // 3 days before is Oct 11: already passed
      bill('Rent', new Date(2026, 9, 20)),
      bill('Gym', new Date(2026, 10, 3)),
    ];
    prefs = DEFAULT_PREFERENCES;
    signedIn = true;
    device = new InMemoryDeviceNotifications();
    changes = new Emitter<unknown>();
    reminders = new BillReminderService({
      bills,
      preferences: async () => prefs,
      savePreference: async (billReminder) => void (prefs = { ...prefs, billReminder }),
      isSignedIn: () => signedIn,
      device,
      changes,
      now: () => OCT_12,
    });
  });

  test('one reminder per upcoming bill, at 9 AM the chosen number of days before', async () => {
    await reminders.reschedule();
    expect(device.scheduled.map((n) => [n.title, n.at])).toEqual([
      ['Rent is due in 3 days', new Date(2026, 9, 17, 9)],
      ['Gym is due in 3 days', new Date(2026, 9, 31, 9)],
    ]); // not the overdue fee, nor Phone (its reminder time has passed)
    expect(device.scheduled[0].body).toBe('$50.00 · due Oct 20');
  });

  test('follows the setting: on the due date, a week before, or off', async () => {
    prefs = { ...DEFAULT_PREFERENCES, billReminder: Reminder.onDueDate };
    await reminders.reschedule();
    expect(device.scheduled.map((n) => n.title)).toEqual(['Phone is due today', 'Rent is due today', 'Gym is due today']);
    prefs = { ...DEFAULT_PREFERENCES, billReminder: Reminder.oneWeek };
    await reminders.reschedule();
    expect(device.scheduled.map((n) => n.at)).toEqual([new Date(2026, 9, 13, 9), new Date(2026, 9, 27, 9)]);
    prefs = { ...DEFAULT_PREFERENCES, billReminder: Reminder.off };
    await reminders.reschedule();
    expect(device.scheduled).toEqual([]);
  });

  test('rescheduling replaces the old reminders; signing out clears them', async () => {
    await reminders.reschedule();
    upcoming = [bill('Rent', new Date(2026, 9, 20))];
    await reminders.reschedule();
    expect(device.scheduled).toHaveLength(1);
    signedIn = false;
    await reminders.reschedule();
    expect(device.scheduled).toEqual([]);
  });

  test('the test reminder shows the next bill right away', async () => {
    expect(await reminders.sendTest()).toBe('sent');
    expect(device.shown).toEqual([{ id: 0, title: 'Test: Phone is due in 2 days', body: '$50.00 · due Oct 14' }]);
  });

  test('with no bills the test reminder still shows one', async () => {
    upcoming = [];
    await reminders.sendTest();
    expect(device.shown[0].title).toBe('Bill reminders are working');
  });

  test('when notifications are blocked it says so and shows nothing', async () => {
    device.permitted = false;
    expect(await reminders.sendTest()).toBe('blocked');
    expect(device.shown).toEqual([]);
    expect(await reminders.enable(Reminder.threeDays)).toBe(false);
    expect(await reminders.enable(Reminder.off)).toBe(true); // turning off needs no permission
  });

  test('choosing a reminder saves it and asks for permission when it turns them on', async () => {
    expect(await reminders.choose(prefs.billReminder)).toBe('unchanged');
    expect(await reminders.choose(Reminder.oneWeek)).toBe('on');
    expect(prefs.billReminder).toBe(Reminder.oneWeek);
    expect(await reminders.choose(Reminder.off)).toBe('off');
    expect(prefs.billReminder).toBe(Reminder.off);
    device.permitted = false;
    expect(await reminders.choose(Reminder.oneDay)).toBe('blocked');
    expect(prefs.billReminder).toBe(Reminder.oneDay); // kept: reminders still show in the app
  });

  test('kept in step: rescheduled at once and after every change, until stopped', async () => {
    const stop = reminders.keepScheduled();
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(device.scheduled).toHaveLength(2);
    upcoming = [];
    changes.emit(undefined);
    await new Promise((r) => setTimeout(r, 0));
    expect(device.scheduled).toEqual([]);
    stop();
    upcoming = [bill('Rent', new Date(2026, 9, 20))];
    changes.emit(undefined);
    await new Promise((r) => setTimeout(r, 0));
    expect(device.scheduled).toEqual([]);
  });

  test('in-app notifications use the same reminder window', async () => {
    const titles = async () =>
      (await new PlaidNotificationService(bills, noBudgets, { preferences: async () => prefs, now: () => OCT_12 }).getNotifications(0)).items
        .filter((n) => n.kind === 'reminder')
        .map((n) => n.title);
    upcoming = [bill('Phone', new Date(2026, 9, 14)), bill('Water', new Date(2026, 9, 17))];
    expect(await titles()).toEqual(['Phone is due in 2 days']); // 3 days before (default)
    prefs = { ...DEFAULT_PREFERENCES, billReminder: Reminder.oneWeek };
    expect(await titles()).toEqual(['Phone is due in 2 days', 'Water is due in 5 days']);
    prefs = { ...DEFAULT_PREFERENCES, billReminder: Reminder.off };
    expect(await titles()).toEqual([]);
  });
});

describe('without a linked bank', () => {
  let app: SandboxApp;
  beforeEach(async () => {
    app = await sandboxServices({ linkBank: false, today: new Date(2026, 9, 12) });
  });

  describe('managing budgets', () => {
    test('a new user starts with no budgets', async () => {
      expect(await app.services.budgets.budgets()).toEqual([]);
      const overview = await app.services.budgets.getOverview('2026-10');
      expect(overview.categories).toEqual([]);
      expect(overview.summary.statusLabel).toBe('No budgets yet');
    });

    test('the form offers categories without a budget, plus the one being edited', async () => {
      const budgets = app.services.budgets;
      await budgets.createBudget('food', '400');
      const fresh = await budgets.formOptions();
      expect(fresh.existing).toBeUndefined();
      expect(fresh.categories.some((c) => c.id === 'food')).toBe(false);
      const editing = await budgets.formOptions('food');
      expect(editing.existing).toMatchObject({ categoryId: 'food', monthlyLimit: 400 });
      expect(editing.categories.some((c) => c.id === 'food')).toBe(true);
    });

    test('create, edit (limit and category) and delete, announcing each change', async () => {
      const budgets = app.services.budgets;
      let changes = 0;
      budgets.changes.subscribe(() => changes++);
      await budgets.createBudget('food', '$1,250.50');
      expect((await budgets.budgets()).map((b) => b.monthlyLimit)).toEqual([1250.5]);
      expect((await budgets.getOverview('2026-10')).categories[0].limit).toBe(1250.5);
      await budgets.updateBudget('food', '300');
      expect((await budgets.budgets()).map((b) => [b.categoryId, b.monthlyLimit])).toEqual([['food', 300]]);
      await budgets.updateBudget('food', '450', 'shopping');
      expect((await budgets.budgets()).map((b) => [b.categoryId, b.monthlyLimit])).toEqual([['shopping', 450]]);
      expect(await budgets.hasBudget('food')).toBe(false);
      await budgets.deleteBudget('shopping');
      expect(await budgets.budgets()).toEqual([]);
      expect(changes).toBe(4);
    });

    test('a budget applies to every month', async () => {
      const budgets = app.services.budgets;
      await budgets.createBudget('food', '1000');
      const months = (await budgets.getPeriods()).map((p) => p.id);
      expect(months).toEqual(['2026-10', '2026-09', '2026-08']);
      for (const m of months) {
        expect((await budgets.getOverview(m)).categories[0].limit).toBe(1000);
        expect((await budgets.getCategoryDetail('food', m)).limit).toBe(1000);
      }
      await budgets.updateBudget('food', '900'); // editing the limit changes it everywhere
      expect((await budgets.getOverview('2026-08')).categories[0].limit).toBe(900);
      await expect(budgets.getOverview('2026-13')).rejects.toBeInstanceOf(AppException);
    });

    test('validation: category required, one budget per category, spending categories only', async () => {
      const budgets = app.services.budgets;
      expect(await fieldErrors(() => budgets.createBudget(undefined, '100'))).toEqual({ category: 'Choose a category' });
      await budgets.createBudget('food', '100');
      expect((await fieldErrors(() => budgets.createBudget('food', '100'))).category).toBe('This category already has a budget');
      expect((await fieldErrors(() => budgets.createBudget('income', '100'))).category).toBe('Budgets can only be set for spending categories');
      await budgets.createBudget('travel', '100');
      expect((await fieldErrors(() => budgets.updateBudget('food', '100', 'travel'))).category).toBe('This category already has a budget');
    });

    test('validation: limits', async () => {
      const limitError = async (text: string) => (await fieldErrors(() => app.services.budgets.createBudget('food', text))).limit;
      expect(await limitError('')).toBe('Enter a monthly limit');
      expect(await limitError('abc')).toBe('Enter an amount like 400 or 400.50');
      expect(await limitError('10.999')).toBe('Enter an amount like 400 or 400.50');
      expect(await limitError('-5')).toBe('Enter an amount like 400 or 400.50');
      expect(await limitError('0.50')).toBe('The limit must be at least $1');
      expect(await limitError('2000000')).toBe('The limit can be at most $1,000,000');
      expect(parseLimit(' $ 1,000 ').value).toBe(1000);
    });

    test('available categories skip ones already budgeted (except the one being edited)', async () => {
      await app.services.budgets.createBudget('food', '100');
      const ids = (await app.services.budgets.availableCategories()).map((c) => c.id);
      expect(ids).not.toContain('food');
      expect(ids).not.toContain('income');
      expect((await app.services.budgets.availableCategories('food')).map((c) => c.id)).toContain('food');
    });

    test('budgets belong to the signed-in user', async () => {
      await app.services.budgets.createBudget('food', '100');
      await app.services.auth.signOut();
      expect(await app.services.budgets.budgets()).toEqual([]);
      await expect(app.services.budgets.createBudget('food', '100')).rejects.toBeInstanceOf(AppException);
      await app.services.auth.signIn('ada', 'secret123');
      expect((await app.services.budgets.budgets()).map((b) => b.categoryId)).toEqual(['food']); // kept in the database
    });
  });

  describe('recurring expenses the user adds', () => {
    const netflix: RecurringInput = {
      name: ' Netflix ',
      amount: '$15.99',
      frequency: Frequency.monthly,
      firstDue: new Date(2026, 8, 20),
      categoryId: 'entertainment',
      kind: 'subscription',
    };

    test('validation: every field is checked', async () => {
      const bills = app.services.bills;
      const errors = await fieldErrors(() => bills.saveRecurring({ name: '  ', amount: 'abc', categoryId: 'income' }));
      expect(Object.keys(errors).sort()).toEqual(['amount', 'category', 'firstDue', 'frequency', 'kind', 'name']);
      expect(errors.amount).toBe('Enter an amount like 400 or 400.50');
      const more = await fieldErrors(() =>
        bills.saveRecurring({
          name: 'x'.repeat(41), amount: '', frequency: Frequency.semiMonthly, // not one the user can pick
          firstDue: OCT_12, categoryId: 'food', kind: 'bill',
        }),
      );
      expect(Object.keys(more).sort()).toEqual(['amount', 'frequency', 'name']);
    });

    test('added: tracked with its next payment, monthly cost, kind and actions; changes announced', async () => {
      const bills = app.services.bills;
      let changes = 0;
      bills.changes.subscribe(() => changes++);
      await bills.saveRecurring(netflix);

      const r = await bills.getRecurring();
      expect(r.items).toHaveLength(1);
      const [item] = r.items;
      expect(item).toMatchObject({ name: 'Netflix', isManual: true, kind: 'subscription', detailLine: '$15.99 monthly · next Oct 20' });
      expect(r.monthlyTotal).toBeCloseTo(15.99, 3);
      expect(r.subscriptionsMonthly).toBeCloseTo(15.99, 3);
      expect(r.groups.map((g) => [g.title, g.items.length, g.monthly])).toEqual([['Subscriptions', 1, r.subscriptionsMonthly]]);
      expect(bills.actionsFor(item)).toEqual(['details', 'pause', 'edit', 'delete']);

      const upcoming = await bills.upcomingWithDates();
      expect(upcoming.map((u) => [u.due, u.bill.subtitle])).toEqual([[new Date(2026, 9, 20), 'Due Oct 20']]);

      const detail = await bills.getDetail(item.id);
      expect(detail).toMatchObject({
        sourceLabel: 'Added by you',
        yearlyLabel: '$191.88 a year',
        nextLabel: 'Next payment October 20, 2026',
        canMarkPaid: true,
        history: [],
      });
      expect(changes).toBe(1);
    });

    test('mark paid moves it to the next payment; pausing leaves it out of the totals', async () => {
      const bills = app.services.bills;
      await bills.saveRecurring(netflix);
      const { id } = (await bills.getRecurring()).items[0];
      await bills.markPaid(id);
      expect((await bills.getDetail(id)).nextLabel).toBe('Next payment November 20, 2026');
      expect(await bills.upcomingWithDates()).toEqual([]); // Nov 20 is beyond the next 30 days

      await bills.setSubscriptionPaused(id, true);
      const r = await bills.getRecurring();
      expect(r.monthlyTotal).toBe(0);
      expect(r.items[0].status).toBe('paused');
      expect(bills.actionsFor(r.items[0])).toContain('resume');
    });

    test('edit and delete; the form is pre-filled', async () => {
      const bills = app.services.bills;
      await bills.saveRecurring(netflix);
      const { id } = (await bills.getRecurring()).items[0];
      const options = await bills.formOptions(id);
      expect(options.editing!.name).toBe('Netflix');
      expect(options.frequencies).toEqual(CHOOSABLE_FREQUENCIES);
      expect(options.categories.map((c) => c.id)).not.toContain('income');

      await bills.saveRecurring({
        editingId: id, name: 'Rent', amount: '1,500', frequency: Frequency.monthly,
        firstDue: new Date(2026, 10, 1), categoryId: 'utilities', kind: 'bill',
      });
      const r = await bills.getRecurring();
      expect(r.items.map((i) => [i.name, i.kind])).toEqual([['Rent', 'bill']]);
      expect(r.subscriptionsMonthly).toBe(0);
      expect(r.monthlyTotal).toBe(1500);

      await bills.deleteRecurring(id);
      expect((await bills.getRecurring()).items).toEqual([]);
      await expect(bills.getDetail(id)).rejects.toBeInstanceOf(AppException);
    });

    test("belongs to the signed-in user; signed out it can't be added", async () => {
      await app.services.bills.saveRecurring(netflix);
      await app.services.auth.signOut();
      expect((await app.services.bills.getRecurring()).items).toEqual([]);
      await expect(app.services.bills.saveRecurring(netflix)).rejects.toBeInstanceOf(AppException);
    });

    test("bills the bank detected can't be edited or deleted", async () => {
      await expect(app.services.bills.deleteRecurring('plaid-stream-1')).rejects.toBeInstanceOf(AppException);
      expect(
        app.services.bills.actionsFor({
          id: 's', name: 'Gym', iconKey: 'fitness', detailLine: '', yearlyLine: '', status: 'active', kind: 'subscription', isManual: false,
        }),
      ).toEqual(['details', 'pause']);
    });
  });

  test('settings: toggles are saved for the signed-in user and announced; signing out restores the defaults', async () => {
    const { settings, auth } = app.services;
    const announced: UserPreferences[] = [];
    settings.preferenceChanges.subscribe((p) => announced.push(p));
    await settings.setHighContrast(true);
    await settings.setColorblindMode(true);
    const mine = { ...DEFAULT_PREFERENCES, highContrast: true, colorblindMode: true };
    expect(await settings.preferences()).toEqual(mine);
    expect((await settings.load()).highContrast).toBe(true);

    await auth.signOut();
    await Promise.resolve();
    expect(await settings.preferences()).toEqual(DEFAULT_PREFERENCES);
    expect(announced.at(-1)).toEqual(DEFAULT_PREFERENCES);

    await auth.signIn('ada', 'secret123');
    await new Promise((r) => setTimeout(r, 0));
    expect(announced.at(-1)).toEqual(mine); // remembered
  });

  test('settings: the bill reminder choice is kept', async () => {
    await app.services.settings.setBillReminder(Reminder.oneWeek);
    expect((await app.services.settings.load()).billReminder).toEqual(Reminder.oneWeek);
  });
});

describe('RecurringSchedule', () => {
  test('monthly payments keep their day; the 31st falls on the last day of shorter months', () => {
    const jan31 = new Date(2026, 0, 31);
    expect(RecurringSchedule.occurrence(jan31, Frequency.monthly, 1)).toEqual(new Date(2026, 1, 28));
    expect(RecurringSchedule.occurrence(jan31, Frequency.monthly, 2)).toEqual(new Date(2026, 2, 31)); // no drift
    expect(RecurringSchedule.occurrence(new Date(2024, 1, 29), Frequency.yearly, 1)).toEqual(new Date(2025, 1, 28));
  });

  test('first payment on or after a day', () => {
    const first = new Date(2026, 8, 5);
    expect(RecurringSchedule.firstOnOrAfter(first, Frequency.monthly, new Date(2026, 9, 12))).toEqual(new Date(2026, 10, 5));
    expect(RecurringSchedule.firstOnOrAfter(first, Frequency.weekly, new Date(2026, 8, 5))).toEqual(first);
    expect(RecurringSchedule.firstOnOrAfter(first, Frequency.biweekly, new Date(2026, 8, 6))).toEqual(new Date(2026, 8, 19));
    expect(RecurringSchedule.firstOnOrAfter(new Date(2026, 11, 1), Frequency.yearly, new Date(2026, 9, 12))).toEqual(new Date(2026, 11, 1));
  });

  test('monthly cost of each frequency', () => {
    expect(RecurringSchedule.perMonth(Frequency.weekly)).toBeCloseTo(4.333, 3);
    expect(RecurringSchedule.perMonth(Frequency.yearly)).toBeCloseTo(1 / 12, 9);
    expect(RecurringSchedule.perMonth(Frequency.monthly)).toBe(1);
  });
});

describe('savings goals', () => {
  const today = new Date(2026, 9, 12);
  let repo: InMemoryGoalRepository;
  let userId: string | undefined;
  let service: RepositoryGoalService;
  beforeEach(() => {
    repo = new InMemoryGoalRepository();
    userId = 'u1';
    service = new RepositoryGoalService(repo, () => userId, { now: () => today });
  });
  const add = (o: { name?: string; target?: string; saved?: string; date?: Date; icon?: string | null } = {}) =>
    service.addGoal({
      name: o.name ?? 'Trip',
      target: o.target ?? '3000',
      saved: o.saved ?? '',
      targetDate: o.date,
      iconKey: o.icon === null ? undefined : (o.icon ?? 'car'),
    });

  test('no goals yields empty data', async () => {
    expect(await service.getGoals()).toEqual({ goals: [] });
  });

  test('totals known amounts and applies contributions', async () => {
    repo = new InMemoryGoalRepository({ u1: [{ id: 'a', iconKey: 'car', saved: 100, target: 500, contributions: [] }, { id: 'b', iconKey: 'car', contributions: [] }] });
    service = new RepositoryGoalService(repo, () => userId, { now: () => today });
    expect((await service.getGoals()).totalSaved).toBe(100);
    await service.addContribution('a', '$50');
    const a = (await repo.fetchGoal('u1', 'a'))!;
    expect(a.saved).toBe(150);
    expect(a.contributions).toEqual([{ dateLabel: 'Oct 12', amount: 50 }]);
  });

  test('a contribution must be a valid amount of at least $0.01', async () => {
    repo = new InMemoryGoalRepository({ u1: [{ id: 'a', iconKey: 'car', saved: 100, target: 500, contributions: [] }] });
    service = new RepositoryGoalService(repo, () => userId, { now: () => today });
    for (const bad of ['', 'abc', '0', '1.234']) await expect(service.addContribution('a', bad)).rejects.toBeInstanceOf(AppException);
    expect((await repo.fetchGoal('u1', 'a'))!.saved).toBe(100);
  });

  test('a target date can be today at the earliest', () => {
    expect(service.earliestTargetDate()).toEqual(new Date(2026, 9, 12));
  });

  test('stores the goal and announces it', async () => {
    let changes = 0;
    service.changes.subscribe(() => changes++);
    await add({ name: '  Trip to Japan ', target: '$3,000', saved: '600' });
    const [g] = await repo.fetchGoals('u1');
    expect(g).toMatchObject({ name: 'Trip to Japan', target: 3000, saved: 600, iconKey: 'car', targetDate: undefined });
    expect(g.id).toBeTruthy();
    expect(changes).toBe(1);
  });

  test('an empty "saved so far" starts at zero; two goals get their own ids', async () => {
    await add();
    await add({ name: 'Bike' });
    const goals = await repo.fetchGoals('u1');
    expect(goals[0].saved).toBe(0);
    expect(new Set(goals.map((g) => g.id)).size).toBe(2);
  });

  test('reports every invalid field and stores nothing', async () => {
    const errors = await fieldErrors(() => add({ name: ' ', target: '0', saved: 'lots', date: new Date(2026, 9, 11), icon: null }));
    expect(Object.keys(errors).sort()).toEqual(['icon', 'name', 'saved', 'target', 'targetDate']);
    expect((await fieldErrors(() => add({ target: '100', saved: '150' }))).saved).toBe("That's more than the target");
    expect((await fieldErrors(() => add({ name: 'x'.repeat(41) }))).name).toBe('Keep the name under 40 characters');
    expect(await repo.fetchGoals('u1')).toEqual([]);
  });

  test('a target date gives "By …" and how much to save each month', async () => {
    await add({ target: '3000', saved: '600', date: new Date(2027, 3, 1) }); // 6 months away
    const [g] = (await service.getGoals()).goals;
    expect(g).toMatchObject({ subtitle: 'By Apr 2027', tip: 'Save $400 a month to reach it by Apr 2027.', tipHighlight: '$400 a month' });
    await add({ name: 'Done', target: '100', saved: '100', date: new Date(2027, 0, 1) });
    expect((await service.getGoals()).goals.at(-1)!.subtitle).toBe('By Jan 2027 · goal reached');
    await add({ name: 'Someday' });
    expect((await service.getGoals()).goals.at(-1)!.subtitle).toBe('No target date');
  });

  test('goals belong to the signed-in user', async () => {
    await add();
    userId = 'u2';
    expect((await service.getGoals()).goals).toEqual([]);
    userId = undefined;
    await expect(add()).rejects.toBeInstanceOf(AppException);
  });
});

describe('linking Plaid sandbox test banks', () => {
  let app: SandboxApp;
  beforeEach(async () => {
    app = await sandboxServices({ linkBank: false });
  });
  afterEach(() => app.bankData.stopRetrying());

  test('links the sandbox test bank through sandbox.plaid.com only and stores it for the user', async () => {
    expect(await app.services.bankLink.startLink()).toEqual({ linked: true, next: 'home' });
    expect(app.plaid.requests.map((r) => r.url.toString())).toEqual([
      'https://sandbox.plaid.com/sandbox/public_token/create',
      'https://sandbox.plaid.com/item/public_token/exchange',
      'https://sandbox.plaid.com/accounts/get',
    ]);
    const create = app.plaid.requests[0].body;
    expect(create.institution_id).toBe('ins_109508');
    expect(create.initial_products).toEqual(['transactions']);
    // Plaid's published "simple" sandbox test user, never anything typed by the user.
    expect(create.options).toEqual({ override_username: 'user_good', override_password: 'pass_good' });

    const [c] = await app.services.bankLink.connections();
    expect(c).toEqual({ itemId: 'item-linked-1', institutionName: 'First Platypus Bank', accountCount: 14, linkedOnLabel: 'Oct 12', isSandbox: true });
    // The access token is in the secure vault, not the database.
    expect([...app.vault.values.values()]).toEqual(['access-sandbox-test']);
    const rows = JSON.stringify(await app.database.raw.getAllAsync('SELECT * FROM linked_items'));
    expect(rows).not.toContain('access-sandbox');
  });

  test('a non-sandbox token from the API is refused and nothing is stored', async () => {
    app.plaid.overrides.set('/sandbox/public_token/create', { status: 200, body: { public_token: 'public-production-123' } });
    await expect(app.services.bankLink.startLink()).rejects.toBeInstanceOf(AppException);
    expect(app.plaid.requests).toHaveLength(1); // stopped before the exchange
    expect(await app.services.bankLink.connections()).toEqual([]);
  });

  test('Plaid errors become a friendly message', async () => {
    app.plaid.overrides.set('/sandbox/public_token/create', {
      status: 400,
      body: {
        error_type: 'INSTITUTION_ERROR', error_code: 'INSTITUTION_DOWN',
        error_message: 'this institution is not currently responding',
        display_message: 'The test bank is not responding. Try again later.',
      },
    });
    await expect(app.services.bankLink.startLink()).rejects.toThrow('The test bank is not responding. Try again later.');
  });

  test('removing revokes the Item at the sandbox, then deletes it (and its token) from the device', async () => {
    await app.services.bankLink.startLink();
    app.plaid.requests.length = 0;
    await app.services.bankLink.removeConnection('item-linked-1');
    expect(app.plaid.requests.map((r) => [r.url.pathname, r.body.access_token])).toEqual([['/item/remove', 'access-sandbox-test']]);
    expect(await app.services.bankLink.connections()).toEqual([]);
    expect(app.vault.values.size).toBe(0);
  });

  test("an Item Plaid no longer knows still counts as removed; if Plaid can't remove it, it's kept", async () => {
    await app.services.bankLink.startLink();
    app.plaid.overrides.set('/item/remove', { status: 500, body: { error_type: 'API_ERROR', error_code: 'INTERNAL_SERVER_ERROR' } });
    await expect(app.services.bankLink.removeConnection('item-linked-1')).rejects.toBeInstanceOf(AppException);
    expect(await app.services.bankLink.connections()).toHaveLength(1);
    app.plaid.overrides.set('/item/remove', { status: 400, body: { error_type: 'ITEM_ERROR', error_code: 'ITEM_NOT_FOUND' } });
    await app.services.bankLink.removeConnection('item-linked-1');
    expect(await app.services.bankLink.connections()).toEqual([]);
  });

  test("cannot remove another user's connection", async () => {
    await app.services.bankLink.startLink();
    await app.services.auth.signOut();
    await app.services.auth.createAccount({
      name: 'Bob', username: 'bob', password: 'secret123', confirmPassword: 'secret123',
      securityQuestion: 'What city were you born in?', securityAnswer: 'Paris',
      plaidClientId: '0123456789abcdef01234567', plaidSecret: '0123456789abcdef0123456789abcd',
    });
    await expect(app.services.bankLink.removeConnection('item-linked-1')).rejects.toBeInstanceOf(AppException);
    expect(await app.services.bankLink.connections()).toEqual([]); // Bob has none
  });

  test("lists Plaid's test banks, marking the connected ones; each can only be linked once", async () => {
    const link = app.services.bankLink;
    expect((await link.institutions()).map((i) => i.isLinked)).toEqual([false, false, false, false, false]);
    await link.startLink();
    await link.startLink('ins_109511');
    expect(app.plaid.requests.filter((r) => r.url.pathname === '/sandbox/public_token/create').at(-1)!.body.institution_id).toBe('ins_109511');
    expect((await link.connections()).map((c) => c.institutionName)).toEqual(['First Platypus Bank', 'Tartan Bank']);
    expect((await link.institutions()).map((i) => i.isLinked)).toEqual([true, false, false, true, false]);

    app.plaid.requests.length = 0;
    await expect(link.startLink('ins_109511')).rejects.toThrow('Tartan Bank is already connected.');
    await expect(link.startLink('ins_real_bank')).rejects.toBeInstanceOf(AppException);
    expect(app.plaid.requests).toEqual([]); // refused before calling Plaid
  });

  test('without an id it links the next test bank; once all are connected it says so', async () => {
    for (let i = 0; i < 5; i++) await app.services.bankLink.startLink();
    expect((await app.services.bankLink.institutions()).every((i) => i.isLinked)).toBe(true);
    await expect(app.services.bankLink.startLink()).rejects.toThrow('already connected');
  });

  test('linking or removing a bank tells screens to reload', async () => {
    let updates = 0;
    app.services.bankLink.dataUpdates.subscribe(() => updates++);
    await app.services.bankLink.startLink();
    expect(updates).toBe(1);
    await app.services.bankLink.removeConnection('item-linked-1');
    expect(updates).toBe(2);
  });

  test('must be signed in', async () => {
    await app.services.auth.signOut();
    await expect(app.services.bankLink.startLink()).rejects.toBeInstanceOf(AppException);
    expect(app.plaid.requests).toEqual([]);
  });
});
