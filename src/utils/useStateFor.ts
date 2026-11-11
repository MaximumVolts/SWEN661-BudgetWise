import { useCallback, useState } from 'react';

/**
 * Local state that starts from [initial] and starts over whenever [source] changes (e.g. a
 * highlighted bar that resets when new data arrives), without copying props into state in an effect.
 */
export function useStateFor<T>(source: unknown, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState({ source, value: initial });
  const value = state.source === source ? state.value : initial;
  const set = useCallback((v: T) => setState({ source, value: v }), [source]);
  return [value, set];
}
