import { useJourneyStep } from '../navigation/appNavigator';

/** The desktop sign-up frame: which step of the journey (account, priorities, bank) is on screen. */
export function useJourneyController() {
  return { step: useJourneyStep() };
}

export type JourneyController = ReturnType<typeof useJourneyController>;
