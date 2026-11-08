import {
  commandFromId,
  type KeyPress,
  keyLabels,
  keysFor,
  matchDestinations,
  matchShortcut,
  NUMBERED_SECTIONS,
  SHORTCUT_GROUPS,
} from '@/models/shortcuts';
import { createShortcutRegistry } from '@/state/ShortcutsContext';

const press = (key: string, mods: Partial<KeyPress> = {}): KeyPress => ({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods });
const win = { mac: false, typing: false };
const mac = { mac: true, typing: false };

describe('keyboard shortcuts (matchShortcut)', () => {
  test('Ctrl + K / S / N / P on Windows and Linux, even while typing', () => {
    expect(matchShortcut(press('k', { ctrlKey: true }), win)).toEqual({ kind: 'search' });
    expect(matchShortcut(press('S', { ctrlKey: true }), { mac: false, typing: true })).toEqual({ kind: 'save' });
    expect(matchShortcut(press('n', { ctrlKey: true }), win)).toEqual({ kind: 'new' });
    expect(matchShortcut(press('p', { ctrlKey: true }), win)).toEqual({ kind: 'print' });
  });

  test('on a Mac ⌘ is the modifier and Ctrl works too; the Windows key is not a modifier', () => {
    expect(matchShortcut(press('k', { metaKey: true }), mac)).toEqual({ kind: 'search' });
    expect(matchShortcut(press('k', { ctrlKey: true }), mac)).toEqual({ kind: 'search' });
    expect(matchShortcut(press('k', { metaKey: true }), win)).toBeUndefined();
  });

  test('Ctrl/⌘ + 1…9 open the sidebar sections in order, by physical key; Ctrl/⌘ + , opens Settings', () => {
    expect(matchShortcut(press('1', { ctrlKey: true, code: 'Digit1' }), win)).toEqual({ kind: 'section', section: 'home' });
    expect(matchShortcut(press('6', { metaKey: true, code: 'Digit6' }), mac)).toEqual({ kind: 'section', section: 'comparison' });
    // An AZERTY keyboard sends "&" for the 1 key: the physical key still counts.
    expect(matchShortcut(press('&', { ctrlKey: true, code: 'Digit1' }), win)).toEqual({ kind: 'section', section: 'home' });
    expect(NUMBERED_SECTIONS).toHaveLength(9);
    expect(matchShortcut(press(',', { ctrlKey: true }), win)).toEqual({ kind: 'section', section: 'settings' });
  });

  test('Back / Forward: Alt + ← → on Windows, ⌘ + [ ] on a Mac (where ⌥ + ← moves by word)', () => {
    expect(matchShortcut(press('ArrowLeft', { altKey: true }), win)).toEqual({ kind: 'back' });
    expect(matchShortcut(press('ArrowRight', { altKey: true }), win)).toEqual({ kind: 'forward' });
    expect(matchShortcut(press('ArrowLeft', { altKey: true }), mac)).toBeUndefined();
    expect(matchShortcut(press('[', { metaKey: true }), mac)).toEqual({ kind: 'back' });
    expect(matchShortcut(press(']', { metaKey: true }), mac)).toEqual({ kind: 'forward' });
  });

  test('? opens the list unless typing; Ctrl/⌘ + / and F1 always do', () => {
    expect(matchShortcut(press('?', { shiftKey: true }), win)).toEqual({ kind: 'help' });
    expect(matchShortcut(press('?', { shiftKey: true }), { mac: false, typing: true })).toBeUndefined();
    expect(matchShortcut(press('/', { ctrlKey: true }), { mac: false, typing: true })).toEqual({ kind: 'help' });
    expect(matchShortcut(press('F1'), win)).toEqual({ kind: 'help' });
  });

  test('other keys, and browser keys like Ctrl + F or Ctrl + Shift + N, are left alone', () => {
    for (const p of [press('f', { ctrlKey: true }), press('n', { ctrlKey: true, shiftKey: true }), press('k'), press('ArrowLeft'), press('Escape'), press('k', { ctrlKey: true, altKey: true })]) {
      expect(matchShortcut(p, win)).toBeUndefined();
    }
  });
});

describe('menu commands (commandFromId)', () => {
  test('known ids become commands; anything else is ignored', () => {
    expect(commandFromId('search')).toEqual({ kind: 'search' });
    expect(commandFromId('section:budgets')).toEqual({ kind: 'section', section: 'budgets' });
    expect(commandFromId('section:notifications')).toEqual({ kind: 'section', section: 'notifications' });
    expect(commandFromId('section:nowhere')).toBeUndefined();
    expect(commandFromId('search:extra')).toBeUndefined();
    expect(commandFromId('format-disk')).toBeUndefined();
  });
});

describe('the shortcuts list', () => {
  test("shows each platform's modifier", () => {
    expect(keyLabels(['mod', 'K'], false)).toEqual(['Ctrl', 'K']);
    expect(keyLabels(['mod', 'K'], true)).toEqual(['⌘', 'K']);
    const back = SHORTCUT_GROUPS.flatMap((g) => g.items).find((i) => i.action === 'Back')!;
    expect(keysFor(back, false)).toEqual([['alt', '←']]);
    expect(keysFor(back, true)).toEqual([['mod', '[']]);
  });

  test('lists every numbered section', () => {
    const goTo = SHORTCUT_GROUPS.find((g) => g.title === 'Go to')!;
    expect(goTo.items.map((i) => i.keys[0][1])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', ',']);
    expect(goTo.items[5].action).toBe('Monthly Comparison');
  });
});

describe('quick destinations (search box)', () => {
  test('suggests a few pages before anything is typed', () => {
    expect(matchDestinations('').map((d) => d.label)).toEqual(['Transactions', 'Budgets', 'Bills', 'Monthly Comparison', 'Settings']);
  });

  test('matches names first, then what a page is about', () => {
    expect(matchDestinations('comp')[0]).toEqual({ id: 'comparison', label: 'Monthly Comparison' });
    expect(matchDestinations('bud').map((d) => d.id)).toEqual(['budgets']);
    // Pages whose name has a word starting with the text come before keyword matches.
    expect(matchDestinations('trend').map((d) => d.id)).toEqual(['trends']);
    expect(matchDestinations('c').map((d) => d.id).slice(0, 2)).toEqual(['comparison', 'cashFlow']);
    expect(matchDestinations('subscriptions').map((d) => d.id)).toEqual(['bills']);
    expect(matchDestinations('zzz')).toEqual([]);
  });
});

describe('page actions (Ctrl/⌘ + S / N / P)', () => {
  test('run the latest page’s handler, and hand back when it closes', () => {
    const registry = createShortcutRegistry();
    const calls: string[] = [];
    expect(registry.run('save')).toBe(false);

    const offBudgets = registry.register('new', () => calls.push('budgets'));
    const offForm = registry.register('new', () => calls.push('form'));
    expect(registry.run('new')).toBe(true);
    offForm();
    registry.run('new');
    offBudgets();
    expect(registry.run('new')).toBe(false);
    expect(registry.run('print')).toBe(false);
    expect(calls).toEqual(['form', 'budgets']);
  });
});
