import { useKeyboardController } from '../controllers/keyboardController';
import { focusById, focusPageSoon, SEARCH_INPUT_ID, useShortcutListener } from '../ui/keyboard';
import { ShortcutsHelpScreen } from './screens/desktop/ShortcutsHelpScreen';

/**
 * Desktop keyboard shortcuts for the signed-in app: listens for them (and the Electron menu's
 * commands) and shows the shortcuts list. Ctrl/⌘ + K goes to the top bar's search box when it's
 * on screen; the controller handles everything else.
 */
export function KeyboardShortcutsView() {
  const ctl = useKeyboardController();
  useShortcutListener((command) => {
    if (command.kind === 'search' && focusById(SEARCH_INPUT_ID)) return;
    ctl.run(command);
    // After going to another page from the keyboard, focus moves to it, so Tab carries on there.
    if (command.kind === 'section' || command.kind === 'back' || command.kind === 'forward') focusPageSoon();
  });
  return <ShortcutsHelpScreen controller={ctl} />;
}
