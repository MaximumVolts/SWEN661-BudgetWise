import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDisplay } from '../state/PreferencesContext';
import { Icon, type IconName } from './icons';
import { CONTENT_MAX_WIDTH } from './responsive';

const ITEMS: [IconName, string][] = [
  ['home', 'Home'],
  ['receipt-long', 'Transactions'],
  ['data-usage', 'Spending'],
  ['account-balance-wallet', 'Budgets'],
  ['calendar-today', 'Bills'],
];

/** Bottom navigation bar. [selected]: 0 Home, 1 Transactions, 2 Spending, 3 Budgets, 4 Bills. */
export function NavBar({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  const { colors: c } = useDisplay();
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Main navigation"
      style={[styles.bar, { backgroundColor: c.navBar, borderTopColor: c.line, paddingBottom: 12 + insets.bottom }]}
    >
      <View style={styles.row}>
        {ITEMS.map(([icon, label], i) => {
          const on = i === selected;
          return (
            <Pressable
              key={label}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityHint={`Tab ${i + 1} of ${ITEMS.length}`}
              accessibilityState={{ selected: on }}
              onPress={() => onSelect(i)}
              style={({ pressed }) => [styles.item, pressed && { transform: [{ scale: 0.97 }] }]}
            >
              <View style={[styles.pill, { backgroundColor: on ? c.navPill : 'transparent' }]}>
                <Icon name={icon} color={on ? c.lime : c.ink} />
              </View>
              <Text style={{ fontSize: 11.5, marginTop: 4, color: c.ink, fontWeight: on ? '700' : '500' }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // On tablets the tabs stay grouped in the middle instead of spreading across the whole width.
  bar: { paddingTop: 12, paddingHorizontal: 8, borderTopWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center' },
  item: { alignItems: 'center', minWidth: 56 },
  pill: { width: 60, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
