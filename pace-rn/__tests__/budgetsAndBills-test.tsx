import { fireEvent } from 'expo-router/testing-library';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle, type } from './support/app';
import { type SandboxApp, sandboxServices, TEST_BUDGETS } from './support/sandbox';

let app: SandboxApp | undefined;
afterEach(() => app?.bankData.stopRetrying());

test('Spending: ranges, highlighting a bar, a category', async () => {
  app = await openApp('/spending');
  expect(screen.getByText('October spending')).toBeTruthy();
  await pressLabel('Year');
  expect(screen.getByText('2026 spending')).toBeTruthy();

  const bars = screen.getAllByLabelText(/^(January|February|March|April|May|June|July|August|September|October): /);
  await fireEvent.press(bars[0]);
  await settle();
  expect(screen.getAllByLabelText(/^January: /)[0].props.accessibilityState.selected).toBe(true);

  const [top] = (await app.services.spending.getSpending(2)).categories;
  await fireEvent.press(screen.getAllByText(top.name)[0]);
  await settle();
  expect(pathname()).toBe(`/spending-category/${top.id}`);
  expect(screen.getByText('2026 spending')).toBeTruthy(); // the same period as Spending
  expect(screen.getByText('TRANSACTIONS')).toBeTruthy();
});

describe('Budgets', () => {
  test('a new user has none; create one from the form; it shows in every month', async () => {
    app = await openApp('/budgets');
    expect(screen.getByText(/No budgets yet/)).toBeTruthy();

    await pressButton('New budget');
    expect(pathname()).toBe('/budget-form');
    await pressButton('Create budget');
    expect(screen.getByText('Choose a category')).toBeTruthy();
    expect(screen.getByText('Enter a monthly limit')).toBeTruthy();

    await press('Food & drink');
    await type('Monthly limit', '400');
    await pressButton('Create budget');
    expect(pathname()).toBe('/budgets');
    expect(screen.getByText('Food & drink')).toBeTruthy();

    await pressLabel('September');
    expect(screen.getByText('Food & drink')).toBeTruthy();
    expect(screen.getAllByText(/of \$400/)).toHaveLength(2); // the month summary and the category
  });

  test('category detail → Edit → delete (after confirming)', async () => {
    app = await openApp('/budgets', await sandboxServices({ budgets: TEST_BUDGETS }));
    await press('Food & drink');
    expect(pathname()).toBe('/budget-category/food');
    expect(screen.getByText('Spent in October')).toBeTruthy();
    expect(screen.getByText('PACE')).toBeTruthy();

    await press('Edit');
    expect(screen.getByLabelText('Monthly limit').props.value).toBe('400');
    await pressButton('Delete budget');
    expect(screen.getByText('Delete the Food & drink budget?')).toBeTruthy();
    await pressButton('Delete');
    expect(await app.services.budgets.hasBudget('food')).toBe(false);
  });

  test('⋮ opens the manager: edit a limit, delete one', async () => {
    app = await openApp('/budgets', await sandboxServices({ budgets: { food: 400, shopping: 600 } }));
    await pressLabel('Budget options');
    expect(pathname()).toBe('/manage-budgets');
    expect(screen.getByText('$400.00 a month')).toBeTruthy();

    await pressLabel('Edit Food & drink budget');
    await type('Monthly limit', '450');
    await pressButton('Save changes');
    expect(screen.getByText('$450.00 a month')).toBeTruthy();

    await pressLabel('Delete Shopping budget');
    await pressButton('Delete');
    expect(screen.queryByText('Shopping')).toBeNull();
  });
});

describe('Bills', () => {
  test('upcoming → a bill → mark paid; it leaves the upcoming list', async () => {
    app = await openApp('/bills');
    expect(screen.getByText('Due in the next 30 days')).toBeTruthy();
    const [first] = await app.services.bills.upcomingWithDates();
    await fireEvent.press(screen.getAllByText(first.bill.title)[0]);
    await settle();
    expect(pathname()).toBe(`/bill/${first.bill.id}`);
    expect(screen.getByText('PAYMENTS')).toBeTruthy();

    await pressButton('Mark next payment as paid');
    expect((await app.services.bills.upcomingWithDates()).some((u) => u.bill.id === first.bill.id)).toBe(false);
    await pressButton('Pause tracking');
    expect(screen.getByText('Paused · not counted in your totals')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Resume tracking' })).toBeTruthy();
  });

  test('+ → add a subscription → it is listed under Recurring → its menu deletes it', async () => {
    app = await openApp('/bills');
    await pressLabel('Add bill or subscription');
    expect(pathname()).toBe('/bill-form');
    await pressButton('Start tracking');
    expect(screen.getByText('Enter a name')).toBeTruthy();
    expect(screen.getByText('Choose the date of the next payment')).toBeTruthy();

    await type('Name', 'Netflix');
    await type('Amount each time', '15.99');
    await press('Subscription');
    await pressLabel(/^Next payment:/);
    await fireEvent.changeText(screen.getByTestId('date-picker'), '2026-10-20');
    await settle();
    await press('Entertainment');
    await pressButton('Start tracking');

    expect(pathname()).toBe('/bills');
    await pressLabel('Recurring');
    expect(screen.getByText('Netflix')).toBeTruthy();
    expect(screen.getByText(/\$15\.99 monthly/)).toBeTruthy();

    await pressLabel('Options for Netflix');
    await press('Delete');
    expect(screen.getByText('Stop tracking Netflix?')).toBeTruthy();
    await pressButton('Delete');
    expect(screen.queryByText('Netflix')).toBeNull();
  });

  test('a detected subscription can be paused from its menu, but not deleted', async () => {
    app = await openApp('/bills?view=recurring');
    await pressLabel('Options for Touchstone Climbing');
    expect(screen.queryByText('Delete')).toBeNull();
    await press('Pause tracking');
    expect((await app.services.bills.getRecurring()).items.find((i) => i.name === 'Touchstone Climbing')!.status).toBe('paused');
  });
});
