// The desktop frame around the signed-in pages: sidebar, top bar (breadcrumb, search, notifications)
// and the keyboard shortcuts. The real root layout only adds the frame in the web build, so this
// opens the app under a root layout that always does (the pages and services are the real ones).
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { act, fireEvent } from 'expo-router/testing-library';
import { type KeyboardController, useKeyboardController } from '@/controllers/keyboardController';
import { AppProviders } from '@/state/AppProviders';
import { appServices } from '@/state/ServicesContext';
import { AppFrameView } from '@/views/AppFrameView';
import { KeyboardShortcutsView } from '@/views/KeyboardShortcutsView';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle } from './support/app';
import { type SandboxApp, sandboxServices } from './support/sandbox';

jest.mock('@/ui/responsive', () => ({
  ...jest.requireActual('@/ui/responsive'),
  useDesktop: () => true,
}));
jest.setTimeout(30000);

/** The keyboard shortcuts' controller, so tests can run commands as the shortcut keys would. */
let keys: KeyboardController;
function KeyboardProbe() {
  const ctl = useKeyboardController();
  useEffect(() => {
    keys = ctl;
  });
  return null;
}

function DesktopRoot() {
  return (
    <AppProviders services={appServices()}>
      <AppFrameView mode="app">
        <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
      </AppFrameView>
      <KeyboardShortcutsView />
      <KeyboardProbe />
    </AppProviders>
  );
}

let app: SandboxApp | undefined;
afterEach(() => {
  app?.bankData.stopRetrying();
  app = undefined;
});

const openDesktop = async (url = '/', services?: SandboxApp) => {
  app = await openApp(url, services, { _layout: DesktopRoot });
  await settle(100);
};
const crumb = () => screen.getByLabelText(/^(Overview|Tools), /).props.accessibilityLabel;
const sidebar = (name: string) => screen.getByRole('link', { name });
const run = async (command: Parameters<KeyboardController['run']>[0]) => {
  await act(async () => keys.run(command));
  await settle(100);
};

describe('sidebar and top bar', () => {
  test('the sidebar opens each section; the breadcrumb follows', async () => {
    await openDesktop();
    expect(crumb()).toBe('Overview, Home');
    await fireEvent.press(sidebar('Budgets'));
    await settle();
    expect(pathname()).toBe('/budgets');
    expect(crumb()).toBe('Overview, Budgets');

    await fireEvent.press(sidebar('Monthly Comparison'));
    await settle();
    expect(crumb()).toBe('Tools, Monthly Comparison');

    await fireEvent.press(sidebar('Settings'));
    await settle();
    expect(pathname()).toBe('/settings');

    // "Overview" in the breadcrumb goes home.
    await fireEvent.press(sidebar('Transactions'));
    await settle();
    await press('Overview');
    expect(pathname()).toBe('/');
  });

  test('category pages are named after their category', async () => {
    await openDesktop('/budget-category/food', await sandboxServices({ budgets: { food: 400 } }));
    expect(crumb()).toMatch(/^Overview, Food/);
  });

  test('profile and notifications, with the unread count', async () => {
    await openDesktop();
    // The top bar's bell (the sidebar has a Notifications link too).
    const bell = screen.getAllByLabelText(/^Notifications/).find((e) => e.props.accessibilityRole !== 'link')!;
    await fireEvent.press(bell);
    await settle();
    expect(pathname()).toBe('/notifications');
    await fireEvent.press(screen.getByLabelText(/^Profile: /));
    await settle();
    expect(pathname()).toBe('/profile');
  });

  test('the keyboard shortcuts list opens from the top bar and closes', async () => {
    await openDesktop();
    await pressLabel('Keyboard shortcuts');
    expect(screen.getByLabelText('Close keyboard shortcuts')).toBeTruthy();
    expect(screen.getByLabelText(/^Search transactions and go to a page: (Ctrl|⌘) plus K$/)).toBeTruthy();
    await pressButton('Done');
    expect(screen.queryByLabelText('Close keyboard shortcuts')).toBeNull();
    await pressLabel('Keyboard shortcuts');
    await pressLabel('Close keyboard shortcuts');
    expect(keys.helpOpen).toBe(false);
  });
});

describe('search box', () => {
  const box = () => screen.getByLabelText('Search transactions or go to a page');
  const key = async (k: string) => {
    await fireEvent(box(), 'keyPress', { nativeEvent: { key: k }, preventDefault: () => undefined });
    await settle(5);
  };

  test('focused and empty, it offers quick destinations', async () => {
    await openDesktop();
    await fireEvent(box(), 'focus');
    await settle(5);
    expect(screen.getByText('Quick destinations')).toBeTruthy();
    await key('ArrowDown');
    await key('ArrowUp');
    await key('Enter'); // opens the chosen destination
    expect(pathname()).not.toBe('/');
  });

  test('typing offers a transaction search first; Enter runs it', async () => {
    await openDesktop();
    await fireEvent(box(), 'focus');
    await fireEvent.changeText(box(), 'coffee');
    await settle(5);
    expect(screen.getByText('Search transactions for “coffee”')).toBeTruthy();
    await key('Enter');
    expect(pathname()).toBe('/transactions');
    expect(screen.getByLabelText('Search transactions').props.value).toBe('coffee');
    expect(box().props.value).toBe('');
  });

  test('↓ to a page and Enter goes there; a result can be clicked; Esc clears', async () => {
    await openDesktop();
    await fireEvent(box(), 'focus');
    await fireEvent.changeText(box(), 'budg');
    await settle(5);
    await key('ArrowDown');
    await key('Enter');
    expect(pathname()).toBe('/budgets');

    for (const [text, result, path] of [
      ['acc', 'Go to Accounts', '/accounts'],
      ['prof', 'Go to Profile', '/profile'],
      ['state', 'Go to Statements', '/statements'],
    ]) {
      await fireEvent(box(), 'focus');
      await fireEvent.changeText(box(), text);
      await settle(5);
      await press(result);
      expect(pathname()).toBe(path);
    }

    await fireEvent(box(), 'focus');
    await fireEvent.changeText(box(), 'bills');
    await settle(5);
    await pressLabel('Clear search');
    expect(box().props.value).toBe('');
    await fireEvent.changeText(box(), 'bills');
    await key('Escape');
    expect(box().props.value).toBe('');
    await fireEvent(box(), 'blur');
    await settle(200);
    expect(screen.queryByLabelText('Search results')).toBeNull();
  });
});

describe('keyboard commands', () => {
  test('sections, back and forward, search and help', async () => {
    await openDesktop();
    await run({ kind: 'section', section: 'goals' });
    expect(pathname()).toBe('/goals');
    await run({ kind: 'back' });
    expect(pathname()).toBe('/');
    await run({ kind: 'back' }); // nowhere to go back to: stays
    expect(pathname()).toBe('/');
    await run({ kind: 'forward' });
    await run({ kind: 'search' });
    expect(pathname()).toBe('/transactions');
    await run({ kind: 'help' });
    expect(keys.helpOpen).toBe(true);
    await act(async () => keys.closeHelp());
    expect(keys.helpOpen).toBe(false);
  });

  test('Save, New and Print go to the page on screen', async () => {
    await openDesktop();
    await run({ kind: 'save' }); // Home saves as you go
    expect(screen.getByText('Nothing to save here: Pace saves your changes as you make them.')).toBeTruthy();

    await run({ kind: 'section', section: 'budgets' });
    await run({ kind: 'new' });
    expect(pathname()).toBe('/budget-form');
    await run({ kind: 'save' }); // the form validates
    expect(pathname()).toBe('/budget-form');

    await run({ kind: 'section', section: 'comparison' });
    await run({ kind: 'print' });
    expect(app!.saver.saved.at(-1)?.format).toBe('pdf');
  });
});
