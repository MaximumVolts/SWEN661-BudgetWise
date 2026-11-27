import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { noticeTimeout } from '../services/settingsService';
import { Icon } from '../ui/icons';
import { focusPageIfLost } from '../ui/keyboard';
import { useDisplay } from './PreferencesContext';

type Notify = (message: string) => void;

const NoticeContext = createContext<Notify | null>(null);

/**
 * Short messages shown at the top of the screen, clear of the buttons and controls at the bottom of
 * forms and pages. Each has a Close button. How long one stays is the settings service's rule
 * (noticeTimeout): the user can keep them until closed, and the time doesn't run while the mouse is
 * over the message or focus is on its Close button (WCAG 2.2.1).
 */
export function NoticeProvider({ children }: { children: ReactNode }) {
  // [id] tells two notices with the same text apart, so a repeat restarts the time.
  const [notice, setNotice] = useState<{ text: string; id: number }>();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const count = useRef(0);
  const insets = useSafeAreaInsets();
  const { preferences, colors: c } = useDisplay();
  const timeout = noticeTimeout(preferences);
  const paused = hovered || focused;

  const notify = useCallback<Notify>((text) => setNotice({ text, id: ++count.current }), []);

  useEffect(() => {
    if (!notice || paused || timeout === undefined) return undefined;
    const timer = setTimeout(() => setNotice(undefined), timeout);
    return () => clearTimeout(timer);
  }, [notice, paused, timeout]);

  const close = () => {
    setNotice(undefined);
    setHovered(false);
    setFocused(false);
    // Closed from the keyboard, focus was on the Close button, now gone: put it back on the page.
    focusPageIfLost();
  };

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      {notice !== undefined && (
        <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + 12 }]}>
          <View style={styles.snack} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
            {/* A status message (role="status"), read out politely without moving focus. */}
            <View style={{ flex: 1 }} accessibilityLiveRegion="polite" role="status">
              <Text style={styles.text}>{notice.text}</Text>
            </View>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close message"
              {...(Platform.OS === 'web' && { title: 'Close message' })}
              // The app's focus ring is dark ink, lost on this dark bar: a light one here (WCAG 2.4.7, 1.4.11).
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              hitSlop={8}
              style={({ hovered: over }: { hovered?: boolean }) => [styles.close, over && { backgroundColor: 'rgba(255, 255, 255, 0.16)' }, { outlineColor: c.lime }]}
            >
              <Icon name="close" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      )}
    </NoticeContext.Provider>
  );
}

/** Shows a short message to the user. */
export function useNotice(): Notify {
  const notify = useContext(NoticeContext);
  if (!notify) throw new Error('useNotice must be used inside <NoticeProvider>');
  return notify;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center', zIndex: 10 },
  snack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2B2B28',
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    minHeight: 48,
    width: '100%',
    maxWidth: 520,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  text: { color: '#FFFFFF', fontSize: 15, paddingVertical: 6 },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
