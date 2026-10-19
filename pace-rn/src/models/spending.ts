import type { TransactionItem } from './transaction';

export interface BarDatum {
  /** x-axis label ('' to hide) */
  label: string;
  value: number;
  /** Spoken description, e.g. "Week of Oct 5". */
  semanticLabel?: string;
}

export interface SpendingCategory {
  id: string;
  name: string;
  iconKey: string;
  amount: number;
  /** undefined => "No change". */
  changePercent?: number;
  /** 0..1 share used for the small bar. */
  share: number;
}

export interface SpendingData {
  /** ['Month','3 months','Year'] */
  rangeLabels: string[];
  selectedRange: number;
  /** "October spending" */
  periodTitle: string;
  total: number;
  changePercent?: number;
  bars: BarDatum[];
  highlightedBar?: number;
  categories: SpendingCategory[];
}

/** One spending category over the period chosen on Spending (Spending → a category). */
export interface SpendingCategoryDetailData {
  id: string;
  name: string;
  iconKey: string;
  /** e.g. "October spending" / "Aug–Oct spending" / "2026 spending". */
  periodTitle: string;
  amount: number;
  /** % change from the period just before; undefined => nothing to compare with. */
  changePercent?: number;
  /** This category's share of all spending in the period, 0..1. */
  shareOfTotal: number;
  /** The same bars as on Spending (weeks or months), for this category only. */
  bars: BarDatum[];
  highlightedBar?: number;
  transactionCount: number;
  /** undefined when there are no transactions. */
  averageAmount?: number;
  largestAmount?: number;
  /** Newest first. */
  transactions: TransactionItem[];
}
