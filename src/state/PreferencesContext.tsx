import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { DEFAULT_PREFERENCES, samePreferences, type UserPreferences } from '../models/userPreferences';
import { type Motion, motionFor } from '../services/settingsService';
import { type Palette, paletteFor, type TypeScale, typeScale } from '../ui/theme';
import { useServices } from './ServicesContext';

interface Display {
  preferences: UserPreferences;
  /** Colors for the user's high contrast / colorblind settings. */
  colors: Palette;
  type: TypeScale;
  /** Colorblind mode: statuses also use shapes and patterns, not only color. */
  colorblind: boolean;
  /** Whether (and how) things animate: off with "Turn off animations" or the system's reduce-motion setting. */
  motion: Motion;
}

const PreferencesContext = createContext<Display | null>(null);

/**
 * The signed-in user's display preferences, applied app-wide: every screen reads its colors from
 * here, so toggling high contrast or colorblind mode restyles the whole app at once.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { settings } = useServices();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const systemReducesMotion = useSystemReducesMotion();

  useEffect(() => {
    let live = true;
    const apply = (p: UserPreferences) => live && setPreferences((old) => (samePreferences(old, p) ? old : p));
    settings.preferences().then(apply, () => {});
    const off = settings.preferenceChanges.subscribe(apply);
    return () => {
      live = false;
      off();
    };
  }, [settings]);

  const value = useMemo(() => {
    const colors = paletteFor(preferences);
    return { preferences, colors, type: typeScale(colors), colorblind: preferences.colorblindMode, motion: motionFor(preferences, systemReducesMotion) };
  }, [preferences, systemReducesMotion]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/** The operating system's reduce-motion setting (prefers-reduced-motion on the desktop), kept up to date. */
function useSystemReducesMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      (on) => live && setReduced(on),
      () => {},
    );
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (on: boolean) => live && setReduced(on));
    return () => {
      live = false;
      sub?.remove();
    };
  }, []);
  return reduced;
}

export function useDisplay(): Display {
  const display = useContext(PreferencesContext);
  if (!display) throw new Error('useDisplay must be used inside <PreferencesProvider>');
  return display;
}
