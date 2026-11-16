/**
 * @jest-environment jsdom
 */
// The signed-out frame's keyboard shortcuts: Back and Forward work there; the rest are the app's.
import { act, type ReactNode } from 'react';
import { type JourneyController, useJourneyController } from '@/controllers/journeyController';

const mockNav = { back: jest.fn(), forward: jest.fn(), canGoBack: jest.fn(() => true) };
jest.mock('@/navigation/appNavigator', () => ({ useAppNavigator: () => mockNav, useJourneyStep: () => 2 }));

type Root = { render(ui: ReactNode): void; unmount(): void };
const { createRoot } = require('react-dom/client') as { createRoot(container: Element): Root };
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let ctl: JourneyController;
function Probe() {
  ctl = useJourneyController();
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  const root = createRoot(document.createElement('div'));
  act(() => root.render(<Probe />));
});

test('reports the step on screen', () => {
  expect(ctl.step).toBe(2);
});

test('Back goes back when there is somewhere to go', () => {
  expect(ctl.runShortcut({ kind: 'back' })).toBe(true);
  expect(mockNav.back).toHaveBeenCalledTimes(1);
  mockNav.canGoBack.mockReturnValueOnce(false);
  expect(ctl.runShortcut({ kind: 'back' })).toBe(false);
  expect(mockNav.back).toHaveBeenCalledTimes(1);
});

test('Forward goes forward; app shortcuts do nothing before signing in', () => {
  expect(ctl.runShortcut({ kind: 'forward' })).toBe(true);
  expect(mockNav.forward).toHaveBeenCalled();
  expect(ctl.runShortcut({ kind: 'section', section: 'budgets' })).toBe(false);
  expect(ctl.runShortcut({ kind: 'help' })).toBe(false);
  expect(ctl.runShortcut({ kind: 'save' })).toBe(false);
});
