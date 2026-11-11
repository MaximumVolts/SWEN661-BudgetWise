import type { StatementFile } from '../../models/statement';
import type { SqlRow, SqlValue } from '../database';

/**
 * What the Electron shell (desktop/preload.js) offers the app as `window.paceDesktop`. Each call
 * runs in Electron's main process, which does what a browser page can't: a SQLite file, the OS
 * keychain, system notifications, a Save dialog and requests to Plaid.
 */
export interface DesktopBridge {
  platform: string;
  db: {
    exec(sql: string): Promise<void>;
    run(sql: string, params?: SqlValue[]): Promise<{ lastInsertRowId: number; changes: number }>;
    all(sql: string, params?: SqlValue[]): Promise<SqlRow[]>;
    first(sql: string, params?: SqlValue[]): Promise<SqlRow | null>;
  };
  vault: {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
  };
  notifications: {
    supported(): Promise<boolean>;
    show(n: { id: number; title: string; body: string }): Promise<void>;
    /** [at] is epoch milliseconds. */
    schedule(n: { id: number; title: string; body: string; at: number }): Promise<void>;
    cancelAll(): Promise<void>;
  };
  /** Asks where to save [file]; false if the user cancelled. */
  saveStatement(file: StatementFile): Promise<boolean>;
  /** A POST to Plaid's sandbox, sent from the main process (Plaid doesn't allow browser requests). */
  plaidFetch(url: string, init: { method: string; headers: Record<string, string>; body: string }): Promise<{ status: number; text: string }>;
  /** The menu bar's commands ('search', 'section:budgets'…; see models/shortcuts.ts). Returns the unsubscribe. Read by ui/keyboard.tsx. */
  onCommand?(listener: (id: string) => void): () => void;
}

/** The Electron bridge; fails clearly if the web build is opened outside the desktop app. */
export function desktopBridge(): DesktopBridge {
  const bridge = (globalThis as { paceDesktop?: DesktopBridge }).paceDesktop;
  if (!bridge) throw new Error('Pace for desktop must be run in its Electron shell (npm run desktop).');
  return bridge;
}
