import { useFocusEffect } from 'expo-router';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

/** What a page can do from the keyboard: Ctrl/⌘ + S, Ctrl/⌘ + N, Ctrl/⌘ + P. */
export type PageAction = 'save' | 'new' | 'print';

export interface ShortcutRegistry {
  /** Offers [handler] for [action]; returns the function that withdraws it. The latest offer wins. */
  register(action: PageAction, handler: () => unknown): () => void;
  /** Runs the page's handler for [action]. False if the page on screen has none. */
  run(action: PageAction): boolean;
}

/** The registry itself: a stack of handlers per action, so a page that closes hands back to the one below. */
export function createShortcutRegistry(): ShortcutRegistry {
  const handlers: Record<PageAction, { fn: () => unknown }[]> = { save: [], new: [], print: [] };
  return {
    register(action, fn) {
      const entry = { fn };
      handlers[action].push(entry);
      return () => {
        const list = handlers[action];
        const i = list.lastIndexOf(entry);
        if (i >= 0) list.splice(i, 1);
      };
    },
    run(action) {
      const top = handlers[action].at(-1);
      if (!top) return false;
      void top.fn();
      return true;
    },
  };
}

const ShortcutsContext = createContext<ShortcutRegistry | null>(null);
/** Whether the keyboard shortcuts list is open, and the setter. */
const HelpContext = createContext<[boolean, (open: boolean) => void] | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const registry = useMemo(() => createShortcutRegistry(), []);
  const [helpOpen, setHelpOpen] = useState(false);
  const help = useMemo<[boolean, (open: boolean) => void]>(() => [helpOpen, setHelpOpen], [helpOpen]);
  return (
    <ShortcutsContext.Provider value={registry}>
      <HelpContext.Provider value={help}>{children}</HelpContext.Provider>
    </ShortcutsContext.Provider>
  );
}

/** The keyboard shortcuts list: open or not, and a way to open or close it. */
export function useShortcutsHelp(): [boolean, (open: boolean) => void] {
  const help = useContext(HelpContext);
  if (!help) throw new Error('useShortcutsHelp must be used inside <ShortcutsProvider>');
  return help;
}

/** The registry, for the keyboard controller. */
export function usePageShortcuts(): ShortcutRegistry {
  const registry = useContext(ShortcutsContext);
  if (!registry) throw new Error('usePageShortcuts must be used inside <ShortcutsProvider>');
  return registry;
}

/**
 * Offers [handler] for [action] while this page is the one on screen (pages left underneath in
 * the stack don't answer). Pass undefined when the action isn't available right now.
 */
export function usePageShortcut(action: PageAction, handler: (() => unknown) | undefined) {
  const registry = useContext(ShortcutsContext);
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  const enabled = handler !== undefined;
  useFocusEffect(
    useCallback(() => {
      if (!registry || !enabled) return undefined;
      return registry.register(action, () => latest.current?.());
    }, [registry, action, enabled]),
  );
}
