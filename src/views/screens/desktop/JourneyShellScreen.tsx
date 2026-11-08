import { Text, View } from 'react-native';
import type { JourneyController } from '../../../controllers/journeyController';
import { useDisplay } from '../../../state/PreferencesContext';
import { Icon } from '../../../ui/icons';

const STEPS = ['Your account', 'Your priorities', 'Connect your bank'];

/** Width of the brand panel: the page sits in the rest of the window. */
export const JOURNEY_INSET = { left: 440, top: 0 };

/**
 * The desktop frame for signing in and setting up: Pace's pitch and the three steps on the left
 * (the page is laid out beside it by AppFrame).
 */
export function JourneyShellScreen({ controller }: { controller: JourneyController }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: JOURNEY_INSET.left, zIndex: 1, backgroundColor: c.panel, paddingHorizontal: 56, paddingTop: 56 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="speed" color="#1A1A1A" />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '600', color: c.ink }}>Pace</Text>
        </View>
        <Text style={{ fontSize: 36, lineHeight: 44, color: c.ink, marginTop: 52 }}>Your money, at your pace.</Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: c.muted, marginTop: 16 }}>
          Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.
        </Text>
        <View accessibilityRole="list" accessibilityLabel={`Step ${controller.step} of ${STEPS.length}`} style={{ marginTop: 48, gap: 20 }}>
          {STEPS.map((label, i) => {
            const n = i + 1;
            const reached = n <= controller.step;
            const current = n === controller.step;
            return (
              <View
                key={label}
                accessible
                accessibilityLabel={`${label}${current ? ', current step' : reached ? ', done' : ''}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: reached ? c.ink : c.chip, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: reached ? '#FFFFFF' : c.ink }}>{n}</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: current ? '600' : '500', color: c.ink }}>{label}</Text>
              </View>
            );
          })}
        </View>
    </View>
  );
}
