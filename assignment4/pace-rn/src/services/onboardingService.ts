import type { FlowStep } from '../models/navigation';
import type { OnboardingOptions } from '../models/onboarding';

/**
 * BUSINESS RULES: which options are offered, how priorities/income type feed default budgets and
 * alerts, and what the next step is once preferences are saved.
 */
export interface OnboardingService {
  loadOptions(): Promise<OnboardingOptions>;
  /** Persists preferences and returns the next step in the journey. */
  savePreferences(priorityIds: Set<string>, incomeId: string | undefined): Promise<FlowStep>;
}

/** The onboarding questions (demo data: answers aren't stored yet). */
export class DemoOnboardingService implements OnboardingService {
  async loadOptions(): Promise<OnboardingOptions> {
    return {
      priorities: [
        { id: 'spend', label: 'See where my money goes' },
        { id: 'bills', label: 'Stay on top of bills' },
        { id: 'budget', label: 'Stick to a budget' },
        { id: 'subs', label: 'Track subscriptions' },
        { id: 'goal', label: 'Save for a goal' },
      ],
      incomeOptions: [
        { id: 'steady', title: 'Steady paycheck', subtitle: 'Same amount on a regular schedule' },
        { id: 'variable', title: 'Changes month to month', subtitle: 'Freelance, tips or variable pay' },
      ],
    };
  }

  /** Onboarding only follows account creation, so the next step is always linking a bank. */
  async savePreferences(): Promise<FlowStep> {
    return 'connectBank';
  }
}
