import { fireEvent } from 'expo-router/testing-library';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle, type } from './support/app';
import type { SandboxApp } from './support/sandbox';
jest.setTimeout(30000);
let app: SandboxApp | undefined;
afterEach(() => app?.bankData.stopRetrying());

describe('Home', () => {
  test('shows the sandbox accounts, spending, bills and tools', async () => {
    app = await openApp('/');
    expect(screen.getByText('Mon, Oct 12')).toBeTruthy();
    expect(screen.getByText('Spent this month')).toBeTruthy();
    expect(screen.getByText('$110.00')).toBeTruthy(); // checking
    expect(screen.getByText('RECENT TRANSACTIONS')).toBeTruthy();
    expect(screen.getByText('UPCOMING BILLS')).toBeTruthy();
    expect(screen.getByText('Recurring & Subscriptions')).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeTruthy();
  });

  test('every section links where it should', async () => {
    app = await openApp('/');
    await pressLabel('Settings');
    expect(pathname()).toBe('/settings');
    await pressLabel('Close settings');

    await press('See all bills');
    expect(pathname()).toBe('/bills');
    await pressLabel('Home');

    await press('Savings Goals');
    expect(pathname()).toBe('/goals');
    await pressLabel('Back');

    await press('Cash Flow Projection');
    expect(pathname()).toBe('/cash-flow');
    await pressLabel('Back');

    await press('Recurring & Subscriptions');
    expect(pathname()).toBe('/bills');
    expect(screen.getByText('SUBSCRIPTIONS')).toBeTruthy(); // the Recurring tab
  });

  test('the bottom navigation switches tabs', async () => {
    app = await openApp('/');
    for (const [tab, path] of [['Transactions', '/transactions'], ['Spending', '/spending'], ['Budgets', '/budgets'], ['Bills', '/bills'], ['Home', '/']]) {
      await pressLabel(tab);
      expect(pathname()).toBe(path);
    }
  });
});

describe('Transactions', () => {
  test('search as you type, with a no-match message and a clear button', async () => {
    app = await openApp('/transactions');
    expect(screen.getAllByText('Uber').length).toBeGreaterThan(0);
    const everything = screen.getAllByText(/·/).length;

    await type('Search transactions', 'uber');
    await settle(400); // typing pause
    expect(screen.getAllByText('Uber').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/·/).length).toBeLessThan(everything);

    await type('Search transactions', 'zzzz');
    await settle(400);
    expect(screen.getByText('No transactions match "zzzz".')).toBeTruthy();

    await pressLabel('Clear search');
    await settle();
    expect(screen.queryByText(/No transactions match/)).toBeNull();
    expect(screen.getAllByText(/·/).length).toBe(everything);
  });

  test('filter by category from the picker sheet, then back to all', async () => {
    app = await openApp('/transactions');
    await press('Category');
    expect(screen.getByText('Filter by category')).toBeTruthy();
    await press('Food & drink');
    expect(screen.getByText('Food & drink')).toBeTruthy(); // the filter button shows it
    expect(screen.queryByText('Uber')).toBeNull();

    await press('Food & drink');
    await press('All categories');
    expect(screen.getAllByText('Uber').length).toBeGreaterThan(0);
  });

  test('detail: several categories (the first marked Primary), saved; a note', async () => {
    app = await openApp('/transactions');
    await fireEvent.press(screen.getAllByText('Uber')[0]);
    await settle();
    expect(pathname()).toMatch(/^\/transaction\//);
    expect(screen.getByText('Transportation')).toBeTruthy();

    await press('Travel'); // adds Travel after the primary
    expect(screen.getByText('Primary')).toBeTruthy();
    expect(screen.getByText('Categories')).toBeTruthy();
    const id = pathname().split('/').pop()!;
    expect((await app.services.transactions.getDetail(id)).transaction.selectedCategoryIds).toEqual(['transport', 'travel']);

    await press('Transportation'); // removing the primary promotes the next one
    expect((await app.services.transactions.getDetail(id)).transaction.selectedCategoryIds).toEqual(['travel']);
    await press('Travel'); // the last one can't be removed
    expect((await app.services.transactions.getDetail(id)).transaction.selectedCategoryIds).toEqual(['travel']);

    await pressButton('Add a note');
    await type('Note', 'Ride to the airport');
    await pressButton('Save');
    expect(screen.getByText('Ride to the airport')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit note' })).toBeTruthy();
  });

  test('a trend opens the transactions behind it', async () => {
    app = await openApp('/trends');
    const [first] = (await app.services.trends.getTrends()).trends;
    expect(screen.getByText(first.title)).toBeTruthy();
    await fireEvent.press(screen.getAllByText(first.actionLabel)[0]);
    await settle();
    expect(pathname()).toBe('/transactions');
    // A spending trend filters by its category; income trends show everything.
    expect(screen.queryByText('Category') === null).toBe(first.direction !== 'steady');
  });
});
