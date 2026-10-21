export type AmountTone = 'neutral' | 'positive' | 'negative';

export interface CashFlowChartData {
  /** Projected cash balance per step, left → right. */
  values: number[];
  /** Labels spread evenly under the chart. */
  xLabels: string[];
  /** Horizontal gridline values (e.g. 2000, 3000, 4000). */
  gridValues: number[];
  /** Index in [values] of the lowest point to annotate. */
  lowIndex?: number;
  lowLabel?: string;
  endLabel?: string;
}

export interface BreakdownLine {
  title: string;
  subtitle: string;
  amount: number;
  tone: AmountTone;
  /** Set on a line for income the user added, so it can be removed. */
  expectedIncomeId?: string;
}

export interface CashFlowData {
  rangeLabels: string[];
  selectedRange: number;
  scenarioLabels: string[];
  selectedScenario: number;
  /** "Projected cash on Nov 17" */
  projectedDateLabel: string;
  projectedAmount: number;
  lowestAmount?: number;
  /** "around Oct 25, after your card payment" */
  lowestDescription?: string;
  chartTitle: string;
  chart: CashFlowChartData;
  breakdown: BreakdownLine[];
}

/** One-off money the user expects (a tax refund, a freelance payment…), added to the projection. */
export interface ExpectedIncome {
  id: string;
  name: string;
  amount: number;
  date: Date;
}
