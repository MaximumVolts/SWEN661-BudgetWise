export interface GoalContribution {
  dateLabel: string;
  amount: number;
}

/**
 * Fields are optional so a partially-populated goal from storage still renders; screens show a
 * "missing data" placeholder for anything that's undefined.
 */
export interface SavingsGoal {
  id: string;
  name?: string;
  subtitle?: string;
  iconKey: string;
  saved?: number;
  target?: number;
  tip?: string;
  /** Substring of [tip] to render in bold. */
  tipHighlight?: string;
  contributions: GoalContribution[];
  /** When the user wants to reach [target], if they chose a date. */
  targetDate?: Date;
}

/** False when saved or target is unknown, so progress can't be computed. */
export const hasProgress = (g: SavingsGoal) => g.saved !== undefined && g.target !== undefined;
export const goalProgress = (g: SavingsGoal) =>
  !hasProgress(g) || g.target! <= 0 ? 0 : Math.min(1, Math.max(0, g.saved! / g.target!));
export const goalRemaining = (g: SavingsGoal) => (hasProgress(g) ? g.target! - g.saved! : undefined);

export interface SavingsGoalsData {
  /** undefined => no total available (e.g. no goals found). */
  totalSaved?: number;
  subtitle?: string;
  goals: SavingsGoal[];
}

export const EMPTY_GOALS: SavingsGoalsData = { goals: [] };

/** An icon a goal can have, with a name for screen readers. */
export interface GoalIcon {
  key: string;
  label: string;
}
