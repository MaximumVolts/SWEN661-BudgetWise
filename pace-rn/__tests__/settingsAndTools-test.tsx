import { fireEvent } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';
import { Reminder } from '@/models/userPreferences';
import { HIGH_CONTRAST, STANDARD } from '@/ui/theme';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle, type } from './support/app';
import { type SandboxApp, sandboxServices } from './support/sandbox';

let app: SandboxApp | undefined;
afterEach(() => app?.bankData.stopRetrying());

const colorOf = (text: string) => StyleSheet.flatten(screen.getByText(text).props.style).color;

describe('Settings', () => {
  test('high contrast and colorblind mode restyle the whole app at once, and are saved', async () => {
    app = await openApp('/settings');
    expect(colorOf('Settings')).toBe(STANDARD.ink);
    expect(screen.getByText('PREVIEW · COLORBLIND MODE OFF')).toBeTruthy();

    await fireEvent(screen.getByLabelText('High contrast'), 'valueChange', true);
    await settle();
    expect(colorOf('Settings')).toBe(HIGH_CONTRAST.ink);

    await fireEvent(screen.getByLabelText('Colorblind mode'), 'valueChange', true);
    await settle();
    expect(screen.getByText('PREVIEW · COLORBLIND MODE ON')).toBeTruthy();
    expect(screen.getByText('Colorblind mode on: status uses blue and orange, with shapes and patterns')).toBeTruthy();
    expect(await app.services.settings.preferences()).toMatchObject({ highContrast: true, colorblindMode: true });

    await pressLabel('Close settings'); // other screens use the same colors
    expect(colorOf('Mon, Oct 12')).toBe(HIGH_CONTRAST.ink);
  });

  test('the bill reminder picker; the test reminder shows a notification now', async () => {
    app = await openApp('/settings');
    expect(screen.getByText('3 days before')).toBeTruthy();
    await press('Bill reminders');
    expect(screen.getByText('Remind me about bills')).toBeTruthy();
    await press('1 week before');
    expect(screen.getByText('Bill reminders: 1 week before')).toBeTruthy();
    expect((await app.services.settings.preferences()).billReminder).toEqual(Reminder.oneWeek);
    // Reminders are scheduled for the bills coming up, 7 days before at 9 AM.
    await settle();
    expect(app.notifications.scheduled.every((n) => n.title.endsWith('is due in 7 days') && n.at.getHours() === 9)).toBe(true);

    await press('Send a test reminder');
    expect(screen.getByText('Test reminder sent. Check your notifications.')).toBeTruthy();
    expect(app.notifications.shown[0].title).toMatch(/^Test: .* is due/);

    app.notifications.permitted = false;
    await press('Send a test reminder');
    expect(screen.getByText(/Notifications are turned off for Pace/)).toBeTruthy();
  });

  test('turning reminders off clears the scheduled ones', async () => {
    app = await openApp('/settings', await sandboxServices({ today: new Date(2026, 9, 12, 9) }));
    await settle();
    expect(app.notifications.scheduled.length).toBeGreaterThan(0);
    await press('Bill reminders');
    await press('Off');
    expect(screen.getByText('Bill reminders off')).toBeTruthy();
    await settle();
    expect(app.notifications.scheduled).toEqual([]);
  });

  test('sign out returns to sign-in', async () => {
    app = await openApp('/settings');
    await press('Sign out');
    expect(pathname()).toBe('/sign-in');
  });

  test('delete account asks first, then removes it and signs out', async () => {
    app = await openApp('/settings');
    await press('Delete account');
    expect(screen.getByText('Delete account?')).toBeTruthy();
    await pressButton('Cancel');
    expect(pathname()).toBe('/settings');
    await press('Delete account');
    await pressButton('Delete');
    expect(pathname()).toBe('/sign-in');
    await expect(app.services.auth.signIn('ada', 'secret123')).rejects.toThrow();
  });
});

describe('Profile', () => {
  test('rename (the username can’t be changed); the secret is never shown', async () => {
    app = await openApp('/profile');
    expect(screen.getByLabelText('Username').props.editable).toBe(false);
    expect(screen.getByLabelText('Sandbox secret').props.value).toBe('');
    await type('Name', 'Ada King');
    await pressButton('Save changes');
    expect(screen.getByText('Profile saved')).toBeTruthy();
    expect(screen.getByText('AK')).toBeTruthy();
    await type('Client ID', 'nope');
    await pressButton('Save changes');
    expect(screen.getByText('A Plaid client ID is 24 letters and numbers (0–9, a–f)')).toBeTruthy();
  });

  test('remove the bank connection, then connect the test bank again', async () => {
    app = await openApp('/profile');
    expect(screen.getByText('First Platypus Bank')).toBeTruthy();
    await pressButton('Remove connection');
    expect(screen.getByText('Remove First Platypus Bank?')).toBeTruthy();
    await pressButton('Remove');
    expect(screen.getByText(/No bank connected/)).toBeTruthy();
    expect(app.plaid.calls('/item/remove')).toBe(1);

    await pressButton('Connect test bank with Plaid');
    await settle(60);
    expect(screen.getByText('First Platypus Bank')).toBeTruthy();
  });
});

test('Accounts → Link another account: pick a sandbox test bank (connected ones can’t be picked)', async () => {
  app = await openApp('/accounts');
  expect(screen.getByText('Plaid Checking')).toBeTruthy();
  expect(screen.getByText('Checking ••0000')).toBeTruthy();
  await pressButton('Link another account');
  expect(pathname()).toBe('/add-account');
  expect(screen.getByText('Already connected')).toBeTruthy();
  expect(screen.getByRole('radio', { name: /First Platypus Bank/ }).props.accessibilityState.disabled).toBe(true);

  await press('Tartan Bank');
  await pressButton('Connect Tartan Bank');
  await settle(60);
  expect(pathname()).toBe('/accounts');
  expect((await app.services.bankLink.connections()).map((c) => c.institutionName)).toEqual(['First Platypus Bank', 'Tartan Bank']);
});

test('Notifications: filters, an action, and opening the target', async () => {
  app = await openApp('/notifications', await sandboxServices({ today: new Date(2026, 9, 18, 9), budgets: { food: 1, shopping: 1, transport: 1, travel: 1, utilities: 1, personal: 1 } }));
  expect(screen.getAllByText(/is due in 2 days/).length).toBeGreaterThan(0);
  const budgetAlert = (await app.services.notifications.getNotifications(2)).items[0];
  expect(budgetAlert.kind).toBe('overBudget'); // a $1 limit
  expect(screen.getByText(budgetAlert.title)).toBeTruthy();

  await pressLabel('Budgets');
  expect(screen.queryByText(/is due in 2 days/)).toBeNull();
  await pressLabel('Bills');

  await press('Mark all read');
  expect(screen.getByText('All · 0 new')).toBeTruthy();

  const [first] = (await app.services.notifications.getNotifications(1)).items;
  await fireEvent.press(screen.getByText(first.title));
  await settle();
  expect(pathname()).toBe(`/bill/${first.id.slice('reminder-'.length)}`);
});

test('Savings goals: empty state, adding one, a contribution', async () => {
  app = await openApp('/goals');
  expect(screen.getByText('No savings goals yet')).toBeTruthy();
  await pressLabel('Add savings goal');
  await pressButton('Add goal');
  expect(screen.getByText('Enter a name')).toBeTruthy();

  await type('Name', 'Trip to Japan');
  await type('Target', '3000');
  await type('Saved so far (optional)', '600');
  await press('Car');
  await pressButton('Add goal');
  expect(pathname()).toBe('/goals');
  expect(screen.getByText('Trip to Japan')).toBeTruthy();
  expect(screen.getAllByText('$600.00').length).toBeGreaterThan(0);

  await pressButton('Add contribution');
  await type('Amount', '50');
  await pressButton('Add');
  expect(screen.getByText('Recent contributions')).toBeTruthy();
  expect(screen.getByText('+$50.00')).toBeTruthy();
});

test('Cash flow: ranges, scenarios, adding and removing expected income', async () => {
  app = await openApp('/cash-flow');
  expect(screen.getByText('Projected cash on Nov 11')).toBeTruthy();
  await pressLabel('60 days');
  expect(screen.getByText('Cash over the next 60 days')).toBeTruthy();
  await pressLabel('High');
  expect(screen.getByText(/High · recurring deposits/)).toBeTruthy();

  await pressButton('Add expected income');
  await type('What is it?', 'Tax refund');
  await type('Amount', '1200');
  await pressLabel(/^Expected on:/);
  await fireEvent.changeText(screen.getByTestId('date-picker'), '2026-10-20');
  await settle();
  await pressButton('Add income');
  expect(pathname()).toBe('/cash-flow');
  expect(screen.getByText('Expected Oct 20 · added by you')).toBeTruthy();

  await pressLabel('Remove Tax refund');
  await pressButton('Remove');
  expect(screen.queryByText('Tax refund')).toBeNull();
});

test('Settings → Statement export: pick a month and CSV, download, see where it was saved', async () => {
  app = await openApp('/settings');
  await press('Statement export');
  expect(pathname()).toBe('/statements');
  expect(screen.getByText('All accounts · October 2026')).toBeTruthy();
  await press('September 2026');
  await press('CSV (for spreadsheets)');
  expect(screen.getByText('All accounts · September 2026')).toBeTruthy();
  expect(screen.getByText(/^\d+ posted transactions?$/)).toBeTruthy();
  await pressButton('Download CSV statement');
  expect(app.saver.saved.map((f) => f.fileName)).toEqual(['pace-statement-2026-09-all-accounts.csv']);
  expect(screen.getByText('Statement saved as pace-statement-2026-09-all-accounts.csv')).toBeTruthy();
});
