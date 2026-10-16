import type { TransactionItem } from './transaction';

/** Where a budget stands. */
export type BudgetStatus = 'onTrack' | 'nearLimit' | 'over';

/** How each status is named everywhere it's shown. */
export const BUDGET_STATUS_LABEL: Record<BudgetStatus, string> = {
  onTrack: 'On track',
  nearLimit: 'Near limit',
  over: 'Over budget',
};

/** Spent against a limit. */
export interface BudgetProgress {
  spent: number;
  limit: number;
}

/** What's left (negative when over). */
export const remaining = (b: BudgetProgress) => b.limit - b.spent;
/** How full the bar is, 0–1. */
export const progress = (b: BudgetProgress) => (b.limit <= 0 ? 0 : Math.min(1, Math.max(0, b.spent / b.limit)));

export interface BudgetCategory extends BudgetProgress {
  id: string;
  name: string;
  iconKey: string;
  status: BudgetStatus;
}

export interface BudgetSummary extends BudgetProgress {
  periodLabel: string;
  status: BudgetStatus;
  /** Optional text like "Under budget · 77% used". */
  statusLabel?: string;
}

export interface BudgetCategoryDetailData extends BudgetProgress {
  name: string;
  /** "Spent in October" */
  periodLabel: string;
  status: BudgetStatus;
  paceHeadline?: string;
  paceBody?: string;
  recent: TransactionItem[];
}

export interface BudgetPeriod {
  /** 'YYYY-MM' */
  id: string;
  label: string;
  /** The period the service considers "current" (initially selected in the UI). */
  isCurrent: boolean;
}

export interface BudgetOverview {
  summary: BudgetSummary;
  categories: BudgetCategory[];
}

/** A saved budget: the monthly limit for one spending category. */
export interface BudgetSetting {
  categoryId: string;
  name: string;
  iconKey: string;
  monthlyLimit: number;
}
