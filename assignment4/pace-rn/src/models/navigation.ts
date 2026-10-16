/** Where the user should go next in the sign-in / onboarding journey (decided by services). */
export type FlowStep = 'onboarding' | 'connectBank' | 'home';

export interface LinkOutcome {
  /** False if the user cancelled. */
  linked: boolean;
  next?: FlowStep;
}

export type TargetKind = 'bill' | 'budgetCategory' | 'goal' | 'account' | 'transaction' | 'trend' | 'budgets' | 'bills';

/** What a notification points at. `id` is undefined for list-level targets. */
export interface DeepLinkTarget {
  kind: TargetKind;
  id?: string;
}
