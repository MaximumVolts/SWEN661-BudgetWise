import { AppException } from '@/models/appException';
import {
  changeBetween,
  DEFAULT_COMPARISON_OPTIONS,
  formatChangeAmount,
  formatChangePercent,
  isHighlighted,
  totalsOf,
  visibleRows,
} from '@/models/comparison';
import { COMPARISON_MONTHS, sanitizeOptions } from '@/services/comparisonService';
import { DemoOnboardingService } from '@/services/onboardingService';
import { isDesktop } from '@/ui/responsive';
import { type SandboxApp, sandboxServices } from './support/sandbox';

jest.setTimeout(30000);

let app: SandboxApp;
beforeEach(async () => {
  app = await sandboxServices();
});
afterEach(() => app.bankData.stopRetrying());

describe('Monthly Comparison (ComparisonService)', () => {
  test('offers this month and the ones before it, and compares last month with this one at first', async () => {
    const months = await app.services.comparison.months();
    expect(months).toHaveLength(COMPARISON_MONTHS);
    expect(months[0]).toEqual({ id: '2026-10', label: 'October 2026', shortLabel: 'Oct 2026' });
    expect(months[1].id).toBe('2026-09');
    expect(app.services.comparison.defaultPeriods()).toEqual({ a: '2026-09', b: '2026-10' });
  });

  test("counts the same spending as Spending: this month's total matches", async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    const spending = await app.services.spending.getSpending(0); // this month so far (fixtures end before today)
    expect(totalsOf(data.rows).b).toBeCloseTo(spending.total, 2);
    expect(data.periodA.label).toBe('September 2026');
    expect(data.periodB.label).toBe('October 2026');
  });

  test('every spending category has a row; merchants add up to their category', async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    const ids = data.rows.map((r) => r.categoryId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain('transfers');
    expect(ids).not.toContain('income');
    for (const r of data.rows) {
      expect(r.merchants.reduce((s, m) => s + m.a, 0)).toBeCloseTo(r.a, 2);
      expect(r.merchants.reduce((s, m) => s + m.b, 0)).toBeCloseTo(r.b, 2);
    }
    // Biggest spending first.
    const biggest = data.rows.map((r) => Math.max(r.a, r.b));
    expect(biggest).toEqual([...biggest].sort((x, y) => y - x));
  });

  test('the options choose the rows: only categories with spending, or a chosen few', async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    const withSpending = visibleRows(data, DEFAULT_COMPARISON_OPTIONS);
    expect(withSpending.length).toBeGreaterThan(0);
    expect(withSpending.every((r) => r.a > 0 || r.b > 0)).toBe(true);
    expect(visibleRows(data, { ...DEFAULT_COMPARISON_OPTIONS, showEmpty: true })).toHaveLength(data.rows.length);
    const one = withSpending[0].categoryId;
    expect(visibleRows(data, { ...DEFAULT_COMPARISON_OPTIONS, categoryIds: [one] }).map((r) => r.categoryId)).toEqual([one]);
  });

  test('a month that is not a month is refused', async () => {
    await expect(app.services.comparison.compare('2026-13', '2026-10')).rejects.toBeInstanceOf(AppException);
  });

  test('downloads the comparison as shown: CSV with the chosen columns and number format', async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    const options = { ...DEFAULT_COMPARISON_OPTIONS, decimals: 2 as const, negativeInParentheses: true, showPercentChange: false };
    const name = await app.services.comparison.download(data, options, 'csv');
    expect(name).toBe('pace-comparison-2026-09-vs-2026-10.csv');
    const file = app.saver.saved.at(-1)!;
    expect(file.mimeType).toBe('text/csv');
    const lines = file.content.trim().split('\n');
    expect(lines[0]).toBe('Spending category,Sep 2026,Oct 2026,$ Change');
    // Amounts with a thousands separator are quoted, as CSV requires.
    expect(lines.at(-1)).toBe('Total spending,"$2,195.96",$189.63,"($2,006.33)"');
    // A category that went down shows its change in parentheses.
    const down = visibleRows(data, options).find((r) => r.b < r.a);
    if (down) expect(file.content).toContain(`(${formatChangeAmount(down.b - down.a, { ...options, negativeInParentheses: false }).slice(1)})`);
  });

  test('downloads a printable PDF page with the names escaped', async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    await app.services.comparison.download(data, DEFAULT_COMPARISON_OPTIONS, 'pdf');
    const file = app.saver.saved.at(-1)!;
    expect(file.fileName).toBe('pace-comparison-2026-09-vs-2026-10.pdf');
    expect(file.content).toContain('<h1>Spending by Category</h1>');
    expect(file.content).toContain('September 2026 vs October 2026');
    expect(file.content).not.toMatch(/<td>[^<]*&(?!amp;|lt;|gt;|quot;)/);
  });

  test('a cancelled save returns nothing', async () => {
    const data = await app.services.comparison.compare('2026-09', '2026-10');
    app.saver.cancel = true;
    expect(await app.services.comparison.download(data, DEFAULT_COMPARISON_OPTIONS, 'csv')).toBeUndefined();
  });
});

describe('Customize panel (ComparisonService)', () => {
  test('choices are kept for the signed-in user, and the defaults apply until then', async () => {
    const comparison = app.services.comparison;
    expect(await comparison.options()).toEqual(DEFAULT_COMPARISON_OPTIONS);
    const mine = { ...DEFAULT_COMPARISON_OPTIONS, categoryIds: ['food', 'shopping'], decimals: 2 as const, density: 'compact' as const, highlightPercent: 25, showSummary: false };
    expect(await comparison.saveOptions(mine)).toEqual(mine);
    expect(await comparison.options()).toEqual(mine);
    await app.services.auth.signOut();
    expect(await comparison.options()).toEqual(DEFAULT_COMPARISON_OPTIONS);
  });

  test('no categories at all cannot be applied', async () => {
    const none = { ...DEFAULT_COMPARISON_OPTIONS, categoryIds: [] };
    expect(app.services.comparison.problemWith(none)).toBe('Choose at least one category.');
    await expect(app.services.comparison.saveOptions(none)).rejects.toBeInstanceOf(AppException);
    expect(app.services.comparison.problemWith(DEFAULT_COMPARISON_OPTIONS)).toBeUndefined();
  });

  test('stored choices that are out of date or damaged fall back to the defaults', () => {
    expect(sanitizeOptions(undefined)).toEqual(DEFAULT_COMPARISON_OPTIONS);
    expect(sanitizeOptions('nonsense')).toEqual(DEFAULT_COMPARISON_OPTIONS);
    const odd = sanitizeOptions({ decimals: 3, density: 'huge', highlightPercent: 7, showTitle: 'no', categoryIds: ['food', 'gone', 4, 'food'] });
    expect(odd).toEqual({ ...DEFAULT_COMPARISON_OPTIONS, categoryIds: ['food'] });
    expect(sanitizeOptions({ categoryIds: ['gone'] }).categoryIds).toBeUndefined(); // none left = all
  });

  test('choosing categories: unticking one picks the rest; ticking every one means all', () => {
    const comparison = app.services.comparison;
    const all = ['food', 'shopping', 'travel'];
    const two = comparison.toggleCategory(DEFAULT_COMPARISON_OPTIONS, 'shopping', all);
    expect(two.categoryIds).toEqual(['food', 'travel']);
    expect(comparison.toggleCategory(two, 'shopping', all).categoryIds).toBeUndefined();
    expect(comparison.selectAllCategories(two).categoryIds).toBeUndefined();
    expect(comparison.defaultOptions()).toEqual(DEFAULT_COMPARISON_OPTIONS);
  });

  test('the Categories field counts what is shown', async () => {
    const comparison = app.services.comparison;
    const data = await comparison.compare('2026-09', '2026-10');
    const withSpending = data.rows.filter((r) => r.a > 0 || r.b > 0).length;
    expect(comparison.categoriesLabel(data, DEFAULT_COMPARISON_OPTIONS)).toBe(`All categories (${withSpending})`);
    expect(comparison.categoriesLabel(data, { ...DEFAULT_COMPARISON_OPTIONS, showEmpty: true })).toBe(`All categories (${data.rows.length})`);
    expect(comparison.categoriesLabel(data, { ...DEFAULT_COMPARISON_OPTIONS, categoryIds: ['food'] })).toBe('1 category');
  });

  test('the printed report follows the formatting choices', async () => {
    const comparison = app.services.comparison;
    const data = await comparison.compare('2026-09', '2026-10');
    await comparison.download(data, DEFAULT_COMPARISON_OPTIONS, 'pdf');
    const full = app.saver.saved.at(-1)!.content;
    expect(full).toContain('class="cards"');
    expect(full).toMatch(/[↑↓] (Up|Down) /);

    const plain = { ...DEFAULT_COMPARISON_OPTIONS, showTitle: false, showPeriod: false, showSummary: false, showArrows: false, showTextLabels: false, showStatusColors: false, density: 'compact' as const };
    await comparison.download(data, plain, 'pdf');
    const bare = app.saver.saved.at(-1)!.content;
    expect(bare).not.toContain('<h1>');
    expect(bare).not.toContain('September 2026 vs October 2026');
    expect(bare).not.toContain('class="cards"');
    expect(bare).not.toMatch(/[↑↓]|>(Up|Down) /);
    expect(bare).not.toMatch(/class="n (up|down)/);
    expect(bare).toContain('padding:5px 8px');

    await comparison.download(data, { ...DEFAULT_COMPARISON_OPTIONS, summaryPatterns: true }, 'pdf');
    expect(app.saver.saved.at(-1)!.content).toMatch(/class="card[^"]* pattern"/);
  });

  test('the CSV leaves out the arrows, and the Up / Down labels when they are off', async () => {
    const comparison = app.services.comparison;
    const data = await comparison.compare('2026-09', '2026-10');
    await comparison.download(data, DEFAULT_COMPARISON_OPTIONS, 'csv');
    const withLabels = app.saver.saved.at(-1)!.content;
    expect(withLabels).not.toMatch(/[↑↓]/);
    expect(withLabels).toMatch(/,(Up|Down) /);
    await comparison.download(data, { ...DEFAULT_COMPARISON_OPTIONS, showTextLabels: false }, 'csv');
    expect(app.saver.saved.at(-1)!.content).not.toMatch(/,(Up|Down) /);
  });
});

describe('comparison formatting (models/comparison)', () => {
  const o = DEFAULT_COMPARISON_OPTIONS;

  test('changes carry a sign, and a percentage when there was spending before', () => {
    expect(changeBetween(450, 580)).toEqual({ amount: 130, percent: (130 / 450) * 100, direction: 'up' });
    expect(changeBetween(220, 180).direction).toBe('down');
    expect(changeBetween(0, 50)).toEqual({ amount: 50, percent: undefined, direction: 'up' });
    expect(changeBetween(1500, 1500).direction).toBe('none');
  });

  test('amounts and percentages follow the number format', () => {
    expect(formatChangeAmount(130, o)).toBe('+$130');
    expect(formatChangeAmount(-40, o)).toBe('−$40');
    expect(formatChangeAmount(-40, { ...o, negativeInParentheses: true })).toBe('($40)');
    expect(formatChangeAmount(-40.5, { ...o, decimals: 2 })).toBe('−$40.50');
    expect(formatChangeAmount(0, o)).toBe('$0');
    expect(formatChangePercent(changeBetween(450, 580), o)).toBe('+28.9%');
    expect(formatChangePercent(changeBetween(220, 180), { ...o, negativeInParentheses: true })).toBe('(18.2%)');
    expect(formatChangePercent(changeBetween(0, 10), o)).toBe('New');
    expect(formatChangePercent(changeBetween(5, 5), o)).toBe('');
  });

  test('only changes at or over the threshold are highlighted', () => {
    expect(isHighlighted(changeBetween(100, 111), o)).toBe(true); // 11% ≥ 10%
    expect(isHighlighted(changeBetween(100, 105), o)).toBe(false);
    expect(isHighlighted(changeBetween(100, 105), { ...o, highlightPercent: 0 })).toBe(true);
    expect(isHighlighted(changeBetween(0, 5), o)).toBe(true); // new spending
    expect(isHighlighted(changeBetween(5, 5), { ...o, highlightPercent: 0 })).toBe(false);
  });
});

describe('desktop layout and journey', () => {
  test('the desktop layout is for the desktop (web) build in a wide window only', () => {
    expect(isDesktop('web', 1280)).toBe(true);
    expect(isDesktop('web', 1024)).toBe(true);
    expect(isDesktop('web', 900)).toBe(false);
    expect(isDesktop('ios', 1366)).toBe(false);
    expect(isDesktop('android', 2000)).toBe(false);
  });

  test('choosing not to connect a bank yet goes straight into the app', () => {
    expect(new DemoOnboardingService().skipBankLink()).toBe('home');
  });
});
