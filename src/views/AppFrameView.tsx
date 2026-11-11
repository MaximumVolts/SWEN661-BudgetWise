import type { ReactNode } from 'react';
import { useJourneyController } from '../controllers/journeyController';
import { useShellController } from '../controllers/shellController';
import { AppFrame } from './screens/desktop/AppFrame';
import { DesktopShellScreen, SHELL_INSET } from './screens/desktop/DesktopShellScreen';
import { JOURNEY_INSET, JourneyShellScreen } from './screens/desktop/JourneyShellScreen';

/** Which desktop frame surrounds the pages: none (phone / tablet layout), the signed-in app's, or sign-up's. */
export type FrameMode = 'none' | 'app' | 'journey';

const NO_INSET = { left: 0, top: 0 };

/** The pages ([children]) inside the desktop frame for [mode]. */
export function AppFrameView({ mode, children }: { mode: FrameMode; children: ReactNode }) {
  const chrome = mode === 'app' ? <ShellChrome /> : mode === 'journey' ? <JourneyChrome /> : null;
  const inset = mode === 'app' ? SHELL_INSET : mode === 'journey' ? JOURNEY_INSET : NO_INSET;
  return (
    <AppFrame chrome={chrome} inset={inset}>
      {children}
    </AppFrame>
  );
}

/** Desktop: the sidebar and top bar around the signed-in pages. */
function ShellChrome() {
  return <DesktopShellScreen controller={useShellController()} />;
}

/** Desktop: the brand panel and step list beside the sign-in and setup pages. */
function JourneyChrome() {
  return <JourneyShellScreen controller={useJourneyController()} />;
}
