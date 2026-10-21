import { type DependencyList, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { messageFor } from '../../models/appException';
import { useNotice } from '../../state/NoticeContext';
import type { AsyncState } from '../../utils/asyncState';
import type { Subscribable } from '../../utils/events';

export type { AsyncState };

export interface AsyncData<T> {
  state: AsyncState<T>;
  /** Loads again, showing the loading state (e.g. "Try again"). */
  reload(): Promise<void>;
  /** Loads again in the background, keeping what's on screen. */
  refresh(): Promise<void>;
}

/**
 * A screen's data from a service: loading / error / ready, reloaded when [deps] change and in
 * the background whenever one of [refreshOn] emits (e.g. new bank data). A failed background
 * refresh keeps the content and shows a notice.
 */
export function useAsyncData<T>(load: () => Promise<T>, deps: DependencyList, refreshOn: Subscribable<unknown>[] = []): AsyncData<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const notify = useNotice();
  const loadRef = useRef(load);
  const stateRef = useRef(state);
  // The latest loader and state, for loads started later (refs aren't touched during render).
  useLayoutEffect(() => {
    loadRef.current = load;
    stateRef.current = state;
  });
  const generation = useRef(0);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (background: boolean) => {
      const mine = ++generation.current;
      const showLoading = !background || stateRef.current.status !== 'ready';
      if (showLoading) setState({ status: 'loading' });
      try {
        const data = await loadRef.current();
        if (mounted.current && mine === generation.current) setState({ status: 'ready', data });
      } catch (e) {
        if (!mounted.current || mine !== generation.current) return;
        if (showLoading) setState({ status: 'error', error: messageFor(e) });
        else notify(messageFor(e));
      }
    },
    [notify],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => void run(false), deps);

  useEffect(() => {
    const offs = refreshOn.map((s) => s.subscribe(() => void run(true)));
    return () => offs.forEach((off) => off());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refreshOn);

  const reload = useCallback(() => run(false), [run]);
  const refresh = useCallback(() => run(true), [run]);
  return { state, reload, refresh };
}
