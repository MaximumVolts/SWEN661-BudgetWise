import type { ShortcutCommand } from '../models/shortcuts';
import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { usePageShortcuts, useShortcutsHelp } from '../state/ShortcutsContext';

/**
 * Desktop keyboard shortcuts for the signed-in app: what each command does (see
 * models/shortcuts.ts for the keys), and whether the shortcuts list is open.
 */
export function useKeyboardController() {
  const nav = useAppNavigator();
  const notify = useNotice();
  const page = usePageShortcuts();
  const [helpOpen, setHelpOpen] = useShortcutsHelp();

  const run = (command: ShortcutCommand) => {
    switch (command.kind) {
      case 'search':
        // Only reached when there's no search box on screen (narrow windows): Transactions has one.
        return nav.openTransactions();
      case 'save':
        if (!page.run('save')) notify('Nothing to save here: Pace saves your changes as you make them.');
        return;
      case 'new':
        page.run('new');
        return;
      case 'print':
        page.run('print');
        return;
      case 'back':
        if (nav.canGoBack()) nav.back();
        return;
      case 'forward':
        return nav.forward();
      case 'help':
        return setHelpOpen(true);
      case 'section':
        return nav.openSection(command.section);
    }
  };

  return {
    run,
    helpOpen,
    closeHelp: () => setHelpOpen(false),
  };
}

export type KeyboardController = ReturnType<typeof useKeyboardController>;
