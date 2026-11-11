// The desktop layout of each page (sidebar-frame pages, tables, the Customize panel). The desktop
// app is the web build in a wide window; here the layout switch is forced on, and the pages render
// on the native test renderer with the same controllers and services.
import { fireEvent } from 'expo-router/testing-library';
import { DEFAULT_COMPARISON_OPTIONS } from '@/models/comparison';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle, type } from './support/app';
import { type SandboxApp, sandboxServices } from './support/sandbox';

jest.mock('@/ui/responsive', () => ({
  ...jest.requireActual('@/ui/responsive'),
  useDesktop: () => true,
}));
jest.setTimeout(30000);

let app: SandboxApp | undefined;
afterEach(() => {
  app?.bankData.stopRetrying();
  app = undefined;
});


describe('desktop pages render with live data', () => {
  test.each([
    ['/', 'Home', 'Recent transactions'],
    ['/transactions', 'Transactions', 'Search transactions'],
    ['/spending', 'Spending', 'Choose dates'],
    ['/budgets', 'Budgets', 'Manage budgets'],
    ['/bills', 'Bills', 'Add bill'],
    ['/comparison', 'Monthly Comparison', 'Customize'],
    ['/goals', 'Savings Goals', 'New goal'],
    ['/cash-flow', 'Cash Flow Projection', 'Add expected income'],
    ['/trends', 'Plaid TrendScore', undefined],
    ['/accounts', 'Accounts', undefined],
    ['/notifications', 'Notifications', 'Mark all read'],
    ['/settings', 'Settings', 'Edit profile'],
  ])('%s', async (url, heading, control) => {
    app = await openApp(url);
    expect(screen.getAllByText(heading).length).toBeGreaterThan(0);
    if (control) expect(screen.queryAllByLabelText(control).length + screen.queryAllByText(control).length).toBeGreaterThan(0);
  });

  test('signing in and setting up use the desktop journey pages', async () => {
    app = await openApp('/sign-in', await sandboxServices({ signIn: false }));
    expect(screen.getAllByLabelText('Username').length).toBeGreaterThan(0);
    await press('Create account');
    expect(pathname()).toBe('/create-account');
  });
});

describe('desktop pages respond', () => {
  test('transactions: search, then a transaction and back', async () => {
    app = await openApp('/transactions');
    await type('Search transactions', 'zzzz-no-match');
    await settle(300);
    await pressLabel('Clear search');
    await settle(300);
    const firstRow = screen.getAllByRole('button').find((b) => /\$\d/.test(String(b.props.accessibilityLabel ?? '')));
    expect(firstRow).toBeTruthy();
    await fireEvent.press(firstRow!);
    await settle();
    expect(pathname()).toMatch(/^\/transaction\//);
    expect(screen.getByText('Transaction details')).toBeTruthy();
  });

  test('budgets: an earlier month, then a budget', async () => {
    app = await openApp('/budgets', await sandboxServices({ budgets: { food: 400, shopping: 600 } }));
    await pressLabel('Earlier month');
    await pressLabel('Later month');
    const budget = screen.getAllByText(/^Food/)[0];
    await fireEvent.press(budget);
    await settle();
    expect(pathname()).toMatch(/^\/budget-category\//);
  });

  test('bills: switching to recurring bills', async () => {
    app = await openApp('/bills');
    await pressLabel('Recurring');
    expect(screen.getAllByText('Monthly').length).toBeGreaterThan(0);
    await pressLabel('Upcoming');
  });

  test('notifications: marking them all read', async () => {
    app = await openApp('/notifications');
    await pressButton('Mark all read');
    expect(screen.queryAllByLabelText(/^New\. /)).toHaveLength(0);
  });
});

describe('Monthly Comparison on desktop', () => {
  const open = async () => {
    app = await openApp('/comparison');
    await settle(100);
  };

  test('rows expand to their merchants, and density switches (and is kept)', async () => {
    await open();
    const collapsed = screen.getAllByLabelText(/, collapsed\. /)[0];
    await fireEvent.press(collapsed);
    await settle();
    expect(screen.getAllByLabelText(/, expanded\. /).length).toBe(1);
    await fireEvent.press(screen.getAllByLabelText(/, expanded\. /)[0]);
    await settle();
    expect(screen.queryAllByLabelText(/, expanded\. /)).toHaveLength(0);

    await pressLabel('Table density: comfortable. Switch');
    expect(screen.getByLabelText('Table density: compact. Switch')).toBeTruthy();
    expect((await app!.services.comparison.options()).density).toBe('compact');
  });

  test('periods: pick, swap and compare', async () => {
    await open();
    await fireEvent.press(screen.getAllByLabelText(/^Period A: /)[0]);
    await settle();
    await press('August 2026');
    expect(screen.getAllByLabelText(/^Period A: /)[0].props.accessibilityLabel).toBe('Period A: August 2026');
    await pressLabel('Swap periods');
    expect(screen.getAllByLabelText(/^Period B: /)[0].props.accessibilityLabel).toBe('Period B: August 2026');
    await pressButton('Compare');
    await settle(100);
    expect(screen.getAllByText(/October 2026 vs August 2026/).length).toBeGreaterThan(0);
  });

  test('downloads CSV and PDF', async () => {
    await open();
    await pressLabel('Download CSV');
    await pressLabel('Print (save as PDF)');
    expect(app!.saver.saved.map((f) => f.format)).toEqual(['csv', 'pdf']);
    expect(screen.getByText(/^Saved pace-comparison-/)).toBeTruthy();
  });

  test('Customize: Data choices apply, are kept, and show in the table', async () => {
    await open();
    await pressButton('Customize');
    expect(screen.getByText('Columns')).toBeTruthy();

    const chips = screen.getAllByRole('checkbox').filter((c) => !/Change|Transactions|negative/.test(String(c.props.accessibilityLabel)));
    expect(chips.length).toBeGreaterThan(1);
    // Untick every category: nothing to show, so Apply is disabled and says why.
    for (const chip of chips) await fireEvent.press(chip);
    await settle();
    expect(screen.getByText('Choose at least one category.')).toBeTruthy();
    await press('Select all');
    expect(screen.queryByText('Choose at least one category.')).toBeNull();
    await fireEvent.press(chips[0]);
    await settle();

    await pressLabel('All categories');
    await pressLabel('$ Change');
    await pressLabel('Transactions in expanded rows');
    await pressLabel('$1,500.00');
    await pressLabel('Show negative changes in parentheses');
    await pressButton('Apply changes');

    expect(screen.getByText('Customization applied')).toBeTruthy();
    const kept = await app!.services.comparison.options();
    expect(kept).toMatchObject({ showEmpty: true, showDollarChange: false, expandableRows: false, decimals: 2, negativeInParentheses: true });
    expect(kept.categoryIds).toHaveLength(chips.length - 1);
    expect(screen.queryByText('$ CHANGE')).toBeNull();
    expect(screen.getByLabelText(`Categories: ${kept.categoryIds!.length} categories`)).toBeTruthy();
  });

  test('Customize: Visual choices, the highlight picker, Reset and Cancel', async () => {
    await open();
    await pressButton('Customize');
    await pressLabel('Visual');
    for (const label of ['Report title', 'Reporting period', 'Summary cards', 'Arrow icons', 'Text labels (Up / Down)', 'Status colors', 'Patterns in summary cards']) {
      await pressLabel(label);
    }
    await pressLabel('Compact');
    await pressLabel('Highlight changes over: 10%');
    await press('25%');
    expect(screen.getByLabelText('Highlight changes over: 25%')).toBeTruthy();
    await pressButton('Apply changes');

    expect(await app!.services.comparison.options()).toMatchObject({
      showTitle: false, showPeriod: false, showSummary: false, showArrows: false, showTextLabels: false,
      showStatusColors: false, summaryPatterns: true, density: 'compact', highlightPercent: 25,
    });
    expect(screen.queryByText('Spending by Category')).toBeNull();

    // Reset puts the defaults in the panel; Cancel leaves what's applied alone.
    await pressButton('Customize');
    await pressLabel('Reset to defaults');
    await pressButton('Cancel');
    expect((await app!.services.comparison.options()).highlightPercent).toBe(25);

    await pressButton('Customize');
    await pressLabel('Reset to defaults');
    await pressButton('Apply changes');
    expect(await app!.services.comparison.options()).toEqual(DEFAULT_COMPARISON_OPTIONS);
    expect(screen.getAllByText('Spending by Category').length).toBeGreaterThan(0);
  });

  test('choices saved earlier are shown when the page opens', async () => {
    const services = await sandboxServices();
    await services.services.comparison.saveOptions({ ...DEFAULT_COMPARISON_OPTIONS, showSummary: false, showTitle: false });
    app = await openApp('/comparison', services);
    await settle(100);
    expect(screen.queryByText('Spending by Category')).toBeNull();
    expect(screen.queryByText(/^Total spending · /)).toBeNull();
  });
});
