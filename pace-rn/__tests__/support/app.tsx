// Opens the real app (every route in src/views/routes) on test services, with Expo Router's test renderer.
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { setAppServices } from '@/state/ServicesContext';
import { type SandboxApp, sandboxServices } from './sandbox';

const APP_DIR = join(__dirname, '..', '..', 'src', 'views', 'routes');

/** Every route file, keyed as renderRouter expects ('(tabs)/index', 'bill/[id]'…). */
function routes(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name)) {
        const key = relative(APP_DIR, path).replace(/\\/g, '/').replace(/\.tsx?$/, '');
        out[key] = require(path).default;
      }
    }
  };
  walk(APP_DIR);
  return out;
}

let rendered: { getPathname(): string; getSearchParams(): Record<string, string> } | undefined;

/** The current route's path, e.g. '/sign-in'. */
export const pathname = () => rendered!.getPathname();
/** The current route's parameters. */
export const params = () => rendered!.getSearchParams();

/**
 * The app on [app]'s services (default: Ada signed in with the sandbox bank linked), opened at
 * [url]. Waits for the first screen to settle.
 */
export async function openApp(url = '/', app?: SandboxApp): Promise<SandboxApp> {
  const opened = app ?? (await sandboxServices());
  setAppServices(opened.services);
  // renderRouter's promise carries the route helpers (getPathname…).
  const result = renderRouter(routes() as never, { initialUrl: url });
  await result;
  rendered = result as unknown as { getPathname(): string; getSearchParams(): Record<string, string> };
  await settle();
  return opened;
}

/**
 * Lets pending service calls and re-renders finish. renderRouter switches Jest to fake timers, so
 * this advances the fake clock (running due timers and the promises they start) in small steps.
 */
export async function settle(ms = 30) {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await jest.advanceTimersByTimeAsync(ms / 5);
    });
  }
}

/** Presses the element showing [text] and lets the app settle. */
export async function press(text: string | RegExp) {
  await fireEvent.press(screen.getByText(text));
  await settle();
}

/** Presses the element labelled [label] (accessibilityLabel) and lets the app settle. */
export async function pressLabel(label: string | RegExp) {
  await fireEvent.press(screen.getByLabelText(label));
  await settle();
}

/** Presses the button named [name] (its label or text) and lets the app settle. */
export async function pressButton(name: string | RegExp) {
  await fireEvent.press(screen.getByRole('button', { name }));
  await settle();
}

/** Types [value] into the field labelled [label]. */
export async function type(label: string | RegExp, value: string) {
  await fireEvent.changeText(screen.getByLabelText(label), value);
  await settle(5);
}

export { screen };
