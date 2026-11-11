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

/** The app's main sections (the desktop sidebar's entries). */
export type AppSection =
  | 'home'
  | 'transactions'
  | 'spending'
  | 'budgets'
  | 'bills'
  | 'comparison'
  | 'goals'
  | 'cashFlow'
  | 'trends'
  | 'notifications'
  | 'settings';

/** Tools are listed apart from the main sections, and their pages are labelled "Tools". */
export const TOOL_SECTIONS: AppSection[] = ['comparison', 'goals', 'cashFlow', 'trends'];

/** The sign-up journey's steps (desktop's stepper): 1 your account, 2 your priorities, 3 connect your bank. */
export type JourneyStep = 1 | 2 | 3;
