import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Notify = (message: string) => void;

const NoticeContext = createContext<Notify | null>(null);

const SHOW_MS = 4000;

/** Short messages shown at the bottom of the screen for a few seconds (a snackbar). */
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
        <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 90 }]}>
          <View style={styles.snack} accessibilityLiveRegion="polite" accessibilityRole="alert">
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
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  snack: { backgroundColor: '#2B2B28', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, width: '100%' },
  text: { color: '#FFFFFF', fontSize: 15 },
});
