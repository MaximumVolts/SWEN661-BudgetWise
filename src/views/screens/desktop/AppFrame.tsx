import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useDisplay } from '../../../state/PreferencesContext';
import { MAIN_CONTENT_ID } from '../../../ui/keyboard';

/**
 * Lays the app's pages ([children]) out beside the desktop [chrome] (sidebar / brand panel),
 * inset by [inset]. The pages always sit at the same place in the tree, so switching chrome (a
 * resized window, signing in) never restarts navigation.
 */
export function AppFrame({ chrome, inset, children }: { chrome: ReactNode; inset: { left: number; top: number }; children: ReactNode }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {chrome}
      {/* The "main" landmark, and where "Skip to main content" moves focus (focusable, but not a Tab stop). */}
      <View
        role="main"
        nativeID={MAIN_CONTENT_ID}
        tabIndex={-1}
        accessibilityLabel="Page"
        style={{ position: 'absolute', left: inset.left, top: inset.top, right: 0, bottom: 0, outlineStyle: 'none' } as object}
      >
        {children}
      </View>
    </View>
  );
}
