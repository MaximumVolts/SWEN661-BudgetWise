import type { ShortcutCommand } from '../models/shortcuts';
import { useAppNavigator, useJourneyStep } from '../navigation/appNavigator';

/**
 * The desktop sign-up frame: which step of the journey (account, priorities, bank) is on screen,
 * and the keyboard shortcuts that mean something before signing in (Back and Forward; the rest
 * are for the signed-in app).
 */
export function useJourneyController() {
  const nav = useAppNavigator();
  /** True if [command] did something (so focus should move to the page). */
  const runShortcut = (command: ShortcutCommand): boolean => {
    if (command.kind === 'back' && nav.canGoBack()) {
      nav.back();
      return true;
    }
    if (command.kind === 'forward') {
      nav.forward();
      return true;
    }
    return false;
  };
  return { step: useJourneyStep(), runShortcut };
}

export type JourneyController = ReturnType<typeof useJourneyController>;
