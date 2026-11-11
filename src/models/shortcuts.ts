import type { AppSection } from './navigation';

/**
 * Keyboard shortcuts (desktop). Ctrl is the modifier on Windows / Linux and ⌘ on macOS, where
 * Ctrl works too. The same commands come from the keyboard and from the Electron menu bar.
 */
export type ShortcutCommand =
  | { kind: 'search' }
  | { kind: 'save' }
  | { kind: 'new' }
  | { kind: 'print' }
  | { kind: 'back' }
  | { kind: 'forward' }
  | { kind: 'help' }
  | { kind: 'section'; section: AppSection };

/** The sections Ctrl/⌘ + 1…9 open, in the sidebar's order. */
export const NUMBERED_SECTIONS: AppSection[] = ['home', 'transactions', 'spending', 'budgets', 'bills', 'comparison', 'goals', 'cashFlow', 'trends'];

/** The parts of a key press that shortcuts look at (a DOM KeyboardEvent has them all). */
export interface KeyPress {
  key: string;
  /** Physical key ('Digit1'), so number shortcuts work on any keyboard layout. */
  code?: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

/**
 * The command for [press], if any. [mac]: ⌘ is the modifier (Ctrl also works); [typing]: focus is
 * in a text field, where only modifier shortcuts apply (so typing "?" types a question mark).
 */
export function matchShortcut(press: KeyPress, { mac, typing }: { mac: boolean; typing: boolean }): ShortcutCommand | undefined {
  const mod = press.ctrlKey || (mac && press.metaKey);
  const key = press.key.length === 1 ? press.key.toLowerCase() : press.key;
  if (mod && !press.altKey) {
    const digit = /^Digit([1-9])$/.exec(press.code ?? '')?.[1] ?? (/^[1-9]$/.test(key) ? key : undefined);
    if (digit && !press.shiftKey) return { kind: 'section', section: NUMBERED_SECTIONS[Number(digit) - 1] };
    switch (key) {
      case 'k':
        return { kind: 'search' };
      case 's':
        return { kind: 'save' };
      case 'n':
        return press.shiftKey ? undefined : { kind: 'new' };
      case 'p':
        return press.shiftKey ? undefined : { kind: 'print' };
      case '[':
        return { kind: 'back' };
      case ']':
        return { kind: 'forward' };
      case '/':
      case '?':
        return { kind: 'help' };
      case ',':
        return { kind: 'section', section: 'settings' };
    }
    return undefined;
  }
  // Alt + ← / → is the browser's Back / Forward on Windows and Linux. On a Mac, ⌥ + ← moves by word.
  if (press.altKey && !mod && !mac && !press.shiftKey) {
    if (key === 'ArrowLeft') return { kind: 'back' };
    if (key === 'ArrowRight') return { kind: 'forward' };
  }
  if (!mod && !press.altKey && !typing && key === '?') return { kind: 'help' };
  if (!mod && !press.altKey && key === 'F1') return { kind: 'help' };
  return undefined;
}

/** Commands by the ids the Electron menu sends ('search', 'section:budgets'…). */
export function commandFromId(id: string): ShortcutCommand | undefined {
  const [kind, arg] = id.split(':');
  switch (kind) {
    case 'search':
    case 'save':
    case 'new':
    case 'print':
    case 'back':
    case 'forward':
    case 'help':
      return arg === undefined ? { kind } : undefined;
    case 'section':
      return [...NUMBERED_SECTIONS, 'notifications', 'settings'].includes(arg as AppSection) ? { kind: 'section', section: arg as AppSection } : undefined;
  }
  return undefined;
}

// ── The shortcuts list (Help → Keyboard shortcuts) ────────────────────────────

/** A key combination: modifier names ('mod' = Ctrl or ⌘, 'alt' = Alt or ⌥) then the key. */
export type KeyCombo = string[];

export interface ShortcutInfo {
  action: string;
  /** Each alternative combination, on Windows / Linux. */
  keys: KeyCombo[];
  /** On macOS, when different. */
  macKeys?: KeyCombo[];
}

export interface ShortcutGroup {
  title: string;
  items: ShortcutInfo[];
}

/** The sections' names, as in the sidebar. */
export const SECTION_NAMES: Record<AppSection, string> = {
  home: 'Home',
  transactions: 'Transactions',
  spending: 'Spending',
  budgets: 'Budgets',
  bills: 'Bills',
  comparison: 'Monthly Comparison',
  goals: 'Savings goals',
  cashFlow: 'Cash flow',
  trends: 'Trends',
  notifications: 'Notifications',
  settings: 'Settings',
};

export const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Anywhere',
    items: [
      { action: 'Search transactions and go to a page', keys: [['mod', 'K']] },
      { action: 'Save the form you are on', keys: [['mod', 'S']] },
      { action: 'Add a budget, bill or goal (on its page)', keys: [['mod', 'N']] },
      { action: 'Print the report (Monthly Comparison)', keys: [['mod', 'P']] },
      { action: 'Back', keys: [['alt', '←']], macKeys: [['mod', '[']] },
      { action: 'Forward', keys: [['alt', '→']], macKeys: [['mod', ']']] },
      { action: 'Keyboard shortcuts', keys: [['?'], ['mod', '/']] },
    ],
  },
  {
    title: 'Go to',
    items: [
      ...NUMBERED_SECTIONS.map((s, i) => ({ action: SECTION_NAMES[s], keys: [['mod', String(i + 1)]] })),
      { action: 'Settings', keys: [['mod', ',']] },
    ],
  },
  {
    title: 'Moving around',
    items: [
      { action: 'Next / previous control', keys: [['Tab'], ['Shift', 'Tab']] },
      { action: 'Skip the sidebar to the page', keys: [['Tab'], ['Enter']] },
      { action: 'Press a button, link or row', keys: [['Enter'], ['Space']] },
      { action: 'Tick a checkbox or switch', keys: [['Space']] },
      { action: 'Move between tabs and options', keys: [['←'], ['→'], ['↑'], ['↓']] },
      { action: 'Close a dialog, panel or search', keys: [['Esc']] },
    ],
  },
  {
    title: 'In search',
    items: [
      { action: 'Choose a result', keys: [['↑'], ['↓']] },
      { action: 'Open the chosen result', keys: [['Enter']] },
      { action: 'Clear and leave search', keys: [['Esc']] },
    ],
  },
];

/** The keys of [combo] as shown on this platform: ['Ctrl', 'K'] or ['⌘', 'K']. */
export const keyLabels = (combo: KeyCombo, mac: boolean): string[] =>
  combo.map((k) => (k === 'mod' ? (mac ? '⌘' : 'Ctrl') : k === 'alt' ? (mac ? '⌥' : 'Alt') : k));

/** The combinations for [item] on this platform. */
export const keysFor = (item: ShortcutInfo, mac: boolean): KeyCombo[] => (mac && item.macKeys) || item.keys;

// ── Quick destinations (the top bar's search) ─────────────────────────────────

export type Destination = AppSection | 'accounts' | 'profile' | 'statements';

const DESTINATIONS: { id: Destination; label: string; keywords: string }[] = [
  { id: 'home', label: 'Home', keywords: 'dashboard overview' },
  { id: 'transactions', label: 'Transactions', keywords: 'purchases payments history' },
  { id: 'spending', label: 'Spending', keywords: 'categories breakdown' },
  { id: 'budgets', label: 'Budgets', keywords: 'limits categories' },
  { id: 'bills', label: 'Bills', keywords: 'recurring subscriptions due reminders' },
  { id: 'comparison', label: 'Monthly Comparison', keywords: 'compare months report' },
  { id: 'goals', label: 'Savings goals', keywords: 'save target' },
  { id: 'cashFlow', label: 'Cash flow', keywords: 'projection income forecast' },
  { id: 'trends', label: 'Trends', keywords: 'trendscore insights' },
  { id: 'accounts', label: 'Accounts', keywords: 'banks balances linked' },
  { id: 'statements', label: 'Statements', keywords: 'export download csv pdf' },
  { id: 'notifications', label: 'Notifications', keywords: 'alerts' },
  { id: 'settings', label: 'Settings', keywords: 'preferences reminders contrast colorblind' },
  { id: 'profile', label: 'Profile', keywords: 'account password plaid keys' },
];

/** Shown before anything is typed. */
const SUGGESTED: Destination[] = ['transactions', 'budgets', 'bills', 'comparison', 'settings'];

/** Pages whose name (or what they're about) matches [query]; the suggested few for an empty one. */
export function matchDestinations(query: string, limit = 5): { id: Destination; label: string }[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUGGESTED.map((id) => DESTINATIONS.find((d) => d.id === id)!).map(({ id, label }) => ({ id, label }));
  const words = (s: string) => s.toLowerCase().split(/\s+/);
  const score = (d: (typeof DESTINATIONS)[number]) =>
    words(d.label).some((w) => w.startsWith(q)) || d.label.toLowerCase().startsWith(q) ? 2 : words(d.keywords).some((w) => w.startsWith(q)) ? 1 : 0;
  return DESTINATIONS.map((d) => ({ d, s: score(d) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, limit)
    .map(({ d }) => ({ id: d.id, label: d.label }));
}
