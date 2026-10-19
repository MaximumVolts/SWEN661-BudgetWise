import { Pressable, Text, View } from 'react-native';
import type { OnboardingController } from '../../controllers/onboardingController';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Chip, Gap, PillButton, Screen, Scroll, TopBar } from '../../ui/components';

/** 02 - Onboarding priorities: what the user wants help with, and how they're paid. */
export function OnboardingScreen({ controller }: { controller: OnboardingController }) {
  const { state, reload, selected, toggle, income, setIncome, next } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="What matters most?" />
      <AsyncView state={state} onRetry={reload}>
        {(options) => (
          <>
            <Scroll>
              <Gap h={12} />
              <Text style={t.h1}>Set your priorities</Text>
              <Gap h={10} />
              <Text style={t.body}>Choose what you want Pace to focus on first. You can change these later.</Text>
              <Gap h={22} />
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>What would you like help with?</Text>
              <Gap h={12} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {options.priorities.map((o) => (
                  <Chip key={o.id} label={o.label} selected={selected.has(o.id)} showCheck onPress={() => toggle(o.id)} />
                ))}
              </View>
              <Gap h={20} />
              {options.incomeOptions.length > 0 && (
                <Card padding={8} style={{ borderRadius: 20 }}>
                  <View accessibilityRole="radiogroup" accessibilityLabel="How you're paid">
                    {options.incomeOptions.map((o) => {
                      const on = income === o.id;
                      return (
                        <Pressable
                          key={o.id}
                          accessibilityRole="radio"
                          accessibilityLabel={`${o.title}. ${o.subtitle}`}
                          accessibilityState={{ checked: on }}
                          onPress={() => setIncome(o.id)}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 8, paddingVertical: 12 }}
                        >
                          <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
                            {on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c.ink }} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 17, color: c.ink }}>{o.title}</Text>
                            <Text style={{ fontSize: 16, color: c.muted }}>{o.subtitle}</Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </Card>
              )}
            </Scroll>
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
              <PillButton label="Continue" onPress={next} />
            </View>
          </>
        )}
      </AsyncView>
    </Screen>
  );
}
