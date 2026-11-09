/**
 * @jest-environment jsdom
 */
// The desktop (web) keyboard support in a real DOM: React Native renders through react-native-web,
// as it does in the desktop app, so focus, roles and key events are the browser's.
import { act, type ReactNode } from 'react';
import { Text } from 'react-native';
import type { ShortcutCommand } from '@/models/shortcuts';
import {
  FocusPressable,
  focusById,
  focusPageSoon,
  focusRing,
  isMac,
  KeyGroup,
  MAIN_CONTENT_ID,
  spaceKeyProps,
  useShortcutListener,
} from '@/ui/keyboard';

// Hoisted above the imports by Jest: 'react-native' here is react-native-web.
jest.mock('react-native', () => jest.requireActual('react-native-web'));

// react-dom ships without types here; this is the part used.
type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let host: HTMLElement;
beforeEach(() => {
  host = document.createElement('div');
  document.body.appendChild(host);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
  delete (globalThis as { paceDesktop?: unknown }).paceDesktop;
});

function render(ui: ReactNode) {
  root = createRoot(host);
  act(() => root!.render(ui));
}

/** jsdom lays nothing out; elements count as on screen when they report a box. */
const onScreen = <T extends Element>(el: T) => Object.assign(el, { getClientRects: () => [{}] });

const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document.activeElement ?? window) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  act(() => void target.dispatchEvent(event));
  return event;
};

const items = (role: string) => [...host.querySelectorAll<HTMLElement>(`[role="${role}"]`)];

describe('platform and focus helpers', () => {
  test('isMac follows the desktop app, then the browser', () => {
    (globalThis as { paceDesktop?: unknown }).paceDesktop = { platform: 'darwin' };
    expect(isMac()).toBe(true);
    (globalThis as { paceDesktop?: unknown }).paceDesktop = { platform: 'win32' };
    expect(isMac()).toBe(false);
    delete (globalThis as { paceDesktop?: unknown }).paceDesktop;
    expect(isMac()).toBe(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  });

  test('focusById focuses an element only when it is on screen', () => {
    const input = document.createElement('input');
    input.id = 'field';
    document.body.appendChild(input);
    expect(focusById('field')).toBe(false); // no box: hidden
    onScreen(input);
    expect(focusById('field')).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(focusById('missing')).toBe(false);
  });

  test('focusPageSoon moves focus to the main content once the page has rendered', () => {
    jest.useFakeTimers();
    const main = onScreen(document.createElement('div'));
    main.id = MAIN_CONTENT_ID;
    main.tabIndex = -1;
    document.body.appendChild(main);
    focusPageSoon();
    expect(document.activeElement).not.toBe(main);
    jest.advanceTimersByTime(60);
    expect(document.activeElement).toBe(main);
    jest.useRealTimers();
  });

  test('focusRing is an outline (no layout shift)', () => {
    expect(focusRing('#000')).toMatchObject({ outlineColor: '#000', outlineStyle: 'solid', outlineWidth: 3 });
  });
});

describe('Space', () => {
  test('presses checkboxes, switches, tabs and options, not buttons', () => {
    const onPress = jest.fn();
    expect(spaceKeyProps('button', onPress)).toEqual({});
    expect(spaceKeyProps('checkbox', undefined)).toEqual({});
    expect(spaceKeyProps(undefined, onPress)).toEqual({});
    const { onKeyDown } = spaceKeyProps('checkbox', onPress) as { onKeyDown: (e: { key: string; preventDefault(): void }) => void };
    const preventDefault = jest.fn();
    onKeyDown({ key: 'Enter', preventDefault });
    expect(onPress).not.toHaveBeenCalled();
    onKeyDown({ key: ' ', preventDefault });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalled();
  });

  test('a FocusPressable checkbox toggles with Space and shows its ring while focused', () => {
    const onPress = jest.fn();
    render(
      <FocusPressable ringColor="#123456" role="checkbox" aria-checked={false} accessibilityLabel="Arrow icons" onPress={onPress}>
        <Text>Arrow icons</Text>
      </FocusPressable>,
    );
    const box = items('checkbox')[0];
    act(() => box.focus());
    expect(box.style.outlineColor).not.toBe('');
    press(' ', {}, box);
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => box.blur());
    expect(box.style.outlineStyle === '' || box.style.outlineStyle === 'none').toBe(true);
  });
});

describe('arrow keys in groups', () => {
  function Group({ role, itemRole, chosen, onChoose, focusChosen }: { role: 'tablist' | 'radiogroup' | 'listbox'; itemRole: string; chosen: number; onChoose: (i: number) => void; focusChosen?: boolean }) {
    return (
      <KeyGroup role={role} label="Group" focusChosen={focusChosen}>
        {['One', 'Two', 'Three'].map((label, i) => (
          <FocusPressable
            key={label}
            ringColor="#000"
            role={itemRole as never}
            accessibilityLabel={label}
            aria-selected={itemRole !== 'radio' ? i === chosen : undefined}
            aria-checked={itemRole === 'radio' ? i === chosen : undefined}
            onPress={() => onChoose(i)}
          >
            <Text>{label}</Text>
          </FocusPressable>
        ))}
      </KeyGroup>
    );
  }

  test('a tab list is one Tab stop; ← → Home End move and choose', () => {
    const onChoose = jest.fn();
    render(<Group role="tablist" itemRole="tab" chosen={1} onChoose={onChoose} />);
    const tabs = items('tab');
    expect(tabs.map((t) => t.tabIndex)).toEqual([-1, 0, -1]); // only the chosen one
    act(() => tabs[1].focus());
    press('ArrowRight');
    expect(document.activeElement).toBe(tabs[2]);
    expect(onChoose).toHaveBeenLastCalledWith(2);
    press('ArrowRight'); // wraps
    expect(document.activeElement).toBe(tabs[0]);
    press('End');
    expect(document.activeElement).toBe(tabs[2]);
    press('Home');
    expect(document.activeElement).toBe(tabs[0]);
    press('ArrowLeft');
    expect(document.activeElement).toBe(tabs[2]);
    const down = press('ArrowDown'); // not a tab list key
    expect(down.defaultPrevented).toBe(false);
    press('x');
  });

  test('a radio group moves with ↑ ↓ too', () => {
    const onChoose = jest.fn();
    render(<Group role="radiogroup" itemRole="radio" chosen={0} onChoose={onChoose} />);
    const radios = items('radio');
    act(() => radios[0].focus());
    press('ArrowDown');
    expect(onChoose).toHaveBeenLastCalledWith(1);
    press('ArrowUp');
    expect(document.activeElement).toBe(radios[0]);
  });

  test('a list box opens on its chosen item and moves without choosing', () => {
    jest.useFakeTimers();
    const onChoose = jest.fn();
    render(<Group role="listbox" itemRole="option" chosen={2} onChoose={onChoose} focusChosen />);
    act(() => void jest.advanceTimersByTime(10));
    const options = items('option');
    expect(document.activeElement).toBe(options[2]);
    press('ArrowUp');
    expect(document.activeElement).toBe(options[1]);
    expect(onChoose).not.toHaveBeenCalled();
    // Once the user has moved, the later "focus the chosen one" leaves focus where it is.
    act(() => void jest.advanceTimersByTime(500));
    expect(document.activeElement).toBe(options[1]);
    jest.useRealTimers();
  });

  test('keys from outside the items are ignored', () => {
    const onChoose = jest.fn();
    render(<Group role="tablist" itemRole="tab" chosen={0} onChoose={onChoose} />);
    const group = host.querySelector<HTMLElement>('[role="tablist"]')!;
    const event = press('ArrowRight', {}, group);
    expect(event.defaultPrevented).toBe(false);
    expect(onChoose).not.toHaveBeenCalled();
  });
});

describe('the shortcut listener', () => {
  let commands: ShortcutCommand[];
  let menu: ((id: string) => void) | undefined;
  const unsubscribe = jest.fn();

  function Listener() {
    useShortcutListener((c) => commands.push(c));
    return null;
  }

  beforeEach(() => {
    commands = [];
    menu = undefined;
    (globalThis as { paceDesktop?: unknown }).paceDesktop = {
      platform: 'win32',
      onCommand: (listener: (id: string) => void) => {
        menu = listener;
        return unsubscribe;
      },
    };
    render(<Listener />);
  });

  test('turns shortcut keys into commands and keeps the browser from acting on them', () => {
    const k = press('k', { ctrlKey: true, code: 'KeyK' }, window);
    expect(commands).toEqual([{ kind: 'search' }]);
    expect(k.defaultPrevented).toBe(true);
    press('2', { ctrlKey: true, code: 'Digit2' }, window);
    expect(commands.at(-1)).toEqual({ kind: 'section', section: 'transactions' });
    press('ArrowLeft', { altKey: true }, window);
    expect(commands.at(-1)).toEqual({ kind: 'back' });
    // Held down: one command, not many.
    press('s', { ctrlKey: true, code: 'KeyS', repeat: true }, window);
    expect(commands).toHaveLength(3);
    // Not a shortcut.
    expect(press('a', {}, window).defaultPrevented).toBe(false);
  });

  test('"?" is typed, not a shortcut, while typing in a field', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    press('?', { shiftKey: true }, input);
    expect(commands).toEqual([]);
    input.blur();
    press('?', { shiftKey: true }, window);
    expect(commands).toEqual([{ kind: 'help' }]);
  });

  test('while a dialog is open, shortcuts are left alone (Save and Print still kept from the browser)', () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('aria-modal', 'true');
    document.body.appendChild(dialog);
    const save = press('s', { ctrlKey: true, code: 'KeyS' }, window);
    expect(save.defaultPrevented).toBe(true);
    const search = press('k', { ctrlKey: true, code: 'KeyK' }, window);
    expect(search.defaultPrevented).toBe(false);
    act(() => void window.dispatchEvent(new MouseEvent('mouseup', { button: 3 })));
    menu?.('section:budgets');
    expect(commands).toEqual([]);
  });

  test('already-handled keys are skipped', () => {
    const event = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, cancelable: true });
    event.preventDefault();
    act(() => void window.dispatchEvent(event));
    expect(commands).toEqual([]);
  });

  test("the mouse's Back and Forward buttons, and the Electron menu's commands", () => {
    act(() => void window.dispatchEvent(new MouseEvent('mouseup', { button: 3 })));
    act(() => void window.dispatchEvent(new MouseEvent('mouseup', { button: 4 })));
    act(() => void window.dispatchEvent(new MouseEvent('mouseup', { button: 0 })));
    act(() => menu?.('section:budgets'));
    act(() => menu?.('not-a-command'));
    expect(commands).toEqual([{ kind: 'back' }, { kind: 'forward' }, { kind: 'section', section: 'budgets' }]);
  });

  test('stops listening when it goes away', () => {
    act(() => root?.unmount());
    root = undefined;
    expect(unsubscribe).toHaveBeenCalled();
    press('k', { ctrlKey: true, code: 'KeyK' }, window);
    expect(commands).toEqual([]);
  });
});
