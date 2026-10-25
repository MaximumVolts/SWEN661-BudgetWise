import { Text, View } from 'react-native';
import { useDisplay } from '../state/PreferencesContext';
import { Tap } from './components';
import { Icon, type IconName } from './icons';

/** A titled group of chips to pick one of (a radio group), with an inline error. */
export function ChoiceChips<T>({
  title,
  options,
  selected,
  onSelect,
  error,
  disabled,
}: {
  title: string;
  options: { value: T; label: string; icon?: IconName }[];
  selected?: T;
  onSelect: (value: T) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ marginTop: 22 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{title}</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {options.map((o, idx) => {
          const on = o.value === selected;
          return (
            <Tap key={o.label + idx} role="radio" selected={on} disabled={disabled} onPress={() => onSelect(o.value)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: on ? c.ink : c.outline,
                  backgroundColor: on ? c.ink : c.surface,
                }}
              >
                {o.icon && <Icon name={o.icon} size={48} color={on ? '#FFFFFF' : c.ink} />}
                <Text style={{ fontSize: 36, fontWeight: '600', color: on ? '#FFFFFF' : c.ink }}>{o.label}</Text>
              </View>
            </Tap>
          );
        })}
      </View>
      {error && <Text style={{ fontSize: 13, color: c.red, marginTop: 8 }}>{error}</Text>}
    </View>
  );
}
