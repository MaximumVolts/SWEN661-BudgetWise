import { AppException } from '@/models/appException';
import { emptyQuery, type TransactionItem, type TransactionQuery } from '@/models/transaction';
import { formatMoney } from '@/models/money';
import { NO_BANK_MESSAGE } from '@/services/accountService';
import { statementNet } from '@/models/statement';
import { encodeCsv, encodePdfHtml } from '@/services/statementEncoders';
import { fieldErrors, type SandboxApp, sandboxServices, TEST_BUDGETS } from './support/sandbox';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let app: SandboxApp;
beforeEach(async () => {
  app = await sandboxServices({ budgets: TEST_BUDGETS });
});
afterEach(() => app.bankData.stopRetrying());

describe('bank data (PlaidBankDataRepository)', () => {
  test('reads balances, transactions and recurring streams from the sandbox', async () => {
    const snap = await app.bankData.load();
    expect(Object.values(snap.institutions)).toEqual(['First Platypus Bank']);
    expect(snap.accounts).toHaveLength(14);
    expect(snap.transactions).toHaveLength(48);
    expect(snap.recurring.filter((s) => !s.isInflow)).toHaveLength(7);
    expect(snap.transactionsReady).toBe(true);
    expect(app.plaid.calls('/accounts/balance/get')).toBe(1);
    expect(app.plaid.calls('/transactions/sync')).toBe(1);
    expect(app.plaid.calls('/transactions/recurring/get')).toBe(1);
  });

  test('screens opening together share one fetch; refresh fetches again', async () => {
    const data = app.bankData;
    await Promise.all([data.load(), data.load(), data.load()]);
    expect(app.plaid.calls('/accounts/balance/get')).toBe(1);
    await data.load({ refresh: true });
    expect(app.plaid.calls('/accounts/balance/get')).toBe(2);
  });

  test('no linked bank (or nobody signed in) makes no Plaid calls', async () => {
    const other = await sandboxServices({ linkBank: false });
    expect(Object.keys((await other.bankData.load()).institutions)).toEqual([]);
    await other.services.auth.signOut();
    expect(Object.keys((await other.bankData.load()).institutions)).toEqual([]);
    expect(other.plaid.requests).toEqual([]);
  });

  test('just after linking, transactions are reported as not ready; that snapshot is not cached', async () => {
    app.plaid.transactionsReady = false;
    const snap = await app.bankData.load({ refresh: true });
    expect(snap.transactionsReady).toBe(false);
    expect(snap.recurring).toEqual([]);
    expect(snap.accounts).toHaveLength(14); // balances are available immediately
    app.bankData.stopRetrying();

    app.plaid.transactionsReady = true;
    const next = await app.bankData.load(); // no refresh needed
    expect(next.transactionsReady).toBe(true);
    expect(next.recurring.length).toBeGreaterThan(0);
  });

  test("right after linking, each stage is announced as it arrives (Home's chart fills in first)", async () => {
    const plaid = app.plaid;
    plaid.transactionsReady = false;
    plaid.historyReady = false;
    let updates = 0;
    const off = app.bankData.updates.subscribe(() => updates++);
    const home = app.services.dashboard;

    // Home opens before Plaid has any transactions: the chart is empty.
    await app.bankData.load({ refresh: true });
    expect((await home.load()).spend.amount).toBe(0);
    await delay(70);
    expect(updates).toBe(0); // nothing new yet: no reload

    // Stage 1: the recent transactions. Announced now, not when the full history is done.
    plaid.transactionsReady = true;
    await delay(70);
    expect(updates).toBe(1);
    const partial = await home.load();
    expect(partial.spend.amount).toBeGreaterThan(0);

    // Stage 2: the full history. Announced again, then it stops checking.
    plaid.historyReady = true;
    await delay(70);
    expect(updates).toBe(2);
    // The chart's "last month" line now covers all of September, not just its last few days.
    const full = await home.load();
    expect(full.spend.chart.previous.at(-1)!).toBeGreaterThan(partial.spend.chart.previous.at(-1)!);
    const syncs = plaid.calls('/transactions/sync');
    await delay(70);
    expect(plaid.calls('/transactions/sync')).toBe(syncs);
    off();
  });
});

test('Accounts: one group per linked bank, live balances, money owed is negative', async () => {
  const accounts = await app.services.accounts.getAccounts();
  const [group] = accounts.groups;
  expect(accounts.groups).toHaveLength(1);
  expect(group.title).toBe('First Platypus Bank');
  const checking = group.accounts.find((a) => a.name === 'Plaid Checking')!;
  expect(checking.balance).toBe(110);
  expect(checking.subtitle).toBe('Checking ••0000');
  expect(group.accounts.find((a) => a.name === 'Plaid Credit Card')!.balance).toBe(-410);
  expect(checking.syncLabel).toContain('Plaid Sandbox');

  const empty = await (await sandboxServices({ linkBank: false })).services.accounts.getAccounts();
  expect(empty).toEqual({ groups: [], emptyMessage: NO_BANK_MESSAGE });
});

describe('Transactions', () => {
  const items = async (query: TransactionQuery = emptyQuery): Promise<TransactionItem[]> =>
    (await app.services.transactions.getGroups(query)).flatMap((g) => g.items);
  const search = (text: string, base: TransactionQuery = emptyQuery) => items({ ...base, search: text });
  const lastWeek: TransactionQuery = { ...emptyQuery, date: { id: '7d', label: 'Last 7 days' } };

  test('all 48 sandbox transactions, grouped by day with daily totals', async () => {
    const groups = await app.services.transactions.getGroups(emptyQuery);
    expect(groups.flatMap((g) => g.items)).toHaveLength(48);
    expect(groups[0].dayLabel).toBe('Oct 11');
    for (const g of groups) expect(g.total).toBeCloseTo(g.items.reduce((s, i) => s + i.amount, 0), 3);
    // Plaid's money-out (positive) becomes the app's negative.
    expect((await items()).find((i) => i.title === 'Uber')!.amount).toBe(-5.4);
  });

  test('filters by category, account and date; a category override moves a transaction', async () => {
    expect(await items({ ...emptyQuery, category: { id: 'food', label: 'Food & drink' } })).toHaveLength(9);
    const week = await app.services.transactions.getGroups(lastWeek);
    expect(week.length).toBeGreaterThan(0);
    expect(week.length).toBeLessThanOrEqual(7);
    const [firstAccount] = await app.services.transactions.getFilterChoices('account');
    expect((await items({ ...emptyQuery, account: firstAccount })).length).toBeGreaterThan(0);

    const uberId = (await items()).find((i) => i.title === 'Uber')!.id;
    await app.services.transactions.setCategories(uberId, ['food']);
    const detail = await app.services.transactions.getDetail(uberId);
    expect(detail.transaction.selectedCategoryIds).toEqual(['food']);
    expect(detail.transaction.accountLabel).toContain('••');
  });

  test('a transaction can have several categories; only the first (primary) counts in totals', async () => {
    const t = app.services.transactions;
    const uber = (await items()).find((i) => i.title === 'Uber')!; // Plaid: Transportation, $5.40 on Oct 11
    expect((await t.getDetail(uber.id)).transaction.selectedCategoryIds).toEqual(['transport']);
    const inCategory = (id: string, cats: { id: string; amount: number }[]) => cats.find((c) => c.id === id)?.amount ?? 0;
    const before = (await app.services.spending.getSpending(0)).categories;

    // Order kept (first = primary); duplicates and unknown ids dropped.
    await t.setCategories(uber.id, ['travel', 'transport', 'travel', 'nope']);
    expect((await t.getDetail(uber.id)).transaction.selectedCategoryIds).toEqual(['travel', 'transport']);
    // The row lists both, primary first.
    expect((await items()).find((i) => i.id === uber.id)!.subtitle.startsWith('Travel + Transportation')).toBe(true);
    // Filtering finds it under either category.
    for (const id of ['travel', 'transport']) {
      expect((await items({ ...emptyQuery, category: { id, label: id } })).some((i) => i.id === uber.id)).toBe(true);
    }
    // Totals: the full $5.40 moved to Travel (primary) and left Transportation; nothing double-counted.
    const after = await app.services.spending.getSpending(0);
    expect(inCategory('travel', after.categories)).toBeCloseTo(inCategory('travel', before) + 5.4, 3);
    expect(inCategory('transport', after.categories)).toBeCloseTo(inCategory('transport', before) - 5.4, 3);
    expect(after.total).toBeCloseTo(before.reduce((s, c) => s + c.amount, 0), 3);

    await expect(t.setCategories(uber.id, [])).rejects.toBeInstanceOf(AppException);
  });

  test('tapping a category adds it last or removes it; the last one stays', () => {
    const t = app.services.transactions;
    expect(t.toggledCategories(['food'], 'travel')).toEqual(['food', 'travel']);
    expect(t.toggledCategories(['food', 'travel'], 'food')).toEqual(['travel']); // the next one becomes primary
    expect(t.toggledCategories(['food'], 'food')).toBeUndefined();
  });

  test('a search can start from one category, named for the filter button', () => {
    const t = app.services.transactions;
    expect(t.queryForCategory()).toEqual(emptyQuery);
    expect(t.queryForCategory('food').category).toEqual({ id: 'food', label: 'Food & drink' });
  });

  test('categories and notes are kept in the database, per user', async () => {
    const uber = (await items()).find((i) => i.title === 'Uber')!;
    await app.services.transactions.setCategories(uber.id, ['travel']);
    await app.services.transactions.setNote(uber.id, '  Airport  ');
    const rows = await app.database.raw.getAllAsync<{ category_ids: string; note: string }>('SELECT * FROM transaction_annotations');
    expect(rows).toEqual([expect.objectContaining({ category_ids: '["travel"]', note: 'Airport' })]);
  });

  test('a friendly message while transactions are still loading', async () => {
    app.plaid.transactionsReady = false;
    await app.bankData.load({ refresh: true });
    await expect(app.services.transactions.getGroups(emptyQuery)).rejects.toThrow('still loading');
  });

  test('search: by merchant, ignoring case and extra spaces', async () => {
    const hits = await search('  uBeR ');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((i) => i.title === 'Uber')).toBe(true);
    expect(await search('')).toHaveLength(48); // no search: everything
  });

  test("search: by category name, account last digits, and the user's own notes", async () => {
    const travel = await search('travel');
    expect(travel.length).toBeGreaterThan(0);
    expect(travel.every((i) => i.subtitle.toLowerCase().includes('travel'))).toBe(true);
    expect((await search('0000')).length).toBeGreaterThan(0); // Plaid Checking ••0000
    const [target] = await search('uber');
    await app.services.transactions.setNote(target.id, 'Ride to the airport');
    expect((await search('airport')).map((i) => i.id)).toEqual([target.id]);
  });

  test('search: by amount, exact with cents or whole dollars', async () => {
    const [target] = await search('uber');
    const dollars = Math.abs(target.amount);
    const exact = await search(`$${dollars.toFixed(2)}`);
    expect(exact.map((i) => i.id)).toContain(target.id);
    expect(exact.every((i) => Math.abs(Math.abs(i.amount) - dollars) < 0.005)).toBe(true);
    const whole = await search(`${Math.floor(dollars)}`);
    expect(whole.map((i) => i.id)).toContain(target.id);
    expect(whole.every((i) => Math.floor(Math.abs(i.amount)) === Math.floor(dollars))).toBe(true);
  });

  test('search: every word must match; combines with the filters', async () => {
    const uber = await search('uber');
    expect((await search('uber travel')).length).toBeLessThanOrEqual(uber.length);
    expect(await search('uber zzzz-nothing')).toEqual([]);
    const recent = await search('uber', lastWeek);
    expect(recent.length).toBeLessThanOrEqual(uber.length);
    expect(recent.every((i) => i.title === 'Uber')).toBe(true);
  });
});

describe('Statements', () => {
  test('options: all accounts first, then each account with transactions; this month and the 5 before', async () => {
    const o = await app.services.statements.options();
    expect(o.accounts[0]).toEqual({ id: '', label: 'All accounts' });
    expect(o.accounts.map((a) => a.label)).toContain('Plaid Checking - 0000');
    expect(o.months.map((m) => m.id)).toEqual(['2026-10', '2026-09', '2026-08', '2026-07', '2026-06', '2026-05']);
    expect(o.months[0].label).toBe('October 2026');
    expect(await (await sandboxServices({ linkBank: false })).services.statements.options()).toEqual({ accounts: [], months: [] });
  });

  test("a month of posted transactions, oldest first, with the totals and the user's edits", async () => {
    const snap = await app.bankData.load();
    const sept = snap.transactions.filter((t) => !t.pending && t.date.getFullYear() === 2026 && t.date.getMonth() === 8);
    const target = sept[0];
    await app.services.transactions.setNote(target.transactionId, 'Team lunch, paid back');
    await app.services.transactions.setCategories(target.transactionId, ['travel', 'food']);

    const s = await app.services.statements.statement('', '2026-09');
    expect(s.lines).toHaveLength(sept.length);
    expect(s.periodLabel).toBe('September 2026');
    for (let i = 1; i < s.lines.length; i++) expect(s.lines[i].date >= s.lines[i - 1].date).toBe(true); // oldest first
    expect(s.lines.every((l) => l.date.getMonth() === 8)).toBe(true);
    expect(s.moneyIn).toBeCloseTo(sept.filter((t) => t.amount < 0).reduce((a, t) => a - t.amount, 0), 3);
    expect(s.moneyOut).toBeCloseTo(sept.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0), 3);
    const edited = s.lines.find((l) => l.note)!;
    expect(edited.note).toBe('Team lunch, paid back');
    expect(edited.category.startsWith('Travel')).toBe(true);

    const checking = (await app.services.statements.options()).accounts.find((a) => a.label === 'Plaid Checking - 0000')!;
    const one = await app.services.statements.statement(checking.id, '2026-09');
    expect(one.accountLabel).toBe('Plaid Checking - 0000');
    expect(one.lines.every((l) => l.account === 'Plaid Checking - 0000')).toBe(true);
    expect(one.lines.length).toBeLessThanOrEqual(s.lines.length);

    await expect(app.services.statements.statement('', '2026-13')).rejects.toBeInstanceOf(AppException);
  });

  test('CSV: a byte-order mark, a header row, one row per transaction, quoting cells with commas', async () => {
    const s = await app.services.statements.statement('', '2026-09');
    const csv = encodeCsv(s);
    expect(csv.startsWith('﻿')).toBe(true);
    const rows = csv.slice(1).trim().split('\r\n');
    expect(rows[0]).toBe('Date,Description,Category,Account,Amount,Note');
    expect(rows).toHaveLength(s.lines.length + 1);
    expect(rows[1].startsWith('2026-09-')).toBe(true);
    const quoted = encodeCsv({
      accountLabel: 'A', periodLabel: 'P', periodId: '2026-09', generatedOn: new Date(2026, 9, 12),
      lines: [{ date: new Date(2026, 8, 1), description: 'Coffee, "large"', category: 'Food', account: 'A', amount: -4.5, note: '' }],
      moneyIn: 0, moneyOut: 4.5,
    });
    expect(quoted.split('\r\n')[1]).toBe('2026-09-01,"Coffee, ""large""",Food,A,-4.50,');
  });

  test('PDF: a printable page with the totals and a row per transaction, text escaped', async () => {
    const s = await app.services.statements.statement('', '2026-09');
    const html = encodePdfHtml({ ...s, accountLabel: 'Checking <&>' });
    expect(html).toContain('Checking &lt;&amp;&gt;');
    expect(html).toContain(formatMoney(statementNet(s)).replace('−', ''));
    expect(html.match(/<tr>/g)).toHaveLength(s.lines.length + 1); // + the header row
  });

  test('download: saved where the user picks, named after the month and account; cancelling saves nothing', async () => {
    const statements = app.services.statements;
    expect(await statements.download('', '2026-09', 'pdf')).toBe('pace-statement-2026-09-all-accounts.pdf');
    expect(app.saver.saved[0].mimeType).toBe('application/pdf');
    const checking = (await statements.options()).accounts.find((a) => a.label === 'Plaid Checking - 0000')!;
    expect(await statements.download(checking.id, '2026-10', 'csv')).toBe('pace-statement-2026-10-plaid-checking-0000.csv');
    expect(app.saver.saved[1].mimeType).toBe('text/csv');
    app.saver.cancel = true;
    expect(await statements.download('', '2026-09', 'csv')).toBeUndefined();
    expect(app.saver.saved).toHaveLength(2);
  });
});

describe('Bills & recurring', () => {
  test('detected recurring payments are split into subscriptions and bills by category', async () => {
    const r = await app.services.bills.getRecurring();
    const byName = Object.fromEntries(r.items.map((i) => [i.name, i]));
    expect(byName['Touchstone Climbing'].kind).toBe('subscription'); // personal care
    expect(byName['CREDIT CARD 3333 PAYMENT *//'].kind).toBe('bill'); // loan & card payments
    expect(r.items.every((i) => !i.isManual)).toBe(true);
    expect(r.subscriptionsMonthly).toBeLessThanOrEqual(r.monthlyTotal);
  });

  test('price changes come from the last two charges the bank matched', async () => {
    const snap = await app.bankData.load();
    for (const item of (await app.services.bills.getRecurring()).items) {
      const stream = snap.recurring.find((s) => s.streamId === item.id)!;
      const charges = snap.transactions
        .filter((t) => stream.transactionIds.includes(t.transactionId))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((t) => Math.abs(t.amount));
      const changed = charges.length >= 2 && Math.abs(charges.at(-1)! - charges.at(-2)!) >= 0.01;
      expect(item.priceChangeLine !== undefined).toBe(changed);
      if (changed) expect(item.priceChangeLine).toContain(formatMoney(charges.at(-1)!));
    }
  });

  test('details: source account, payment history (newest first), and no edit / delete', async () => {
    const item = (await app.services.bills.getRecurring()).items.find((i) => i.name === 'Touchstone Climbing')!;
    const d = await app.services.bills.getDetail(item.id);
    expect(d.isManual).toBe(false);
    expect(d.sourceLabel.startsWith('Detected in Plaid')).toBe(true);
    expect(d.history.length).toBeGreaterThan(0);
    expect(d.history.every((p) => p.amount < 0)).toBe(true); // money out
    expect(app.services.bills.actionsFor(item)).not.toContain('edit');
    await expect(app.services.bills.deleteRecurring(item.id)).rejects.toBeInstanceOf(AppException);
  });

  test('upcoming bills come from Plaid recurring streams due in the next 30 days', async () => {
    const upcoming = await app.services.bills.getUpcoming();
    const items = upcoming.sections.flatMap((s) => s.items);
    // Due Oct 20, 20, 21, 26, Nov 7, Nov 9 (Nov 11 is past the 30-day window; income isn't a bill).
    expect(items).toHaveLength(6);
    expect(items[0].subtitle).toBe('Due Oct 20');
    expect(upcoming.summaryAmount).toBeCloseTo(items.reduce((s, b) => s + b.amount, 0), 3);
  });

  test('mark paid hides a bill; pausing removes it from the monthly total', async () => {
    const bills = app.services.bills;
    const [first] = await bills.upcomingWithDates();
    await bills.markPaid(first.bill.id);
    expect((await bills.upcomingWithDates()).some((u) => u.bill.id === first.bill.id)).toBe(false);

    const before = await bills.getRecurring();
    expect(before.items).toHaveLength(7);
    const climbing = before.items.find((i) => i.name === 'Touchstone Climbing')!;
    await bills.setSubscriptionPaused(climbing.id, true);
    const after = await bills.getRecurring();
    expect(after.monthlyTotal).toBeCloseTo(before.monthlyTotal - 78.5, 2);
    expect(after.yearlyTotal).toBeCloseTo(after.monthlyTotal * 12, 2);
    expect(after.items.at(-1)!.status).toBe('paused'); // paused ones last
  });
});

test('Spending: this month total and categories from sandbox transactions', async () => {
  const s = await app.services.spending.getSpending(0);
  expect(s.periodTitle).toBe('October spending');
  expect(s.total).toBeGreaterThan(0);
  expect(s.categories.reduce((t, c) => t + c.amount, 0)).toBeCloseTo(s.total, 3);
  expect(s.bars.reduce((t, b) => t + b.value, 0)).toBeCloseTo(s.total, 3);
  expect(s.categories.map((c) => c.id)).not.toContain('transfers');
  expect((await app.services.spending.getSpending(2)).total).toBeGreaterThan(s.total);
});

test('Spending by category: the same figures as the overview, for one category', async () => {
  for (const range of [0, 1, 2]) {
    const overview = await app.services.spending.getSpending(range);
    const [top] = overview.categories;
    const d = await app.services.spending.getCategoryDetail(top.id, range);
    expect(d.name).toBe(top.name);
    expect(d.periodTitle).toBe(overview.periodTitle);
    expect(d.amount).toBeCloseTo(top.amount, 3);
    expect(d.changePercent).toBe(top.changePercent);
    expect(d.shareOfTotal).toBeCloseTo(top.amount / overview.total, 4);
    expect(d.bars).toHaveLength(overview.bars.length); // same weeks / months as the overview
    expect(d.bars.reduce((t, b) => t + b.value, 0)).toBeCloseTo(d.amount, 3);
    expect(d.transactionCount).toBe(d.transactions.length);
    expect(-d.transactions.reduce((t, x) => t + x.amount, 0)).toBeCloseTo(d.amount, 3); // money out
    expect(d.averageAmount).toBeCloseTo(d.amount / d.transactionCount, 3);
    expect(d.largestAmount!).toBeLessThanOrEqual(d.amount);
  }
});

test('Spending by category: a category with nothing spent is empty, not an error', async () => {
  const d = await app.services.spending.getCategoryDetail('medical', 0);
  expect(d).toMatchObject({ amount: 0, transactions: [], averageAmount: undefined, largestAmount: undefined, shareOfTotal: 0 });
});

test('Budgets: 3 monthly periods; limits carry over, spending is per month', async () => {
  const budgets = app.services.budgets;
  const periods = await budgets.getPeriods();
  expect(periods.map((p) => p.label)).toEqual(['October', 'September', 'August']);
  expect(periods[0].isCurrent).toBe(true);
  const overview = await budgets.getOverview(periods[0].id);
  const spending = await app.services.spending.getSpending(0);
  for (const c of overview.categories) {
    expect(c.spent).toBeCloseTo(spending.categories.find((x) => x.id === c.id)?.amount ?? 0, 3);
  }
  const food = await budgets.getCategoryDetail('food', periods[0].id);
  expect(food.periodLabel).toBe('Spent in October');
  expect(food.paceHeadline).toBeTruthy();
  // The limits carry over to September; the spending is September's own.
  const september = await budgets.getOverview(periods[1].id);
  const limitsOf = (o: typeof overview) => Object.fromEntries(o.categories.map((c) => [c.id, c.limit]));
  expect(limitsOf(september)).toEqual(limitsOf(overview));
  expect(september.summary.limit).toBe(overview.summary.limit);
  expect(overview.summary.spent).toBeCloseTo(189.63, 3); // October 1-12
  expect(september.summary.spent).toBeCloseTo(2195.96, 3); // all of September
  const septemberFood = await budgets.getCategoryDetail('food', periods[1].id);
  expect(septemberFood.limit).toBe(food.limit);
  expect(septemberFood.periodLabel).toBe('Spent in September');
  expect(septemberFood.spent).not.toBeCloseTo(food.spent, 3);
});

test('Cash flow: starts from checking + savings, applies recurring payments', async () => {
  const cf = await app.services.cashFlow.getProjection(0, 1);
  expect(cf.breakdown[0].amount).toBe(300); // available: checking 100 + savings 200
  expect(cf.chart.values[0]).toBe(300);
  expect(cf.breakdown[2].amount).toBeGreaterThan(0); // bills in the next 30 days
  expect(cf.projectedAmount).toBeCloseTo(cf.chart.values.at(-1)!, 3);
  expect(cf.projectedDateLabel).toBe('Projected cash on Nov 11');
});

describe('Cash flow: expected income the user adds', () => {
  test('counts in full on its date when within the range, with its own removable line', async () => {
    const cashFlow = app.services.cashFlow;
    const before = await cashFlow.getProjection(0, 1);
    let changes = 0;
    const off = cashFlow.changes.subscribe(() => changes++);
    await cashFlow.addExpectedIncome({ name: ' Tax refund ', amount: '$1,200', date: new Date(2026, 9, 20) });
    await cashFlow.addExpectedIncome({ name: 'Bonus', amount: '500', date: new Date(2026, 11, 20) }); // after 30 days
    expect(changes).toBe(2);

    const after = await cashFlow.getProjection(0, 1);
    expect(after.projectedAmount).toBeCloseTo(before.projectedAmount + 1200, 3);
    const added = after.breakdown.filter((l) => l.expectedIncomeId);
    expect(added).toHaveLength(1);
    expect(added[0]).toMatchObject({ title: 'Tax refund', subtitle: 'Expected Oct 20 · added by you', amount: 1200 });
    // Not scaled by the income scenario: it's an amount the user knows.
    expect((await cashFlow.getProjection(0, 0)).breakdown.find((l) => l.expectedIncomeId)!.amount).toBe(1200);
    // The 90-day range includes the December bonus too.
    expect((await cashFlow.getProjection(2, 1)).breakdown.filter((l) => l.expectedIncomeId)).toHaveLength(2);

    await cashFlow.removeExpectedIncome(added[0].expectedIncomeId!);
    expect((await cashFlow.getProjection(0, 1)).projectedAmount).toBeCloseTo(before.projectedAmount, 3);
    off();
  });

  test('expected income can be dated today at the earliest', () => {
    expect(app.services.cashFlow.earliestIncomeDate()).toEqual(new Date(2026, 9, 12));
  });

  test('validates what is entered', async () => {
    const add = app.services.cashFlow.addExpectedIncome.bind(app.services.cashFlow);
    expect(await fieldErrors(() => add({ name: ' ', amount: '0', date: new Date(2026, 9, 11) }))).toEqual({
      name: 'Enter what the income is',
      amount: 'The amount must be at least $0.01',
      date: "Choose a date that isn't in the past",
    });
    expect((await fieldErrors(() => add({ name: 'X', amount: '5' }))).date).toBe('Choose when you expect it');
    expect((await fieldErrors(() => add({ name: 'X', amount: '5', date: new Date(2027, 9, 13) }))).date).toBe(
      'Choose a date within the next year',
    );
  });

  test('signed out, nothing can be added', async () => {
    await app.services.auth.signOut();
    await expect(app.services.cashFlow.addExpectedIncome({ name: 'X', amount: '5', date: new Date(2026, 9, 20) })).rejects.toBeInstanceOf(
      AppException,
    );
  });
});

test('Trends, notifications and the dashboard are built from the same sandbox data', async () => {
  const t = await app.services.trends.getTrends();
  expect(t.trends.length).toBeGreaterThan(0);
  expect(t.aboutText).toContain('Plaid Sandbox');
  // A spending trend leads to its category's transactions; an income trend to all of them.
  for (const trend of t.trends) {
    expect(app.services.trends.transactionFilterFor(trend.id)).toEqual(trend.direction === 'steady' ? {} : { category: trend.id });
  }

  const notifications = await app.services.notifications.getNotifications(0);
  for (const n of notifications.items) expect(['overdue', 'reminder', 'overBudget', 'nearLimit']).toContain(n.kind);

  const home = await app.services.dashboard.load();
  expect(home.dateLabel).toBe('Mon, Oct 12');
  expect(home.accounts.find((a) => a.id === 'checking')!.balance).toBe(110);
  expect(home.accounts.find((a) => a.id === 'cards')!.balance).toBe(410 + 5020);
  expect(home.recentTransactions).toHaveLength(4);
  expect(home.upcomingBills).toHaveLength(3);
  expect(home.spend.amount).toBeCloseTo((await app.services.spending.getSpending(0)).total, 3);
  // All of it from one fetch per endpoint.
  expect(app.plaid.calls('/transactions/sync')).toBe(1);
});

test('bills due within 3 days raise reminders that open that bill', async () => {
  app.clock.today = new Date(2026, 9, 18, 9); // two days before the Oct 20 bills
  const reminders = (await app.services.notifications.getNotifications(1)).items;
  expect(reminders.length).toBeGreaterThan(0);
  expect(reminders[0].kind).toBe('reminder');
  expect(reminders[0].title).toContain('in 2 days');
  expect(await app.services.notifications.open(reminders[0].id)).toEqual({ kind: 'bill', id: reminders[0].id.slice('reminder-'.length) });
});
