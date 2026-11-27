/**
 * @jest-environment jsdom
 */
// The desktop (web) accessibility fixes found with axe, in a real DOM: React Native renders through
// react-native-web, as it does in the desktop app, so roles and ARIA attributes are the browser's.
import { act, type ReactNode } from 'react';
import { Text } from 'react-native';
import { DEFAULT_PREFERENCES } from '@/models/userPreferences';
import { Heading, ProgressBar, ScreenReaderText, Tap } from '@/ui/components';
import { DTable } from '@/ui/desktop';
import { Backdrop, dialogName, FocusPressable, phoneLabel } from '@/ui/keyboard';
import { paletteFor, typeScale } from '@/ui/theme';

// Hoisted above the imports by Jest: 'react-native' here is react-native-web.
jest.mock('react-native', () => jest.requireActual('react-native-web'));
// Native modules the components import, which jsdom has none of.
jest.mock('react-native-safe-area-context', () => {
  const { View } = jest.requireActual('react-native-web');
  return { SafeAreaView: View, useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }) };
});
jest.mock('react-native-svg', () => {
  const { View } = jest.requireActual('react-native-web');
  return { __esModule: true, default: View, Line: View, Rect: View };
});
jest.mock('@/ui/icons', () => ({ Icon: () => null, iconFor: () => 'circle' }));
jest.mock('@/ui/DatePicker', () => ({ DatePicker: () => null }));
// The default display (no signed-in user's preferences to load).
jest.mock('@/state/PreferencesContext', () => {
  const { paletteFor: palette, typeScale: scale } = jest.requireActual('@/ui/theme');
  const { DEFAULT_PREFERENCES: prefs } = jest.requireActual('@/models/userPreferences');
  const colors = palette(prefs);
  return { useDisplay: () => ({ preferences: prefs, colors, type: scale(colors), colorblind: false }) };
});

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
});

function render(ui: ReactNode) {
  root = createRoot(host);
  act(() => root!.render(ui));
}

const all = (selector: string) => [...host.querySelectorAll<HTMLElement>(selector)];
const one = (selector: string) => {
  const found = all(selector);
  expect(found).toHaveLength(1);
  return found[0];
};
const click = (el: Element) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true })));

test('the default palette is what the components are drawn with', () => {
  // Guards the mock above: the real palette and type scale, not stand-ins.
  expect(typeScale(paletteFor(DEFAULT_PREFERENCES))).toBeTruthy();
});

describe('names', () => {
  test('on desktop a control with visible text is named by it (no label of its own)', () => {
    expect(phoneLabel('Uber, Nov 10, $5.40')).toBeUndefined();
  });

  test('a picker field is named by its label and what it shows', () => {
    render(
      <Tap onPress={() => {}} label={phoneLabel('Period A: October 2026')}>
        <Text>Period A</Text>
        <Text>October 2026</Text>
      </Tap>,
    );
    const button = one('[role="button"]');
    expect(button.getAttribute('aria-label')).toBeNull();
    expect(button.textContent).toBe('Period AOctober 2026');
  });

  test('words only screen readers hear take no room and are not drawn', () => {
    render(<ScreenReaderText> new</ScreenReaderText>);
    const text = host.firstElementChild as HTMLElement;
    expect(text.textContent).toBe(' new');
    expect(text.style.position).toBe('absolute');
    expect(text.style.opacity).toBe('0');
  });
});

describe('roles and states', () => {
  test('a page title is an <h1>; other headings default to <h2>', () => {
    render(
      <>
        <Heading level={1}>Transactions</Heading>
        <Heading>This month</Heading>
      </>,
    );
    expect(host.querySelector('h1')?.textContent).toBe('Transactions');
    expect(host.querySelector('h2')?.textContent).toBe('This month');
  });

  test('a labelled progress bar is a progressbar with its value', () => {
    render(<ProgressBar value={0.42} label="Groceries budget used" />);
    const bar = one('[role="progressbar"]');
    expect(bar.getAttribute('aria-label')).toBe('Groceries budget used');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  test('an unlabelled progress bar is decoration (no role)', () => {
    render(<ProgressBar value={0.5} />);
    expect(all('[role="progressbar"]')).toHaveLength(0);
  });

  test('a radio is checked, not selected, even when given "selected"', () => {
    render(
      <>
        <Tap role="radio" selected onPress={() => {}}>
          <Text>Food</Text>
        </Tap>
        <Tap role="radio" selected={false} onPress={() => {}}>
          <Text>Travel</Text>
        </Tap>
      </>,
    );
    const [on, off] = all('[role="radio"]');
    expect(on.getAttribute('aria-checked')).toBe('true');
    expect(off.getAttribute('aria-checked')).toBe('false');
    expect(on.hasAttribute('aria-selected')).toBe(false);
  });

  test("a FocusPressable radio's checked state reaches the DOM", () => {
    render(
      <FocusPressable ringColor="#000" accessibilityRole="radio" accessibilityState={{ checked: true }} onPress={() => {}}>
        <Text>Tartan Bank</Text>
      </FocusPressable>,
    );
    expect(one('[role="radio"]').getAttribute('aria-checked')).toBe('true');
  });
});

describe('dialogs', () => {
  test('a Modal is named by its title', () => {
    expect(dialogName('Customize')).toEqual({ 'aria-label': 'Customize' });
  });

  test('the backdrop closes on a click but is hidden from screen readers and can never take focus', () => {
    const onPress = jest.fn();
    render(<Backdrop onPress={onPress} />);
    const backdrop = host.firstElementChild as HTMLElement;
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');
    // Not even tabindex -1: a dialog's focus trap focuses by script when Shift+Tab wraps.
    expect(backdrop.hasAttribute('tabindex')).toBe(false);
    backdrop.focus();
    expect(document.activeElement).not.toBe(backdrop);
    expect(backdrop.hasAttribute('aria-label')).toBe(false);
    click(backdrop);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('tables', () => {
  const columns = [{ label: 'Name' }, { label: 'Amount' }, { label: 'Actions' }];

  test('a table to screen readers: column headers, then rows of a row header and cells', () => {
    render(
      <DTable
        label="Transactions"
        columns={columns.slice(0, 2)}
        rows={[
          { key: 'a', cells: ['Uber', '$5.40'], onPress: () => {} },
          { key: 'b', cells: ['Total', '$5.40'], tone: 'total' },
        ]}
      />,
    );
    const table = one('[role="table"]');
    expect(table.getAttribute('aria-label')).toBe('Transactions');
    expect(all('[role="columnheader"]').map((h) => h.textContent)).toEqual(['Name', 'Amount']);
    const rows = all('[role="rowgroup"]')[1].children;
    expect([...rows].map((r) => r.getAttribute('role'))).toEqual(['row', 'row']);
    // Every child of a row is a row header or a cell, so each value is read with its column name.
    for (const r of rows) expect([...r.children].map((c) => c.getAttribute('role'))).toEqual(['rowheader', 'cell']);
    expect(rows[0].textContent).toBe('Uber$5.40');
    // A row that opens: its button sits in the row header, named by the cells with their columns.
    const row = one('[role="button"]');
    expect(row.getAttribute('aria-label')).toBe('Uber, Amount: $5.40');
    expect(row.parentElement!.getAttribute('role')).toBe('rowheader');
  });

  test('a row with actions: the row and its menu button are side by side, not one inside the other', () => {
    const open = jest.fn();
    const menu = jest.fn();
    render(
      <DTable
        columns={columns}
        rows={[
          {
            key: 'a',
            cells: ['Netflix', '$15.49'],
            label: 'Netflix, $15.49',
            onPress: open,
            actions: (
              <Tap onPress={menu} label="Options for Netflix">
                <Text>⋮</Text>
              </Tap>
            ),
          },
        ]}
      />,
    );
    const [row, options] = all('[role="button"]');
    expect(row.getAttribute('aria-label')).toBe('Netflix, $15.49');
    expect(options.getAttribute('aria-label')).toBe('Options for Netflix');
    expect(row.contains(options)).toBe(false);
    expect(row.querySelector('[tabindex]')).toBeNull();
    // The menu has a cell of its own, under the Actions column.
    expect(options.closest('[role="cell"]')).not.toBeNull();
    expect(all('[role="row"]')[1].children.length).toBe(3);

    click(options);
    expect(menu).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    click(row);
    expect(open).toHaveBeenCalled();
  });
});
