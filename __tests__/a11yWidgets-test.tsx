/**
 * @jest-environment jsdom
 */
// Accessibility of the desktop widgets in a real DOM (react-native-web, as in the Electron app):
// charts' text alternatives, switches, radio groups with arrow keys, and the Settings and
// Notifications pages' names, roles, states and keyboard operation.
import { act, type ReactNode } from 'react';
import type { NotificationsController } from '@/controllers/notificationsController';
import type { SettingsController } from '@/controllers/settingsController';
import type { NotificationItem } from '@/models/notification';
import type { SettingsData } from '@/models/settings';
import { BarChart, CashFlowChart, SpendAreaChart } from '@/ui/charts';
import { ProgressBar, SegTabs } from '@/ui/components';
import { ChipGroup, DSwitch, Tabs } from '@/ui/desktop';
import { MAIN_CONTENT_ID, SEARCH_INPUT_ID } from '@/ui/keyboard';
import { KeyboardShortcutsView } from '@/views/KeyboardShortcutsView';
import { NotificationsDesktop, SettingsDesktop } from '@/views/screens/desktop/AccountPagesDesktop';

jest.mock('react-native', () => jest.requireActual('react-native-web'));
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native-web');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
// SVG shapes as plain elements whose test id records what is drawn and how (solid or dashed).
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native-web');
  const shape = (kind: string) => (p: { children?: unknown; strokeDasharray?: string }) => <View testID={`${kind}:${p.strokeDasharray ?? 'solid'}`}>{p.children}</View>;
  const Svg = (p: { children?: unknown; 'aria-hidden'?: boolean }) => (
    <View testID="svg" aria-hidden={p['aria-hidden']}>
      {p.children}
    </View>
  );
  return { __esModule: true, default: Svg, Line: shape('line'), Rect: shape('rect'), Path: shape('path'), Circle: shape('circle'), Text: shape('text') };
});
jest.mock('@/ui/icons', () => ({ Icon: () => null, iconFor: () => 'circle' }));
// The shortcuts' controller (navigation is tested elsewhere): records the commands it is given.
const mockKeys = { run: jest.fn(), singleKeyShortcuts: true };
jest.mock('@/controllers/keyboardController', () => ({ useKeyboardController: () => mockKeys }));
jest.mock('@/views/screens/desktop/ShortcutsHelpScreen', () => ({ ShortcutsHelpScreen: () => null }));
jest.mock('@/ui/DatePicker', () => ({ DatePicker: () => null }));
// The display, with colorblind mode switchable per test.
const display = { colorblind: false };
jest.mock('@/state/PreferencesContext', () => {
  const { paletteFor, typeScale } = jest.requireActual('@/ui/theme');
  const { DEFAULT_PREFERENCES } = jest.requireActual('@/models/userPreferences');
  return {
    useDisplay: () => {
      const colors = paletteFor({ ...DEFAULT_PREFERENCES, colorblindMode: display.colorblind });
      return { preferences: DEFAULT_PREFERENCES, colors, type: typeScale(colors), colorblind: display.colorblind };
    },
  };
});

type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
let host: HTMLElement;
beforeEach(() => {
  display.colorblind = false;
  host = document.createElement('div');
  document.body.appendChild(host);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.innerHTML = '';
});

function render(ui: ReactNode) {
  if (!root) root = createRoot(host);
  act(() => root!.render(ui));
}
const all = (selector: string) => [...host.querySelectorAll<HTMLElement>(selector)];
const one = (selector: string) => {
  const found = all(selector);
  expect(found).toHaveLength(1);
  return found[0];
};
const byName = (role: string, name: string) => {
  const found = all(`[role="${role}"]`).filter((el) => (el.getAttribute('aria-label') ?? el.textContent) === name);
  expect(found).toHaveLength(1);
  return found[0];
};
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
const key = (el: Element, k: string) => act(() => void el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })));

// ── Charts ────────────────────────────────────────────────────────────────────

describe('charts: text alternatives (1.1.1)', () => {
  test('the spending chart is one image, named with what it shows', () => {
    render(<SpendAreaChart data={{ actual: [100, 250, 400], projected: [600, 900], previous: [120, 300, 500, 850] }} />);
    const img = one('[role="img"]');
    expect(img.getAttribute('aria-label')).toBe('Spending trend chart. Spent so far $400. Projected to reach $900. Previous period ended at $850.');
  });

  test('an empty spending chart still has a name, and says no more than it knows', () => {
    render(<SpendAreaChart data={{ actual: [], projected: [], previous: [] }} />);
    expect(one('[role="img"]').getAttribute('aria-label')).toBe('Spending trend chart.');
  });

  test('the cash flow chart is named by its start, low and end; the SVG labels are not read twice', () => {
    render(
      <CashFlowChart
        data={{ values: [3000, 1800, 2600], xLabels: ['Nov 1', 'Nov 15', 'Nov 30'], gridValues: [2000, 3000], lowIndex: 1, lowLabel: 'Low', endLabel: 'End' }}
      />,
    );
    const img = one('[role="img"]');
    expect(img.getAttribute('aria-label')).toBe('Projected cash chart. Starts at $3,000.00, lowest $1,800.00, ends at $2,600.00.');
    // The date labels are inside the image, so a screen reader hears the name, not each label.
    expect(img.textContent).toContain('Nov 15');
  });

  test('a cash flow chart with no data says so', () => {
    render(<CashFlowChart data={{ values: [], xLabels: [], gridValues: [] }} />);
    expect(one('[role="img"]').getAttribute('aria-label')).toBe('Projected cash chart with no data.');
  });

  const bars = [
    { label: 'W1', value: 120, semanticLabel: 'Week of Oct 5' },
    { label: 'W2', value: 80 },
    { label: '', value: 0 },
  ];

  test('each bar is named with its value; the axis labels are hidden so they are not read twice', () => {
    const container = host;
    render(<BarChart bars={bars} highlighted={0} />);
    const names = all('[aria-label]').map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['Week of Oct 5: $120.00', 'W2: $80.00', 'Bar 3: $0.00']);
    // Not buttons when nothing happens on a press: named images (a plain element may not be named).
    expect(all('[role="button"]')).toHaveLength(0);
    expect(all('[role="img"][aria-label]')).toHaveLength(3);
    // The visible axis row is hidden from assistive technology.
    const axis = [...container.querySelectorAll<HTMLElement>('[aria-hidden="true"]')];
    expect(axis.some((el) => el.textContent === 'W1W2')).toBe(true);
  });

  test('pressable bars are buttons; the highlighted one is pressed, and a click chooses a bar', () => {
    const onBarPress = jest.fn();
    render(<BarChart bars={bars} highlighted={1} onBarPress={onBarPress} />);
    const buttons = all('[role="button"]');
    expect(buttons).toHaveLength(3);
    // aria-pressed, not aria-selected (which a button may not have).
    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true', 'false']);
    expect(buttons.some((b) => b.hasAttribute('aria-selected'))).toBe(false);
    click(buttons[2]);
    expect(onBarPress).toHaveBeenCalledWith(2);
  });

  test('colorblind mode: the selected bar is hatched as well as coloured (1.4.1)', () => {
    render(<BarChart bars={bars} highlighted={0} />);
    expect(all('[data-testid="svg"]')).toHaveLength(0);
    display.colorblind = true;
    render(<BarChart bars={bars} highlighted={0} />);
    const hatch = one('[data-testid="svg"]');
    expect(hatch.children.length).toBeGreaterThan(10);
  });

  test('no bars: nothing to read', () => {
    render(<BarChart bars={[]} />);
    expect(all('[aria-label]')).toHaveLength(0);
  });
});

// Charts once laid out (jsdom has no layout: a ResizeObserver stand-in and a fixed width let
// react-native-web report one, so the charts draw).
describe('charts once drawn: not by colour alone (1.4.1)', () => {
  const realWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 320 });
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(private cb: (entries: { target: Element }[]) => void) {}
      observe(target: Element) {
        this.cb([{ target }]);
      }
      unobserve() {}
      disconnect() {}
    };
  });
  afterAll(() => {
    if (realWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', realWidth);
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });
  /** Lets react-native-web's measurement (a timeout) report the width. */
  const laidOut = () => act(async () => void (await new Promise((r) => setTimeout(r, 20))));
  const drawn = (prefix: string) => all(`[data-testid^="${prefix}"]`).map((el) => el.getAttribute('data-testid'));

  const spend = { actual: [100, 250, 400], projected: [600, 900], previous: [120, 300, 500, 850] };

  test('spending chart: the projection is dashed, so it is told from actual spend without colour', async () => {
    render(<SpendAreaChart data={spend} />);
    await laidOut();
    expect(one('[data-testid="svg"]')).toBeDefined();
    // previous, area, actual, projection.
    expect(drawn('path')).toEqual(['path:solid', 'path:solid', 'path:solid', 'path:6,4']);
    // Still one image with one name: the drawing adds nothing for a screen reader to wade through.
    expect(one('[role="img"]').getAttribute('aria-label')).toContain('Projected to reach $900.');
  });

  test('colorblind mode: the previous period is dotted as well as grey', async () => {
    display.colorblind = true;
    render(<SpendAreaChart data={spend} />);
    await laidOut();
    expect(drawn('path')[0]).toBe('path:2,3');
  });

  test('a single point is not drawn as a line (nothing misleading), but the chart is still named', async () => {
    render(<SpendAreaChart data={{ actual: [50], projected: [], previous: [] }} />);
    await laidOut();
    expect(drawn('path')).toEqual([]);
    expect(one('[role="img"]').getAttribute('aria-label')).toBe('Spending trend chart. Spent so far $50.');
  });

  test('cash flow chart: dashed gridlines with text values, and the low and end points labelled in text', async () => {
    render(
      <CashFlowChart
        data={{ values: [3000, 1800, 2600], xLabels: ['Nov 1', 'Nov 30'], gridValues: [2000, 3000], lowIndex: 1, lowLabel: 'Low $1.8k', endLabel: '$2.6k' }}
      />,
    );
    await laidOut();
    expect(drawn('line')).toEqual(['line:5,4', 'line:5,4']);
    const labels = all('[data-testid^="text"]').map((t) => t.textContent);
    // Two gridline values, then the low and end labels: the values are text, not only line positions.
    expect(labels).toHaveLength(4);
    expect(labels.slice(0, 2).every((l) => /\d/.test(l ?? ''))).toBe(true);
    expect(labels.slice(2)).toEqual(['Low $1.8k', '$2.6k']);
    // Low point and end point markers.
    expect(drawn('circle')).toHaveLength(2);
  });

  test('a flat cash flow still draws (no divide by zero), and an out-of-range low point is skipped', async () => {
    render(<CashFlowChart data={{ values: [500, 500], xLabels: [], gridValues: [], lowIndex: 9, lowLabel: 'Low' }} />);
    await laidOut();
    expect(drawn('path')).toEqual(['path:solid']);
    expect(drawn('circle')).toHaveLength(1);
    expect(all('[data-testid^="text"]')).toHaveLength(0);
  });
});

// ── Switches and radio groups ─────────────────────────────────────────────────

describe('switches (4.1.2, 2.1.1)', () => {
  test('a switch has the switch role, its name, and its on / off state', () => {
    render(<DSwitch label="High contrast" value onChange={() => {}} />);
    const sw = one('[role="switch"]');
    expect(sw.getAttribute('aria-label')).toBe('High contrast');
    expect(sw.getAttribute('aria-checked')).toBe('true');
    expect(sw.tabIndex).toBe(0);
  });

  test('a click or Space flips it; held-down Space (key repeat) does not flip it again', () => {
    const onChange = jest.fn();
    render(<DSwitch label="Budget alerts" value={false} onChange={onChange} />);
    const sw = one('[role="switch"]');
    click(sw);
    expect(onChange).toHaveBeenLastCalledWith(true);
    onChange.mockClear();
    key(sw, ' ');
    expect(onChange).toHaveBeenCalledWith(true);
    onChange.mockClear();
    act(() => void sw.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true, cancelable: true })));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('Space on a switch does not scroll the page', () => {
    render(<DSwitch label="Budget alerts" value={false} onChange={() => {}} />);
    const ev = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    act(() => void one('[role="switch"]').dispatchEvent(ev));
    expect(ev.defaultPrevented).toBe(true);
  });
});

describe('every group and graphic is named or hidden', () => {
  test('tab lists are named, so a screen reader says what the tabs choose', () => {
    render(
      <>
        <Tabs label="Customize sections" tabs={[{ label: 'Data' }, { label: 'Visual' }]} selected={0} onChange={() => {}} />
        <SegTabs label="Bills view" labels={['Upcoming', 'Recurring']} selected={1} onChange={() => {}} />
      </>,
    );
    expect(all('[role="tablist"]').map((t) => t.getAttribute('aria-label'))).toEqual(['Customize sections', 'Bills view']);
    expect(all('[role="tab"]').map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'true']);
  });
});

describe('graphics drawn once laid out are hidden; their container carries the name', () => {
  const realWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => 200 });
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(private cb: (entries: { target: Element }[]) => void) {}
      observe(target: Element) {
        this.cb([{ target }]);
      }
      unobserve() {}
      disconnect() {}
    };
  });
  afterAll(() => {
    if (realWidth) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', realWidth);
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });
  const laidOut = () => act(async () => void (await new Promise((r) => setTimeout(r, 20))));

  test('a progress bar: the bar is a named progressbar, its drawing is hidden', async () => {
    render(<ProgressBar value={0.3} label="Food budget used" />);
    await laidOut();
    const bar = one('[role="progressbar"]');
    expect(bar.getAttribute('aria-label')).toBe('Food budget used');
    const svg = bar.querySelector('[data-testid="svg"]')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  test('an unlabelled progress bar (decoration next to visible figures) is hidden entirely', async () => {
    render(<ProgressBar value={0.5} striped />);
    await laidOut();
    expect(all('[data-testid="svg"]').every((s) => s.closest('[aria-hidden="true"]'))).toBe(true);
  });

  test("charts' drawings are hidden; the named image around them is what is read", async () => {
    display.colorblind = true;
    render(
      <>
        <SpendAreaChart data={{ actual: [1, 2], projected: [3], previous: [1, 2, 3] }} />
        <CashFlowChart data={{ values: [1, 2], xLabels: [], gridValues: [] }} />
        <BarChart bars={[{ label: 'A', value: 1 }]} highlighted={0} />
      </>,
    );
    await laidOut();
    const svgs = all('[data-testid="svg"]');
    expect(svgs).toHaveLength(3);
    for (const s of svgs) expect(s.getAttribute('aria-hidden')).toBe('true');
    for (const img of all('[role="img"]')) expect(img.getAttribute('aria-label')).toBeTruthy();
  });
});

describe('radio groups (ARIA radio group pattern)', () => {
  function Group({ selected, onChange }: { selected: number; onChange: (i: number) => void }) {
    return <ChipGroup label="Period" labels={['Month', '3 months', 'Year']} selected={selected} onChange={onChange} />;
  }

  test('a named radiogroup of radios; only the chosen radio is checked', () => {
    render(<Group selected={1} onChange={() => {}} />);
    expect(one('[role="radiogroup"]').getAttribute('aria-label')).toBe('Period');
    const radios = all('[role="radio"]');
    expect(radios.map((r) => r.textContent)).toEqual(['Month', '3 months', 'Year']);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
  });

  test('one Tab stop: only the chosen radio is in the Tab order', () => {
    render(<Group selected={2} onChange={() => {}} />);
    expect(all('[role="radio"]').map((r) => r.tabIndex)).toEqual([-1, -1, 0]);
  });

  test('arrow keys move and choose, wrapping at the ends; Home and End jump', () => {
    const onChange = jest.fn();
    render(<Group selected={0} onChange={onChange} />);
    const radios = all('[role="radio"]');
    key(radios[0], 'ArrowRight');
    expect(document.activeElement).toBe(radios[1]);
    expect(onChange).toHaveBeenLastCalledWith(1);
    key(radios[0], 'ArrowUp');
    expect(document.activeElement).toBe(radios[2]);
    expect(onChange).toHaveBeenLastCalledWith(2);
    key(radios[2], 'ArrowDown');
    expect(onChange).toHaveBeenLastCalledWith(0);
    key(radios[1], 'Home');
    expect(onChange).toHaveBeenLastCalledWith(0);
    key(radios[0], 'End');
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  test('other keys are left alone (Tab still leaves the group)', () => {
    const onChange = jest.fn();
    render(<Group selected={0} onChange={onChange} />);
    const ev = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    act(() => void all('[role="radio"]')[0].dispatchEvent(ev));
    expect(ev.defaultPrevented).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });
});

// ── Keyboard shortcuts and focus (2.1.1, 2.1.4, 2.4.3) ───────────────────────

describe('keyboard shortcuts move focus where the user expects', () => {
  const realRects = Element.prototype.getClientRects;
  beforeAll(() => {
    // jsdom has no layout; focusById only focuses elements that are on screen.
    Element.prototype.getClientRects = function () {
      return [{}] as unknown as DOMRectList;
    };
  });
  afterAll(() => {
    Element.prototype.getClientRects = realRects;
  });
  beforeEach(() => {
    mockKeys.run.mockClear();
    mockKeys.singleKeyShortcuts = true;
  });

  /** The page: the main content (focusable by script) and, optionally, the top bar's search box. */
  function page({ search = true } = {}) {
    render(<KeyboardShortcutsView />);
    const main = document.createElement('div');
    main.id = MAIN_CONTENT_ID;
    main.tabIndex = -1;
    document.body.appendChild(main);
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    if (search) {
      const input = document.createElement('input');
      input.id = SEARCH_INPUT_ID;
      document.body.appendChild(input);
    }
    return { main, button };
  }
  const press = (init: KeyboardEventInit) => {
    const ev = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    act(() => void document.activeElement!.dispatchEvent(ev));
    return ev;
  };
  const afterNavigation = () => act(async () => void (await new Promise((r) => setTimeout(r, 80))));

  test('Ctrl+K puts focus in the search box when it is on screen (no command needed)', () => {
    page();
    const ev = press({ key: 'k', ctrlKey: true });
    expect(ev.defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe(SEARCH_INPUT_ID);
    expect(mockKeys.run).not.toHaveBeenCalled();
  });

  test('Ctrl+K with no search box on screen goes to the controller (it opens Transactions search)', () => {
    page({ search: false });
    press({ key: 'k', ctrlKey: true });
    expect(mockKeys.run).toHaveBeenCalledWith({ kind: 'search' });
  });

  test('after Ctrl+number goes to a section, focus moves to the new page so Tab carries on there', async () => {
    const { main } = page();
    press({ key: '2', code: 'Digit2', ctrlKey: true });
    expect(mockKeys.run).toHaveBeenCalledWith({ kind: 'section', section: 'transactions' });
    await afterNavigation();
    expect(document.activeElement).toBe(main);
  });

  test('Alt+← goes back, and focus follows to the page', async () => {
    const { main } = page();
    press({ key: 'ArrowLeft', altKey: true });
    expect(mockKeys.run).toHaveBeenCalledWith({ kind: 'back' });
    await afterNavigation();
    expect(document.activeElement).toBe(main);
  });

  test('commands that stay on the page (Ctrl+S) leave focus where it is', async () => {
    const { button } = page();
    press({ key: 's', ctrlKey: true });
    expect(mockKeys.run).toHaveBeenCalledWith({ kind: 'save' });
    await afterNavigation();
    expect(document.activeElement).toBe(button);
  });

  test('"?" opens the shortcuts list, unless single-key shortcuts are off; F1 always does (2.1.4)', () => {
    page();
    press({ key: '?' });
    expect(mockKeys.run).toHaveBeenLastCalledWith({ kind: 'help' });

    mockKeys.run.mockClear();
    mockKeys.singleKeyShortcuts = false;
    render(<KeyboardShortcutsView />);
    const ev = press({ key: '?' });
    expect(mockKeys.run).not.toHaveBeenCalled();
    // The key is left alone, so a screen reader or speech tool still gets it.
    expect(ev.defaultPrevented).toBe(false);
    press({ key: 'F1' });
    expect(mockKeys.run).toHaveBeenCalledWith({ kind: 'help' });
  });

  test('a held-down shortcut (key repeat) runs once', () => {
    page();
    press({ key: 's', ctrlKey: true });
    press({ key: 's', ctrlKey: true, repeat: true });
    expect(mockKeys.run).toHaveBeenCalledTimes(1);
  });
});

// ── Settings page ─────────────────────────────────────────────────────────────

const settingsData: SettingsData = {
  name: 'Alex Rivera',
  username: 'alex',
  initials: 'AR',
  connectedAccountCount: 2,
  themeLabel: 'Light',
  billReminder: { label: '3 days before', days: 3 } as unknown as SettingsData['billReminder'],
  highContrast: true,
  colorblindMode: false,
  showChartValues: true,
  budgetAlerts: false,
  keepNotices: true,
  singleKeyShortcuts: false,
  footerLabel: 'VERSION 1.0',
};

function settingsController(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    state: { status: 'ready', data: settingsData },
    data: settingsData,
    reload: jest.fn(),
    toggle: jest.fn(),
    openProfile: jest.fn(),
    openAccounts: jest.fn(),
    openBudgetCategories: jest.fn(),
    openStatements: jest.fn(),
    signOut: jest.fn(),
    deleteAccount: jest.fn(),
    pickTheme: jest.fn(),
    pickReminder: jest.fn(),
    sendTestReminder: jest.fn(),
    ...overrides,
  } as unknown as SettingsController & { toggle: jest.Mock; reload: jest.Mock; signOut: jest.Mock };
}

describe('Settings (desktop)', () => {
  const SWITCHES: [string, keyof SettingsData][] = [
    ['High contrast', 'highContrast'],
    ['Chart patterns and icons', 'colorblindMode'],
    ['Show values on charts', 'showChartValues'],
    ['Keep messages on screen', 'keepNotices'],
    ['Single-key shortcuts', 'singleKeyShortcuts'],
    ['Budget alerts', 'budgetAlerts'],
  ];

  test('one <h1> page title, and each panel title is a heading below it (1.3.1, 2.4.6)', () => {
    render(<SettingsDesktop controller={settingsController()} />);
    expect(all('h1').map((h) => h.textContent)).toEqual(['Settings']);
    const sections = all('h2, [role="heading"]').map((h) => h.textContent);
    expect(sections).toEqual(expect.arrayContaining(['Accounts & data', 'Account', 'Accessibility & display', 'Notifications']));
  });

  test.each(SWITCHES)('the "%s" switch is named by its visible title and shows the saved state', (title, field) => {
    const ctl = settingsController();
    render(<SettingsDesktop controller={ctl} />);
    const sw = byName('switch', title);
    expect(sw.getAttribute('aria-checked')).toBe(String(settingsData[field]));
    // Visible label and accessible name match (2.5.3 Label in Name).
    expect(host.textContent).toContain(title);
    click(sw);
    expect(ctl.toggle).toHaveBeenCalledWith(field, !settingsData[field]);
  });

  test('every switch can be flipped from the keyboard', () => {
    const ctl = settingsController();
    render(<SettingsDesktop controller={ctl} />);
    for (const [title, field] of SWITCHES) {
      key(byName('switch', title), ' ');
      expect(ctl.toggle).toHaveBeenLastCalledWith(field, !settingsData[field]);
    }
  });

  test('links to other pages are buttons named by their visible text (no hidden labels on desktop)', () => {
    const ctl = settingsController();
    render(<SettingsDesktop controller={ctl} />);
    const signOut = all('[role="button"]').find((b) => b.textContent === 'Sign out')!;
    expect(signOut).toBeDefined();
    expect(signOut.hasAttribute('aria-label')).toBe(false);
    click(signOut);
    expect(ctl.signOut).toHaveBeenCalled();
    // Value shown next to its row, inside the same button, so it is read with the title.
    expect(all('[role="button"]').some((b) => b.textContent === 'Connected accounts2')).toBe(true);
  });

  test('while loading, a named progress indicator; on an error, the message and a "Try again" button', () => {
    render(<SettingsDesktop controller={settingsController({ state: { status: 'loading' }, data: undefined })} />);
    expect(one('[role="progressbar"]').getAttribute('aria-label')).toBe('Loading');

    const ctl = settingsController({ state: { status: 'error', error: 'Could not load settings.' }, data: undefined });
    render(<SettingsDesktop controller={ctl} />);
    expect(host.textContent).toContain('Could not load settings.');
    const retry = all('[role="button"]').find((b) => (b.getAttribute('aria-label') ?? b.textContent) === 'Try again')!;
    click(retry);
    expect(ctl.reload).toHaveBeenCalled();
  });
});

// ── Notifications page ────────────────────────────────────────────────────────

const items: NotificationItem[] = [
  { id: 'a', kind: 'overdue', isNew: true, metaLabel: 'Bill overdue', title: 'Rent', body: 'Rent was due Nov 1.', primaryActionLabel: 'Mark paid', secondaryActionLabel: 'View bill' },
  { id: 'b', kind: 'nearLimit', isNew: false, metaLabel: 'Budget', title: 'Dining at 80%', body: '$40 left this month.' },
];

function notificationsController(list: NotificationItem[], overrides: Partial<Record<string, unknown>> = {}) {
  return {
    state: { status: 'ready', data: { filterLabels: ['All', 'Bills', 'Budgets'], selectedFilter: 0, items: list } },
    reload: jest.fn(),
    filter: 0,
    filterLabels: ['All', 'Bills', 'Budgets'],
    setFilter: jest.fn(),
    markAllRead: jest.fn(),
    runPrimary: jest.fn(),
    open: jest.fn(),
    openSettings: jest.fn(),
    ...overrides,
  } as unknown as NotificationsController & Record<'setFilter' | 'runPrimary' | 'open' | 'markAllRead', jest.Mock>;
}

describe('Notifications (desktop)', () => {
  test('the filter is a named radio group, operable with arrow keys', () => {
    const ctl = notificationsController(items);
    render(<NotificationsDesktop controller={ctl} />);
    expect(one('[role="radiogroup"]').getAttribute('aria-label')).toBe('Show');
    const [allRadio] = all('[role="radio"]');
    expect(allRadio.getAttribute('aria-checked')).toBe('true');
    key(allRadio, 'ArrowRight');
    expect(ctl.setFilter).toHaveBeenCalledWith(1);
  });

  test('each card is read with "New", its kind, title and message, in visual order', () => {
    render(<NotificationsDesktop controller={notificationsController(items)} />);
    const card = all('[role="button"]').find((b) => b.textContent?.startsWith('New · Bill overdue'))!;
    expect(card.textContent).toContain('Rent');
    expect(card.textContent).toContain('Rent was due Nov 1.');
    const old = all('[role="button"]').find((b) => b.textContent?.startsWith('Budget'))!;
    expect(old.textContent).not.toContain('New');
  });

  test('action buttons are separate controls with their own names, not inside the card button (4.1.2)', () => {
    const ctl = notificationsController(items);
    render(<NotificationsDesktop controller={ctl} />);
    // No interactive element inside another (axe: nested-interactive).
    for (const b of all('[role="button"]')) expect(b.querySelector('[role="button"], button, [tabindex]')).toBeNull();
    const markPaid = byName('button', 'Mark paid');
    click(markPaid);
    expect(ctl.runPrimary).toHaveBeenCalledWith(items[0]);
    click(byName('button', 'View bill'));
    expect(ctl.open).toHaveBeenCalledWith(items[0]);
    click(byName('button', 'Mark all read'));
    expect(ctl.markAllRead).toHaveBeenCalled();
  });

  test('with nothing to show, a plain message (not an empty list)', () => {
    render(<NotificationsDesktop controller={notificationsController([])} />);
    expect(host.textContent).toContain("You're all caught up.");
    expect(all('[role="list"]')).toHaveLength(0);
  });
});
