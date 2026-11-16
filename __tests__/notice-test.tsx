/**
 * @jest-environment jsdom
 */
// Messages at the top of the screen (NoticeProvider): how long they stay, and closing them (WCAG 2.2.1).
import { act, type ReactNode } from 'react';
import { DEFAULT_PREFERENCES, type UserPreferences } from '@/models/userPreferences';
import { NOTICE_SHOW_MS } from '@/services/settingsService';
import { NoticeProvider, useNotice } from '@/state/NoticeContext';

// Hoisted above the imports by Jest: 'react-native' here is react-native-web, as in the desktop app.
jest.mock('react-native', () => jest.requireActual('react-native-web'));
jest.mock('@/ui/icons', () => ({ Icon: () => null }));
let mockPreferences: UserPreferences = DEFAULT_PREFERENCES;
jest.mock('@/state/PreferencesContext', () => ({
  useDisplay: () => ({ preferences: mockPreferences, colors: jest.requireActual('@/ui/theme').paletteFor(mockPreferences) }),
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) }));

type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLElement;
let notify: (m: string) => void = () => {};

function Grab() {
  notify = useNotice();
  return null;
}

function show(message: string) {
  act(() => root.render(<NoticeProvider><Grab /></NoticeProvider>));
  act(() => notify(message));
}

const status = () => container.querySelector('[role="status"]');
const closeButton = () => container.querySelector<HTMLElement>('[aria-label="Close message"]');
const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

beforeEach(() => {
  jest.useFakeTimers();
  mockPreferences = DEFAULT_PREFERENCES;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  jest.useRealTimers();
});

test('a message is read out politely and goes after NOTICE_SHOW_MS', () => {
  show('Budget saved');
  expect(status()?.textContent).toBe('Budget saved');
  wait(NOTICE_SHOW_MS - 1);
  expect(status()).not.toBeNull();
  wait(1);
  expect(status()).toBeNull();
});

test('the Close button takes it away at once', () => {
  show('Budget saved');
  act(() => closeButton()!.click());
  expect(status()).toBeNull();
});

test('the time does not run while focus is on the Close button', () => {
  show('Budget saved');
  act(() => closeButton()!.focus());
  wait(NOTICE_SHOW_MS * 3);
  expect(status()).not.toBeNull();
  act(() => closeButton()!.blur());
  wait(NOTICE_SHOW_MS);
  expect(status()).toBeNull();
});

test('with "Keep messages on screen" on, a message stays until closed', () => {
  mockPreferences = { ...DEFAULT_PREFERENCES, keepNotices: true };
  show('Budget saved');
  wait(NOTICE_SHOW_MS * 10);
  expect(status()?.textContent).toBe('Budget saved');
  act(() => closeButton()!.click());
  expect(status()).toBeNull();
});
