import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * With animations off (Settings → Turn off animations, or the system's reduce-motion setting):
 * no CSS transitions, animations or smooth scrolling anywhere on the page, including any that a
 * library adds. Loading spinners (role="progressbar") keep turning: they are the only sign that
 * something is still happening, and they don't move across the screen.
 */
export const REDUCED_MOTION_RULE = `*, *::before, *::after { transition: none !important; scroll-behavior: auto !important; }
:not([role="progressbar"]):not([role="progressbar"] *) { animation: none !important; }`;

/** Desktop: adds REDUCED_MOTION_RULE to the page while animations are off. Nothing on phones. */
export function ReducedMotionStyle({ animate }: { animate: boolean }) {
  useEffect(() => {
    if (animate || Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    const style = document.createElement('style');
    style.textContent = REDUCED_MOTION_RULE;
    document.head.appendChild(style);
    return () => style.remove();
  }, [animate]);
  return null;
}
