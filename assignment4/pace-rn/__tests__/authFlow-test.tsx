import { act } from 'expo-router/testing-library';
import { openApp, pathname, press, pressButton, pressLabel, screen, settle, type } from './support/app';
import { sandboxServices, TEST_PLAID_CLIENT_ID, TEST_PLAID_SECRET } from './support/sandbox';

afterEach(() => jest.clearAllTimers());

test('signed out, the app opens on sign-in; Google / Apple buttons are not offered', async () => {
  const app = await openApp('/', await sandboxServices({ signIn: false }));
  expect(pathname()).toBe('/sign-in');
  expect(screen.getByText('Your money, at your pace.')).toBeTruthy();
  expect(screen.queryByText(/Google|Apple/)).toBeNull();
  app.bankData.stopRetrying();
});

test('sign in: field errors from the service, then Home', async () => {
  const app = await sandboxServices({ linkBank: false });
  await app.services.auth.signOut();
  await openApp('/', app);

  await press('Sign in');
  expect(screen.getByText('Enter your username')).toBeTruthy();
  await type('Username', 'ada');
  await type('Password', 'wrong');
  await press('Sign in');
  expect(screen.getByText('Username or password is incorrect')).toBeTruthy();

  await type('Password', 'secret123');
  await press('Sign in');
  expect(pathname()).toBe('/');
  expect(screen.queryByText('Your money, at your pace.')).toBeNull();
});

test('create account → onboarding → connect the sandbox bank → Home', async () => {
  const app = await openApp('/', await sandboxServices({ signIn: false }));
  await press('Create account');
  expect(pathname()).toBe('/create-account');

  // Every rule is the service's: errors appear next to the fields.
  await pressButton('Create account');
  expect(screen.getByText('Enter your name')).toBeTruthy();
  expect(screen.getByText('Enter your Plaid client ID')).toBeTruthy();

  await type('Name', 'Ada');
  await type('Username', 'ada');
  await type('Password', 'secret123');
  await type('Confirm password', 'secret123');
  await pressLabel(/^Question:/);
  await press('What was the name of your first pet?');
  await type('Answer', 'Rex');
  await type('Client ID', TEST_PLAID_CLIENT_ID);
  await type('Sandbox secret', TEST_PLAID_SECRET);
  await pressButton('Create account');

  expect(pathname()).toBe('/onboarding');
  await press('Stick to a budget');
  await press('Continue');
  expect(pathname()).toBe('/connect-bank');
  expect(screen.getByText('Test mode · Plaid Sandbox · no real bank accounts')).toBeTruthy();
  expect(screen.queryByLabelText(/password|username|account number/i)).toBeNull(); // nowhere to enter bank details

  await press('Connect test bank with Plaid');
  await settle(60);
  expect(pathname()).toBe('/');
  expect(app.plaid.calls('/sandbox/public_token/create')).toBe(1);
  app.bankData.stopRetrying();
});

test('reset password: username → security question → new password → Home', async () => {
  const app = await sandboxServices({ linkBank: false });
  await app.services.auth.signOut();
  await openApp('/', app);
  await press('Forgot password?');
  await type('Username', 'nobody');
  await press('Continue');
  expect(screen.getByText('No account on this device uses that username')).toBeTruthy();

  await type('Username', 'ADA');
  await press('Continue');
  expect(screen.getByText('What was the name of your first pet?')).toBeTruthy();
  await type('Answer', ' rex ');
  await type('New password', 'fresh456');
  await type('Confirm new password', 'fresh456');
  await pressButton('Reset password');
  expect(pathname()).toBe('/');
  await act(() => app.services.auth.signOut()); // the app is still showing
  expect(await app.services.auth.signIn('ada', 'fresh456')).toBe('home');
});
