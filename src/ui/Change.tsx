import { Text, View } from 'react-native';
import { useDisplay } from '../state/PreferencesContext';
import { Fmt } from './format';
import { Icon } from './icons';

/** A percentage change with an up / down arrow ("▲ 12.5%"). */
export function Change({ pct, big }: { pct: number; big?: boolean }) {
  const { colors: c } = useDisplay();
  const up = pct >= 0;
  return (
    <View
      accessible
      accessibilityLabel={`${up ? 'Up' : 'Down'} ${Fmt.percent(Math.abs(pct))}`}
      style={{ flexDirection: 'row', alignItems: 'center' }}
    >
      <Icon name={up ? 'arrow-drop-up' : 'arrow-drop-down'} size={big ? 22 : 18} color={c.ink} />
      <Text style={{ fontSize: big ? 14 : 13, fontWeight: big ? '700' : '400', color: big ? c.ink : c.muted }}>
        {Fmt.percent(Math.abs(pct))}
      </Text>
    </View>
  );
}
