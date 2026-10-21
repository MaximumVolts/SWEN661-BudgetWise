import type { BillItem } from './bill';
import type { BudgetCategory, BudgetSummary } from './budget';
import type { TransactionItem } from './transaction';
import type { TrendItem } from './trend';

export type AccountTone = 'neutral' | 'alert' | 'accent';

export interface DashboardAccount {
  id: string;
  name: string;
  iconKey: string;
  balance: number;
  subtitle?: string;
  tone: AccountTone;
  hasInfo: boolean;
}

export interface SpendChartData {
  /** Spend so far this period, in order (solid line + lime area). */
  actual: number[];
  /** Projected continuation after the last [actual] point (dashed line). */
  projected: number[];
  /** Previous period for comparison (light line). */
  previous: number[];
}

export interface SpendSummary {
  title: string;
  amount: number;
  /** Absolute difference vs the previous period. */
  deltaAmount?: number;
  deltaIsAbove: boolean;
  /** "Sep 1–18" */
  deltaPeriodLabel?: string;
  chart: SpendChartData;
  /** "October" */
  currentLegend: string;
  /** "September" */
  previousLegend?: string;
}

export interface ReviewBanner {
  title: string;
  subtitle: string;
}

export interface ToolLink {
  id: string;
  iconKey: string;
  title: string;
  subtitle: string;
  accent?: boolean;
}

export interface DashboardData {
  dateLabel: string;
  hasUnreadNotifications: boolean;
  reviewBanner?: ReviewBanner;
  spend: SpendSummary;
  paydayLabel?: string;
  accounts: DashboardAccount[];
  lastSyncLabel?: string;
  recentTransactions: TransactionItem[];
  budget?: BudgetSummary;
  budgetCategories: BudgetCategory[];
  upcomingBills: BillItem[];
  featuredTrend?: TrendItem;
  featuredTrendSource?: string;
  tools: ToolLink[];
}
