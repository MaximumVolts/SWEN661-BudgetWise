import { formatMoney } from './money';

/** A calendar month that can be compared. */
export interface ComparisonMonth {
  /** 'YYYY-MM' */
  id: string;
  /** "September 2026" */
  label: string;
  /** "Sep 2026" */
  shortLabel: string;
}

/** What one merchant cost in each month. */
export interface ComparisonMerchant {
  name: string;
  a: number;
  b: number;
}

/** One spending category in both months. */
export interface ComparisonRow {
  categoryId: string;
  name: string;
  iconKey: string;
  /** Spending in period A / B. */
  a: number;
  b: number;
  /** Biggest first (by the larger of the two months). */
  merchants: ComparisonMerchant[];
}

/** Every spending category in two months (A is usually the earlier one). */
export interface ComparisonData {
  periodA: ComparisonMonth;
  periodB: ComparisonMonth;
  /** One row per spending category, including ones with no spending (see showEmpty). */
  rows: ComparisonRow[];
}

export type TableDensity = 'comfortable' | 'compact';

/** How the comparison is shown (the Customize panel). */
export interface ComparisonOptions {
  // Data
  /** Categories to include; undefined = all of them. */
  categoryIds?: string[];
  /** Also list categories with no spending in either month. */
  showEmpty: boolean;
  showDollarChange: boolean;
  showPercentChange: boolean;
  /** Expanding a category lists its merchants. */
  expandableRows: boolean;
  decimals: 0 | 2;
  /** −$40 shown as ($40). */
  negativeInParentheses: boolean;
  // Visual
  showTitle: boolean;
  showPeriod: boolean;
  showSummary: boolean;
  density: TableDensity;
  showArrows: boolean;
  showTextLabels: boolean;
  showStatusColors: boolean;
  /** Stripes on the summary's change card, so the change reads without color. */
  summaryPatterns: boolean;
  /** Changes at least this many percent are highlighted; 0 highlights every change. */
  highlightPercent: number;
}

export const DEFAULT_COMPARISON_OPTIONS: ComparisonOptions = {
  showEmpty: false,
  showDollarChange: true,
  showPercentChange: true,
  expandableRows: true,
  decimals: 0,
  negativeInParentheses: false,
  showTitle: true,
  showPeriod: true,
  showSummary: true,
  density: 'comfortable',
  showArrows: true,
  showTextLabels: true,
  showStatusColors: true,
  summaryPatterns: false,
  highlightPercent: 10,
};

/** The highlight thresholds offered. */
export const HIGHLIGHT_CHOICES = [0, 5, 10, 25, 50];

/** "10%", or "Any change" for 0. */
export const highlightLabel = (percent: number) => (percent === 0 ? 'Any change' : `${percent}%`);

export type ChangeDirection = 'up' | 'down' | 'none';

/** How spending moved from A to B. */
export interface Change {
  amount: number;
  /** undefined when A was zero (no percentage to give). */
  percent?: number;
  direction: ChangeDirection;
}

export function changeBetween(a: number, b: number): Change {
  const amount = Math.round((b - a) * 100) / 100;
  return {
    amount,
    percent: a > 0 ? (amount / a) * 100 : undefined,
    direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'none',
  };
}

/** The rows the options select, in order. */
export function visibleRows(data: ComparisonData, o: ComparisonOptions): ComparisonRow[] {
  const chosen = o.categoryIds && new Set(o.categoryIds);
  return data.rows.filter((r) => (!chosen || chosen.has(r.categoryId)) && (o.showEmpty || r.a > 0 || r.b > 0));
}

export const totalsOf = (rows: ComparisonRow[]) => ({
  a: rows.reduce((s, r) => s + r.a, 0),
  b: rows.reduce((s, r) => s + r.b, 0),
});

/** Whether a change is big enough to highlight. */
export const isHighlighted = (c: Change, o: ComparisonOptions) =>
  c.direction !== 'none' && (c.percent === undefined || Math.abs(c.percent) >= o.highlightPercent);

/** An amount, with the options' decimals. */
export const comparisonMoney = (v: number, o: ComparisonOptions) => formatMoney(v, o.decimals);

/** A dollar change: "+$130", "−$40" or "($40)", "$0". */
export function formatChangeAmount(v: number, o: ComparisonOptions): string {
  if (v === 0) return formatMoney(0, o.decimals);
  const abs = formatMoney(Math.abs(v), o.decimals);
  if (v < 0) return o.negativeInParentheses ? `(${abs})` : `−${abs}`;
  return `+${abs}`;
}

/** A percent change: "+28.9%", "−18.2%" or "(18.2%)"; "New" when A was zero; "" for no change. */
export function formatChangePercent(c: Change, o: ComparisonOptions): string {
  if (c.direction === 'none') return '';
  if (c.percent === undefined) return 'New';
  const abs = `${Math.abs(c.percent).toFixed(1)}%`;
  if (c.percent < 0) return o.negativeInParentheses ? `(${abs})` : `−${abs}`;
  return `+${abs}`;
}

export const CHANGE_LABEL: Record<ChangeDirection, string> = { up: 'Up', down: 'Down', none: 'No change' };
