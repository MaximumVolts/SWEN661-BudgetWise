import { AppException } from '../models/appException';
import { displayName } from '../models/bankData';
import {
  CHANGE_LABEL,
  changeBetween,
  type ComparisonData,
  type ComparisonMonth,
  type ComparisonOptions,
  comparisonMoney,
  type ComparisonRow,
  type Change,
  DEFAULT_COMPARISON_OPTIONS,
  formatChangeAmount,
  formatChangePercent,
  HIGHLIGHT_CHOICES,
  isHighlighted,
  totalsOf,
  visibleRows,
} from '../models/comparison';
import type { ReportPreferencesRepository } from '../repositories/reportPreferencesRepository';
import { STATEMENT_FORMAT_INFO, type StatementFile, type StatementFormat } from '../models/statement';
import type { StatementSaver } from '../repositories/statementSaver';
import { primaryCategory, SPENDING_CATEGORIES } from './bankCategories';
import { BankDataService, type BankServiceDeps } from './bankDataService';
import { spendingIn, sumAmounts } from './spendingService';
import { isoMonth, monthStart } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';

/**
 * Monthly Comparison: spending by category in two months side by side.
 * BUSINESS RULES: the same spending as Spending and Budgets (everyday money out, counted toward its
 * primary category); the months on offer; which months are compared at first; the exported file.
 */
export interface ComparisonService {
  /** Months that can be compared, newest first (this month first). */
  months(): Promise<ComparisonMonth[]>;
  /** What to compare at first: last month (A) against this month (B). */
  defaultPeriods(): { a: string; b: string };
  /** Spending in [aId] and [bId] ('YYYY-MM'), every spending category. */
  compare(aId: string, bId: string): Promise<ComparisonData>;
  /** Saves the comparison as shown with [options] (CSV, or HTML printed to PDF). Returns the file name, or undefined if cancelled. */
  download(data: ComparisonData, options: ComparisonOptions, format: StatementFormat): Promise<string | undefined>;

  // The Customize panel
  /** How the signed-in user last chose to see the comparison (the defaults if never, or signed out). */
  options(): Promise<ComparisonOptions>;
  /** Keeps [options] for the signed-in user and returns them as kept. Throws when there's a [problemWith] them. */
  saveOptions(options: ComparisonOptions): Promise<ComparisonOptions>;
  /** What "Reset to defaults" puts back. */
  defaultOptions(): ComparisonOptions;
  /** Why [options] can't be applied ("Choose at least one category."), or undefined if they can. */
  problemWith(options: ComparisonOptions): string | undefined;
  /**
   * The categories the panel offers: those with spending (every one when empty categories are
   * shown), plus any already chosen.
   */
  offeredCategories(data: ComparisonData | undefined, options: ComparisonOptions): ComparisonRow[];
  /** [options] with [categoryId] chosen or not; choosing every one of [allIds] (those offered) means "all categories". */
  toggleCategory(options: ComparisonOptions, categoryId: string, allIds: string[]): ComparisonOptions;
  /** [options] with every category chosen. */
  selectAllCategories(options: ComparisonOptions): ComparisonOptions;
  /** What the Categories field says: "All categories (5)", "3 categories". */
  categoriesLabel(data: ComparisonData | undefined, options: ComparisonOptions): string;
}

/**
 * Stored choices made safe to use: anything missing, of the wrong type or no longer offered falls
 * back to the default, and categories that no longer exist are dropped.
 */
export function sanitizeOptions(stored: unknown): ComparisonOptions {
  const s = (stored && typeof stored === 'object' ? stored : {}) as Record<string, unknown>;
  const d = DEFAULT_COMPARISON_OPTIONS;
  const flag = (k: keyof ComparisonOptions) => (typeof s[k] === 'boolean' ? (s[k] as boolean) : (d[k] as boolean));
  const known = new Set(SPENDING_CATEGORIES.map((c) => c.id));
  const ids = Array.isArray(s.categoryIds)
    ? [...new Set(s.categoryIds.filter((id): id is string => typeof id === 'string' && known.has(id)))]
    : undefined;
  return {
    categoryIds: ids?.length ? ids : undefined,
    showEmpty: flag('showEmpty'),
    showDollarChange: flag('showDollarChange'),
    showPercentChange: flag('showPercentChange'),
    expandableRows: flag('expandableRows'),
    decimals: s.decimals === 2 ? 2 : s.decimals === 0 ? 0 : d.decimals,
    negativeInParentheses: flag('negativeInParentheses'),
    showTitle: flag('showTitle'),
    showPeriod: flag('showPeriod'),
    showSummary: flag('showSummary'),
    density: s.density === 'compact' || s.density === 'comfortable' ? s.density : d.density,
    showArrows: flag('showArrows'),
    showTextLabels: flag('showTextLabels'),
    showStatusColors: flag('showStatusColors'),
    summaryPatterns: flag('summaryPatterns'),
    highlightPercent:
      typeof s.highlightPercent === 'number' && HIGHLIGHT_CHOICES.includes(s.highlightPercent) ? s.highlightPercent : d.highlightPercent,
  };
}

/** How far back months are offered. */
export const COMPARISON_MONTHS = 24;
const MONTH_ID = /^(\d{4})-(0[1-9]|1[0-2])$/;

const month = (start: Date): ComparisonMonth => ({
  id: isoMonth(start),
  label: `${DateLabels.monthName(start.getMonth() + 1)} ${start.getFullYear()}`,
  shortLabel: `${DateLabels.monthAbbr(start.getMonth() + 1)} ${start.getFullYear()}`,
});

function parseMonth(id: string): Date {
  const m = MONTH_ID.exec(id);
  if (!m) throw new AppException(`"${id}" is not a month.`);
  return new Date(Number(m[1]), Number(m[2]) - 1, 1);
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const html = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** [ComparisonService] over the linked banks' transactions from Plaid (sandbox). */
export class PlaidComparisonService extends BankDataService implements ComparisonService {
  private readonly saver: StatementSaver;
  private readonly preferences: ReportPreferencesRepository;

  constructor(deps: BankServiceDeps & { saver: StatementSaver; preferences: ReportPreferencesRepository }) {
    super(deps);
    this.saver = deps.saver;
    this.preferences = deps.preferences;
  }

  async options(): Promise<ComparisonOptions> {
    const userId = this.currentUserId();
    return userId === undefined ? DEFAULT_COMPARISON_OPTIONS : sanitizeOptions(await this.preferences.load(userId, 'comparison'));
  }

  async saveOptions(options: ComparisonOptions): Promise<ComparisonOptions> {
    const problem = this.problemWith(options);
    if (problem) throw new AppException(problem);
    const kept = sanitizeOptions(options);
    const userId = this.currentUserId();
    if (userId !== undefined) await this.preferences.save(userId, 'comparison', kept);
    return kept;
  }

  defaultOptions(): ComparisonOptions {
    return DEFAULT_COMPARISON_OPTIONS;
  }

  problemWith(options: ComparisonOptions): string | undefined {
    if (options.categoryIds?.length === 0) return 'Choose at least one category.';
    return undefined;
  }

  offeredCategories(data: ComparisonData | undefined, options: ComparisonOptions): ComparisonRow[] {
    return (data?.rows ?? []).filter((r) => options.showEmpty || r.a > 0 || r.b > 0 || options.categoryIds?.includes(r.categoryId));
  }

  toggleCategory(options: ComparisonOptions, categoryId: string, allIds: string[]): ComparisonOptions {
    // Chosen categories that aren't offered (no spending now) count as not chosen.
    const chosen = new Set((options.categoryIds ?? allIds).filter((id) => allIds.includes(id)));
    if (chosen.has(categoryId)) chosen.delete(categoryId);
    else chosen.add(categoryId);
    const all = allIds.every((id) => chosen.has(id));
    return { ...options, categoryIds: all ? undefined : allIds.filter((id) => chosen.has(id)) };
  }

  selectAllCategories(options: ComparisonOptions): ComparisonOptions {
    return { ...options, categoryIds: undefined };
  }

  categoriesLabel(data: ComparisonData | undefined, options: ComparisonOptions): string {
    const chosen = options.categoryIds;
    if (chosen) return `${chosen.length} categor${chosen.length === 1 ? 'y' : 'ies'}`;
    const rows = data?.rows ?? [];
    const shown = options.showEmpty ? rows.length : rows.filter((r) => r.a > 0 || r.b > 0).length;
    return `All categories (${shown})`;
  }

  async months(): Promise<ComparisonMonth[]> {
    const now = this.currentDate();
    return Array.from({ length: COMPARISON_MONTHS }, (_, i) => month(monthStart(now, -i)));
  }

  defaultPeriods() {
    const now = this.currentDate();
    return { a: isoMonth(monthStart(now, -1)), b: isoMonth(monthStart(now)) };
  }

  async compare(aId: string, bId: string): Promise<ComparisonData> {
    const a = parseMonth(aId);
    const b = parseMonth(bId);
    const snap = await this.bankData.load();
    if (!snap.transactionsReady && !snap.transactions.length) {
      throw new AppException("Your test bank's transactions are still loading. Try again in a few seconds.");
    }
    const overrides = await this.overrides();
    const inA = spendingIn(snap, overrides, a, monthStart(a, 1));
    const inB = spendingIn(snap, overrides, b, monthStart(b, 1));

    const rows: ComparisonRow[] = SPENDING_CATEGORIES.map((cat) => {
      const ofCat = (ts: typeof inA) => ts.filter((t) => primaryCategory(t, overrides).id === cat.id);
      const ta = ofCat(inA);
      const tb = ofCat(inB);
      const merchants = new Map<string, { a: number; b: number }>();
      for (const [ts, key] of [
        [ta, 'a'],
        [tb, 'b'],
      ] as const) {
        for (const t of ts) {
          const name = displayName(t);
          const m = merchants.get(name) ?? { a: 0, b: 0 };
          m[key] += t.amount;
          merchants.set(name, m);
        }
      }
      return {
        categoryId: cat.id,
        name: cat.name,
        iconKey: cat.iconKey,
        a: sumAmounts(ta),
        b: sumAmounts(tb),
        merchants: [...merchants.entries()]
          .map(([name, m]) => ({ name, ...m }))
          .sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b)),
      };
    });
    // Biggest spending first; empty categories last, alphabetically.
    rows.sort((x, y) => Math.max(y.a, y.b) - Math.max(x.a, x.b) || x.name.localeCompare(y.name));
    return { periodA: month(a), periodB: month(b), rows };
  }

  async download(data: ComparisonData, options: ComparisonOptions, format: StatementFormat) {
    const file: StatementFile = {
      fileName: `pace-comparison-${data.periodA.id}-vs-${data.periodB.id}.${STATEMENT_FORMAT_INFO[format].extension}`,
      mimeType: STATEMENT_FORMAT_INFO[format].mimeType,
      format,
      content: format === 'csv' ? comparisonCsv(data, options) : comparisonHtml(data, options),
    };
    return (await this.saver.save(file)) ? file.fileName : undefined;
  }
}

/** A change as text, with the options' indicators: "↑ Up +28.9%", "Down −18.2%", "No change". */
function changeText(c: Change, o: ComparisonOptions, arrows: boolean): string {
  if (c.direction === 'none') return `${arrows && o.showArrows ? '— ' : ''}${CHANGE_LABEL.none}`;
  const arrow = arrows && o.showArrows ? (c.direction === 'up' ? '↑ ' : '↓ ') : '';
  const label = o.showTextLabels ? `${CHANGE_LABEL[c.direction]} ` : '';
  return `${arrow}${label}${formatChangePercent(c, o)}`;
}

interface Column {
  label: string;
  value: (a: number, b: number) => string;
  /** CSS classes for the printed cell. */
  classes?: (a: number, b: number) => string;
}

/** The table's columns with [options] ([arrows]: include the arrow icons, for the printed page). */
function columns(data: ComparisonData, o: ComparisonOptions, arrows: boolean): Column[] {
  const cols: Column[] = [
    { label: data.periodA.shortLabel, value: (a) => comparisonMoney(a, o) },
    { label: data.periodB.shortLabel, value: (_, b) => comparisonMoney(b, o) },
  ];
  if (o.showDollarChange) cols.push({ label: '$ Change', value: (a, b) => formatChangeAmount(changeBetween(a, b).amount, o) });
  if (o.showPercentChange)
    cols.push({
      label: '% Change',
      value: (a, b) => changeText(changeBetween(a, b), o, arrows),
      classes: (a, b) => {
        const c = changeBetween(a, b);
        return [o.showStatusColors && c.direction !== 'none' ? c.direction : '', isHighlighted(c, o) ? 'hl' : ''].filter(Boolean).join(' ');
      },
    });
  return cols;
}

/** CSV: one line per category (and its merchants when rows expand), then the total. */
export function comparisonCsv(data: ComparisonData, o: ComparisonOptions): string {
  const cols = columns(data, o, false);
  const rows = visibleRows(data, o);
  const total = totalsOf(rows);
  const line = (name: string, a: number, b: number) => [name, ...cols.map((c) => c.value(a, b))].map(csvCell).join(',');
  const lines = [['Spending category', ...cols.map((c) => c.label)].map(csvCell).join(',')];
  for (const r of rows) {
    lines.push(line(r.name, r.a, r.b));
    if (o.expandableRows) for (const m of r.merchants) lines.push(line(`  ${m.name}`, m.a, m.b));
  }
  lines.push(line('Total spending', total.a, total.b));
  return `${lines.join('\n')}\n`;
}

/** A printable page (saved as PDF), laid out with the Customize panel's choices. */
export function comparisonHtml(data: ComparisonData, o: ComparisonOptions): string {
  const cols = columns(data, o, true);
  const rows = visibleRows(data, o);
  const total = totalsOf(rows);
  const change = changeBetween(total.a, total.b);
  const tr = (name: string, a: number, b: number, cls = '') =>
    `<tr class="${cls}"><td>${html(name)}</td>${cols
      .map((c) => `<td class="${['n', c.classes?.(a, b) ?? ''].filter(Boolean).join(' ')}">${html(c.value(a, b))}</td>`)
      .join('')}</tr>`;
  const body = rows
    .map((r) => tr(r.name, r.a, r.b, 'cat') + (o.expandableRows ? r.merchants.map((m) => tr(m.name, m.a, m.b, 'sub')).join('') : ''))
    .join('');
  const tint = o.showStatusColors && change.direction !== 'none' ? ` ${change.direction}` : '';
  const card = (label: string, value: string, extra = '', cls = '') =>
    `<div class="card${cls}"><div class="muted">${html(label)}</div><div class="big">${html(value)}</div>${extra}</div>`;
  const summary = o.showSummary
    ? `<div class="cards">${card(`Total spending · ${data.periodA.shortLabel}`, comparisonMoney(total.a, o))}${card(
        `Total spending · ${data.periodB.shortLabel}`,
        comparisonMoney(total.b, o),
      )}${card('Change', formatChangeAmount(change.amount, o), `<div>${html(changeText(change, o, true))}</div>`, `${tint}${o.summaryPatterns ? ' pattern' : ''}`)}</div>`
    : '';
  const pad = o.density === 'compact' ? '5px 8px' : '10px';
  return `<!doctype html><html><head><meta charset="utf-8"><title>Pace · Monthly Comparison</title>
<style>
body{font-family:Roboto,Arial,sans-serif;color:#1a1a1a;margin:40px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:24px;font-weight:500;margin:0 0 4px}.muted{color:#5b5a55;font-size:13px}
.cards{display:flex;gap:16px;margin-top:24px}.card{flex:1;border:1px solid #d3d1c9;border-radius:12px;padding:14px 16px}
.big{font-size:24px;font-weight:500;margin-top:2px}.card.up{border-color:#b3261e;background:#fbe9e7}.card.down{border-color:#5a6b1f;background:#f1f6d8}
.card.pattern{border-style:dashed;background-image:repeating-linear-gradient(45deg,rgba(26,26,26,.07) 0 6px,transparent 6px 12px)}
table{width:100%;border-collapse:collapse;margin-top:24px;font-size:13px}
th{text-align:left;background:#ebeae4;padding:${pad};font-size:12px;letter-spacing:.4px;text-transform:uppercase}
td{padding:${pad};border-bottom:1px solid #d3d1c9}.n{text-align:right}th:not(:first-child){text-align:right}
td.up{color:#b3261e}td.down{color:#5a6b1f}td.hl{font-weight:700;background:#f3f2ec}td.hl.up{background:#fbe9e7}td.hl.down{background:#f1f6d8}
tr.cat td{font-weight:600}tr.sub td{font-weight:400}tr.sub td:first-child{padding-left:28px;color:#5b5a55}
tr.total td{font-weight:700;background:#f3f2ec;border-top:2px solid #1a1a1a}
</style></head><body>
${o.showTitle ? '<h1>Spending by Category</h1>' : ''}
${o.showPeriod ? `<div class="muted">${html(data.periodA.label)} vs ${html(data.periodB.label)}</div>` : ''}
${summary}
<table><thead><tr><th>Spending category</th>${cols.map((c) => `<th>${html(c.label)}</th>`).join('')}</tr></thead>
<tbody>${body}${tr('Total spending', total.a, total.b, 'total')}</tbody></table>
</body></html>`;
}
