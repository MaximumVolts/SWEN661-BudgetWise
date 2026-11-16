/**
 * @jest-environment jsdom
 */
// The desktop date field (the browser's date input): usable by keyboard. Typing or ↑ ↓ only edits
// the date; Enter (or leaving after editing) sets it; Esc cancels; a calendar pick sets it at once.
import { act, type ReactNode } from 'react';
import { DatePicker } from '@/ui/DatePicker.web';

jest.mock('@/state/PreferencesContext', () => {
  const { paletteFor } = jest.requireActual('@/ui/theme');
  const { DEFAULT_PREFERENCES } = jest.requireActual('@/models/userPreferences');
  return { useDisplay: () => ({ colors: paletteFor(DEFAULT_PREFERENCES) }) };
});

type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let showPicker: jest.Mock;
const onDone = jest.fn();
const START = new Date(2026, 10, 14);

beforeEach(() => {
  jest.clearAllMocks();
  showPicker = jest.fn();
  (HTMLInputElement.prototype as { showPicker?: () => void }).showPicker = showPicker;
  const host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  document.body.innerHTML = '';
});

const open = (showCalendar?: boolean) => {
  act(() => root.render(<DatePicker value={START} onDone={onDone} showCalendar={showCalendar} />));
  return document.querySelector<HTMLInputElement>('input[type="date"]')!;
};
const key = (el: HTMLElement, k: string) => act(() => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })));
/** What the browser does as a date part is typed or stepped: a new value, then "change". */
const edit = (el: HTMLInputElement, value: string) =>
  act(() => {
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
    set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
const ymd = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()];

test('opens focused; from the keyboard without the calendar pop-up (it would take the keys)', () => {
  const input = open(false);
  expect(document.activeElement).toBe(input);
  expect(showPicker).not.toHaveBeenCalled();
});

test('clicked open, the calendar pop-up opens too', () => {
  open(true);
  expect(showPicker).toHaveBeenCalled();
});

test('typing a date only edits it; Enter sets it', () => {
  const input = open(false);
  key(input, '0');
  edit(input, '2026-06-14');
  key(input, '6');
  edit(input, '2026-06-30');
  expect(onDone).not.toHaveBeenCalled();
  key(input, 'Enter');
  expect(onDone).toHaveBeenCalledTimes(1);
  expect(ymd(onDone.mock.calls[0][0])).toEqual([2026, 6, 30]);
});

test('Esc cancels, even after editing', () => {
  const input = open(false);
  key(input, 'ArrowUp');
  edit(input, '2026-12-14');
  key(input, 'Escape');
  expect(onDone).toHaveBeenCalledWith(undefined);
});

test('leaving the field sets an edited date, and cancels an untouched one', () => {
  let input = open(false);
  act(() => input.blur());
  expect(onDone).toHaveBeenLastCalledWith(undefined);
  act(() => root.render(null));
  input = open(false);
  key(input, 'ArrowUp');
  edit(input, '2026-12-14');
  act(() => input.blur());
  expect(ymd(onDone.mock.lastCall![0])).toEqual([2026, 12, 14]);
});

test('a day picked in the calendar (no key pressed) sets it at once, and only once', () => {
  const input = open(true);
  edit(input, '2026-11-20');
  expect(ymd(onDone.mock.calls[0][0])).toEqual([2026, 11, 20]);
  act(() => input.blur());
  expect(onDone).toHaveBeenCalledTimes(1);
});
