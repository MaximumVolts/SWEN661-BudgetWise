// Every screen, in the phone layout and the desktop layout: each element that assistive technology
// treats as a control, image, group or region has an accessible name, from its label or its
// visible text (WCAG 1.1.1, 2.4.6, 4.1.2). Screens render with the real services and data.
import { render } from '@testing-library/react-native';
import { fireEvent } from 'expo-router/testing-library';
import { Pressable, Text, TextInput, View } from 'react-native';
import { openApp, screen, settle } from './support/app';
import { type SandboxApp, sandboxServices, TEST_BUDGETS } from './support/sandbox';

const mockLayout = { desktop: false };
jest.mock('@/ui/responsive', () => ({
  ...jest.requireActual('@/ui/responsive'),
  useDesktop: () => mockLayout.desktop,
}));
jest.setTimeout(60000);

/** Roles that must have a name (React Native's and the ARIA names react-native-web takes). */
const NEEDS_NAME = new Set([
  'button', 'link', 'checkbox', 'radio', 'switch', 'tab', 'togglebutton', 'imagebutton', 'image', 'img',
  'adjustable', 'slider', 'spinbutton', 'combobox', 'search', 'searchbox', 'menuitem', 'option',
  'progressbar', 'tablist', 'radiogroup', 'listbox', 'menu', 'toolbar', 'dialog', 'alertdialog',
  'table', 'navigation', 'region', 'form', 'header', 'heading', 'columnheader', 'rowheader',
]);

/** A rendered element, as the test renderer gives it (host elements have a string type). */
type Node = { type: unknown; props: Record<string, unknown>; children: (Node | string)[]; parent: Node | null };
const isHost = (n: Node) => typeof n.type === 'string';
/** Hidden from assistive technology (and so needs no name). */
const hides = (n: Node) =>
  n.props['aria-hidden'] === true || n.props.importantForAccessibility === 'no-hide-descendants' || n.props.accessibilityElementsHidden === true;
/** Icon-font glyphs (private use area) are pictures, not words. */
const words = (s: string) => s.replace(/[\uE000-\uF8FF]/g, '').trim();

/** The text a screen reader would read for [n]'s content (not counting hidden parts). */
function textOf(n: Node | string): string {
  if (typeof n === 'string') return n;
  if (hides(n)) return '';
  if (isHost(n) && (n.props.accessibilityLabel || n.props['aria-label'])) return String(n.props.accessibilityLabel ?? n.props['aria-label']);
  return n.children.map(textOf).join(' ');
}

function nameOf(n: Node): string {
  const label = n.props.accessibilityLabel ?? n.props['aria-label'];
  if (typeof label === 'string' && words(label)) return label;
  if (n.props['aria-labelledby'] || n.props.accessibilityLabelledBy) return 'labelled by another element';
  return words(n.children.map(textOf).join(' ').replace(/\s+/g, ' '));
}

/** Elements under [root] that need a name: those without one (described), and how many have one. */
function audit(root = screen.root as unknown as Node): { unnamed: string[]; named: number } {
  const out: string[] = [];
  let named = 0;
  const visit = (n: Node) => {
    if (hides(n)) return;
    if (isHost(n)) {
      const role = String(n.props.accessibilityRole ?? n.props.role ?? '');
      const field = ['TextInput', 'RCTSinglelineTextInputView', 'RCTMultilineTextInputView'].includes(String(n.type));
      if (NEEDS_NAME.has(role) || field) {
        if (nameOf(n)) named++;
        else out.push(`${field ? 'text field' : role} (${String(n.type)}${n.props.testID ? ' #' + String(n.props.testID) : ''}) near "${words(textOf(n.parent ?? n)).slice(0, 60)}"`);
      }
    }
    n.children.forEach((c) => typeof c !== 'string' && visit(c));
  };
  visit(root);
  return { unnamed: out, named };
}

/** Fails with the list of unnamed elements; also checks the walk reached the screen's controls. */
function expectAllNamed() {
  const { unnamed, named } = audit();
  expect(unnamed).toEqual([]);
  expect(named).toBeGreaterThan(2);
}

let app: SandboxApp | undefined;
afterEach(() => {
  app?.bankData.stopRetrying();
  app = undefined;
});

const SIGNED_IN = [
  '/', '/transactions', '/spending', '/budgets', '/bills', '/comparison', '/goals', '/cash-flow', '/trends',
  '/accounts', '/add-account', '/notifications', '/settings', '/profile', '/statements', '/manage-budgets',
  '/budget-form', '/bill-form', '/goal-form', '/expected-income-form', '/budget-category/food',
];
const SIGNED_OUT = ['/sign-in', '/create-account', '/forgot-password'];

describe.each([
  ['phone', false],
  ['desktop', true],
])('%s layout', (_layout, desktop) => {
  beforeEach(() => {
    mockLayout.desktop = desktop;
  });

  test.each(SIGNED_IN)('%s: everything that needs a name has one', async (url) => {
    app = await openApp(url, await sandboxServices({ budgets: TEST_BUDGETS }));
    await settle(200);
    expectAllNamed();
  });

  test.each(SIGNED_OUT)('%s (signed out): everything that needs a name has one', async (url) => {
    app = await openApp(url, await sandboxServices({ signIn: false }));
    await settle(200);
    expectAllNamed();
  });

  test('onboarding and connecting a bank', async () => {
    app = await openApp('/onboarding', await sandboxServices({ linkBank: false }));
    await settle(200);
    expectAllNamed();
    app.bankData.stopRetrying();
    app = await openApp('/connect-bank', await sandboxServices({ linkBank: false }));
    await settle(200);
    expectAllNamed();
  });

  test('detail pages: a transaction, a bill and a spending category', async () => {
    app = await openApp('/transactions', await sandboxServices({ budgets: TEST_BUDGETS }));
    await fireEvent.press(screen.getAllByText('Uber')[0]);
    await settle(200);
    expectAllNamed();

    const [bill] = await app.services.bills.upcomingWithDates();
    const [category] = (await app.services.spending.getSpending(2)).categories;
    for (const url of [`/bill/${bill.bill.id}`, `/spending-category/${category.id}`]) {
      app.bankData.stopRetrying();
      app = await openApp(url, app);
      await settle(200);
      expectAllNamed();
    }
  });
});

describe('the checker itself', () => {
  test('finds an unnamed icon button, and accepts names from labels or visible text', async () => {
    await render(
      <View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" />
        <Pressable accessibilityRole="button">
          <Text>Save</Text>
        </Pressable>
        <Pressable accessibilityRole="button">
          <Text>{String.fromCharCode(0xe5cd)}</Text>
        </Pressable>
        <View aria-hidden>
          <Pressable accessibilityRole="button" />
        </View>
        <TextInput />
        <TextInput accessibilityLabel="Amount" />
      </View>,
    );
    const { unnamed, named } = audit();
    expect(unnamed).toEqual([expect.stringMatching(/^button /), expect.stringMatching(/^text field /)]);
    expect(named).toBe(3);
  });
});
