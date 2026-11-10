import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Notify = (message: string) => void;

const NoticeContext = createContext<Notify | null>(null);

const SHOW_MS = 4000;

/**
 * Short messages shown at the top of the screen for a few seconds, clear of the buttons and
 * controls at the bottom of forms and pages.
 */
export function NoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const insets = useSafeAreaInsets();

  const notify = useCallback<Notify>((m) => {
    clearTimeout(timer.current);
    setMessage(m);
    timer.current = setTimeout(() => setMessage(undefined), SHOW_MS);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <NoticeContext.Provider value={notify}>
      {children}
      {message !== undefined && (
        <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 12 }]}>
          {/* A status message (role="status"), read out politely without moving focus. */}
          <View style={styles.snack} accessibilityLiveRegion="polite" role="status">
            <Text style={styles.text}>{message}</Text>
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
  snack: { backgroundColor: '#2B2B28', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, width: '100%', maxWidth: 520, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)' },
  text: { color: '#FFFFFF', fontSize: 15 },
});
