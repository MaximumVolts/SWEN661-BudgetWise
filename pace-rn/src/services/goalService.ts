import { AppException, FieldValidationException } from '../models/appException';
import { EMPTY_GOALS, goalRemaining, type GoalIcon, type SavingsGoal, type SavingsGoalsData } from '../models/goal';
import { formatMoney } from '../models/money';
import { Emitter, type Subscribable } from '../utils/events';
import type { GoalRepository } from '../repositories/goalRepository';
import { dateOnly, isBefore } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';
import { compactErrors, Validators } from './validators';

export interface NewGoalInput {
  name: string;
  /** As typed ("1500", "$250.50"). */
  target: string;
  /** As typed; may be empty. */
  saved: string;
  targetDate?: Date;
  iconKey?: string;
}

export interface GoalService {
  getGoals(): Promise<SavingsGoalsData>;
  /** Adds [amount] as typed ("50", "$12.50") to the goal. Throws AppException when it isn't a valid amount. */
  addContribution(goalId: string, amount: string): Promise<void>;
  /** The earliest target date a new goal can have (today: target dates can't be in the past). */
  earliestTargetDate(): Date;
  /** Icons a goal can have (the first is the default). */
  readonly icons: readonly GoalIcon[];
  /** Throws FieldValidationException ('name', 'target', 'saved', 'targetDate', 'icon'). */
  addGoal(input: NewGoalInput): Promise<void>;
  /** Emits after a goal is added or changed. */
  readonly changes: Subscribable;
}

const MAX_NAME = 40;
const MAX_TARGET = 10_000_000;

export const GOAL_ICONS: readonly GoalIcon[] = [
  { key: 'savings', label: 'Piggy bank' },
  { key: 'home', label: 'Home' },
  { key: 'car', label: 'Car' },
  { key: 'laptop', label: 'Laptop' },
  { key: 'shield', label: 'Emergency fund' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'play', label: 'Fun' },
  { key: 'wallet', label: 'Other' },
];

/**
 * [GoalService] backed by a [GoalRepository], for the signed-in user.
 * BUSINESS RULES: total saved across goals, the summary line, and applying contributions; a new
 * goal has a name of up to 40 characters, a target of $1–$10,000,000, an amount already saved from
 * $0 up to the target, and an optional target date that isn't in the past; a goal with a target
 * date and money still to save suggests how much to save each month to reach it.
 */
export class RepositoryGoalService implements GoalService {
  readonly icons = GOAL_ICONS;
  readonly changes = new Emitter();
  private readonly now: () => Date;

  constructor(
    private readonly repository: GoalRepository,
    private readonly currentUserId: () => string | undefined,
    opts: { now?: () => Date } = {},
  ) {
    this.now = opts.now ?? (() => new Date());
  }

  private user(): string {
    const id = this.currentUserId();
    if (id === undefined) throw new AppException('Sign in to see your savings goals.');
    return id;
  }

  async getGoals(): Promise<SavingsGoalsData> {
    const userId = this.currentUserId();
    if (userId === undefined) return EMPTY_GOALS;
    const goals = (await this.repository.fetchGoals(userId)).map((g) => this.withAdvice(g));
    if (!goals.length) return EMPTY_GOALS;
    const known = goals.map((g) => g.saved).filter((v): v is number => v !== undefined);
    return {
      totalSaved: known.length ? known.reduce((a, b) => a + b, 0) : undefined,
      subtitle: `${goals.length} ${goals.length === 1 ? 'goal' : 'goals'} · kept separate from your spending budgets`,
      goals,
    };
  }

  /**
   * A goal with a target date gets "By Jun 2027" and, while there's money still to save, a tip
   * with the monthly amount needed. A named goal without one says "No target date".
   */
  private withAdvice(g: SavingsGoal): SavingsGoal {
    const date = g.targetDate;
    if (!date) return g.name !== undefined && g.subtitle === undefined ? { ...g, subtitle: 'No target date' } : g;
    const by = `${DateLabels.monthAbbr(date.getMonth() + 1)} ${date.getFullYear()}`;
    const remaining = goalRemaining(g);
    if (remaining === undefined || remaining <= 0) return { ...g, subtitle: `By ${by} · goal reached` };
    const today = dateOnly(this.now());
    const months = Math.min(1200, Math.max(1, (date.getFullYear() - today.getFullYear()) * 12 + date.getMonth() - today.getMonth()));
    const perMonth = formatMoney(remaining / months, 0);
    return { ...g, subtitle: `By ${by}`, tip: `Save ${perMonth} a month to reach it by ${by}.`, tipHighlight: `${perMonth} a month` };
  }

  async addGoal(input: NewGoalInput) {
    const userId = this.user();
    const name = input.name.trim();
    const t = Validators.money(input.target, { what: 'target', max: MAX_TARGET });
    const s = input.saved.trim() ? Validators.money(input.saved, { what: 'amount', min: 0, max: MAX_TARGET }) : { value: 0 };
    const errors = compactErrors({
      name: !name ? 'Enter a name' : name.length > MAX_NAME ? `Keep the name under ${MAX_NAME} characters` : undefined,
      target: t.error,
      saved: s.error ?? (t.value !== undefined && s.value! > t.value ? "That's more than the target" : undefined),
      targetDate: input.targetDate && isBefore(dateOnly(input.targetDate), dateOnly(this.now())) ? "Choose a date that isn't in the past" : undefined,
      icon: GOAL_ICONS.some((i) => i.key === input.iconKey) ? undefined : 'Choose an icon',
    });
    if (Object.keys(errors).length) throw new FieldValidationException(errors);
    await this.repository.saveGoal(userId, {
      id: '',
      name,
      target: t.value,
      saved: s.value,
      iconKey: input.iconKey!,
      targetDate: input.targetDate ? dateOnly(input.targetDate) : undefined,
      contributions: [],
    });
    this.changes.emit();
  }

  earliestTargetDate(): Date {
    return dateOnly(this.now());
  }

  /** A contribution is at least $0.01, with at most 2 decimals. */
  async addContribution(goalId: string, amountText: string) {
    const parsed = Validators.money(amountText, { what: 'amount', min: 0.01 });
    if (parsed.error !== undefined) throw new AppException(parsed.error);
    const amount = parsed.value!;
    const userId = this.user();
    const goal = await this.repository.fetchGoal(userId, goalId);
    if (!goal) throw new AppException('That savings goal no longer exists.');
    await this.repository.saveGoal(userId, {
      ...goal,
      saved: (goal.saved ?? 0) + amount,
      contributions: [{ dateLabel: DateLabels.short(this.now()), amount }, ...goal.contributions],
    });
    this.changes.emit();
  }
}
