/**
 * @jest-environment jsdom
 */
// useAsyncData: what a page shows while its data reloads.
import { act, type ReactNode } from 'react';
import { useAsyncData, type AsyncState } from '@/controllers/base/useAsyncData';

jest.mock('@/state/NoticeContext', () => ({ useNotice: () => jest.fn() }));

type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
const seen: AsyncState<string>[] = [];

function Page({ choice, keepOnChange }: { choice: number; keepOnChange?: boolean }) {
  const { state } = useAsyncData(async () => `data ${choice}`, [choice], [], { keepOnChange });
  seen.push(state);
  return null;
}

async function show(choice: number, keepOnChange?: boolean) {
  await act(async () => root.render(<Page choice={choice} keepOnChange={keepOnChange} />));
}

beforeEach(() => {
  seen.length = 0;
  root = createRoot(document.createElement('div'));
});
afterEach(() => act(() => root.unmount()));

test('by default a change of what is shown goes through the loading state', async () => {
  await show(1);
  expect(seen.at(-1)).toEqual({ status: 'ready', data: 'data 1' });
  seen.length = 0;
  await show(2);
  expect(seen.some((s) => s.status === 'loading')).toBe(true);
  expect(seen.at(-1)).toEqual({ status: 'ready', data: 'data 2' });
});

test('keepOnChange keeps the content on screen while the new data loads', async () => {
  await show(1, true);
  // The first load has nothing to keep: it shows loading.
  expect(seen[0].status).toBe('loading');
  expect(seen.at(-1)).toEqual({ status: 'ready', data: 'data 1' });
  seen.length = 0;
  await show(2, true);
  expect(seen.some((s) => s.status === 'loading')).toBe(false);
  expect(seen.at(-1)).toEqual({ status: 'ready', data: 'data 2' });
});
