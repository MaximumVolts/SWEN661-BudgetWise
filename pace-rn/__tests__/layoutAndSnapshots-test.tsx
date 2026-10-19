// Responsive layout (phone vs tablet) and snapshot tests of shared components and whole screens.
import { render, screen as rendered } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders } from '@/state/AppProviders';
import { BarChart } from '@/ui/charts';
import { Card, PillButton, ProgressBar, SectionHeader, StatusLabel } from '@/ui/components';
import { NavBar } from '@/ui/NavBar';
import { CONTENT_MAX_WIDTH, layoutFor, TABLET_MIN_WIDTH, WIDE_CONTENT_MAX_WIDTH } from '@/ui/responsive';
import { BudgetRow } from '@/ui/rows';
import { openApp, screen, settle } from './support/app';
import { type SandboxApp, sandboxServices } from './support/sandbox';

// The window size the app sees; tests set it before rendering.
const windowSize = { width: 390, height: 844 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ ...windowSize, scale: 2, fontScale: 1 }),
}));

// React Navigation gives each screen a random key (e.g. screenId="settings-VLjUEd1CNNJ_gwBhdqlL1");
// snapshots show it as "settings-<key>" so they stay the same from run to run.
const ROUTE_KEY = /-[A-Za-z0-9_-]{21}$/;
expect.addSnapshotSerializer({
  test: (v) => typeof v === 'string' && ROUTE_KEY.test(v),
  serialize: (v: string) => JSON.stringify(v.replace(ROUTE_KEY, '-<key>')),
});

let app: SandboxApp | undefined;
afterEach(() => {
  app?.bankData.stopRetrying();
  app = undefined;
  Object.assign(windowSize, { width: 390, height: 844 });
});

/** Every rendered node whose (flattened) style sets maxWidth to [width]. */
function nodesWithMaxWidth(tree: ReturnType<typeof screen.toJSON>, width: number): unknown[] {
  const found: unknown[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(walk);
    const n = node as { props?: { style?: unknown }; children?: unknown[] };
    if ((StyleSheet.flatten(n.props?.style as never) as { maxWidth?: unknown } | undefined)?.maxWidth === width) found.push(n);
    n.children?.forEach(walk);
  };
  walk(tree);
  return found;
}

describe('layoutFor', () => {
  test('phones fill the window with one column', () => {
    expect(layoutFor(390)).toEqual({ isTablet: false, columns: 1 });
    expect(layoutFor(TABLET_MIN_WIDTH - 1, true)).toEqual({ isTablet: false, columns: 1 });
  });

  test('tablets center content at a readable width', () => {
    expect(layoutFor(TABLET_MIN_WIDTH)).toEqual({ isTablet: true, columns: 1, maxWidth: CONTENT_MAX_WIDTH });
    expect(layoutFor(1024)).toEqual({ isTablet: true, columns: 1, maxWidth: CONTENT_MAX_WIDTH });
  });

  test('wide screens get two columns on tablets', () => {
    expect(layoutFor(1024, true)).toEqual({ isTablet: true, columns: 2, maxWidth: WIDE_CONTENT_MAX_WIDTH });
  });
});

describe('Responsive screens', () => {
  test('on a phone the dashboard is one full-width column', async () => {
    app = await openApp('/');
    expect(screen.getByText('ACCOUNTS')).toBeTruthy();
    expect(nodesWithMaxWidth(screen.toJSON(), WIDE_CONTENT_MAX_WIDTH)).toHaveLength(0);
  });

  test('on a tablet the dashboard is centered with accounts and budgets side by side', async () => {
    Object.assign(windowSize, { width: 1024, height: 1366 });
    app = await openApp('/');
    expect(nodesWithMaxWidth(screen.toJSON(), WIDE_CONTENT_MAX_WIDTH)).toHaveLength(1);
    // ACCOUNTS and YOUR BUDGET are in different columns of the same row.
    const columnOf = (text: string) => {
      let node = screen.getByText(text).parent;
      while (node && StyleSheet.flatten(node.parent?.props.style)?.flexDirection !== 'row') node = node.parent;
      return node;
    };
    const accounts = columnOf('ACCOUNTS');
    const budget = columnOf('YOUR BUDGET');
    expect(accounts).toBeTruthy();
    expect(accounts?.parent).toBe(budget?.parent);
    expect(accounts).not.toBe(budget);
  });

  test('on a tablet other screens are one centered column', async () => {
    Object.assign(windowSize, { width: 1024, height: 1366 });
    app = await openApp('/settings');
    expect(nodesWithMaxWidth(screen.toJSON(), CONTENT_MAX_WIDTH).length).toBeGreaterThan(0);
  });
});

describe('Snapshots', () => {
  /** Renders [ui] inside the app's providers (theme, dialogs…) on signed-out test services. */
  async function renderInApp(ui: React.ReactElement) {
    app = await sandboxServices({ signIn: false });
    // Fixed safe area metrics, so the providers render straight away.
    const metrics = { frame: { x: 0, y: 0, ...windowSize }, insets: { top: 0, left: 0, right: 0, bottom: 0 } };
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <AppProviders services={app.services}>
          <View testID="snapshot-root">{ui}</View>
        </AppProviders>
      </SafeAreaProvider>,
    );
    await rendered.findByTestId('snapshot-root');
    return rendered.getByTestId('snapshot-root');
  }

  test('shared components', async () => {
    const root = await renderInApp(
      <Card>
        <SectionHeader title="YOUR BUDGET" action="See budget" onAction={() => {}} />
        <ProgressBar value={0.42} label="October budget used" />
        <StatusLabel status="nearLimit" />
        <PillButton label="Save" onPress={() => {}} />
        <BudgetRow b={{ id: 'food', name: 'Food & drink', iconKey: 'food', spent: 180, limit: 250, status: 'nearLimit' }} />
        <BarChart bars={[{ label: 'Aug', value: 1200 }, { label: 'Sep', value: 950 }, { label: 'Oct', value: 400 }]} />
      </Card>,
    );
    expect(root).toBeTruthy();
    expect(rendered.getByLabelText('October budget used')).toBeTruthy();
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  test('bottom navigation bar', async () => {
    await renderInApp(<NavBar selected={2} onSelect={() => {}} />);
    expect(rendered.getByRole('tab', { name: 'Spending' }).props.accessibilityState).toMatchObject({ selected: true });
    expect(rendered.toJSON()).toMatchSnapshot();
  });

  test('sign in screen', async () => {
    app = await openApp('/sign-in', await sandboxServices({ signIn: false }));
    await settle();
    expect(screen.toJSON()).toMatchSnapshot();
  });

  test('settings screen', async () => {
    app = await openApp('/settings');
    expect(screen.toJSON()).toMatchSnapshot();
  });
});
