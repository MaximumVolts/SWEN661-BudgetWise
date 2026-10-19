import { Text, View } from 'react-native';
import type { TrendsController } from '../../controllers/trendsController';
import { TREND_DIRECTION_LABEL } from '../../models/trend';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, Heading, Screen, Scroll, Tap } from '../../ui/components';
import { Icon } from '../../ui/icons';

/** 17 - Trends: what's changing in the user's money, in plain language. */
export function TrendsScreen({ controller }: { controller: TrendsController }) {
  const { state, reload, back, openTrend } = controller;
  const { colors: c } = useDisplay();

  return (
    <Screen>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <Scroll>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -12, paddingTop: 8 }}>
              <Tap onPress={back} label="Back">
                <Icon name="arrow-back" size={28} color={c.ink} />
              </Tap>
              <Text style={{ fontSize: 18, fontWeight: '500', color: c.ink, marginLeft: 4 }}>Plaid TrendScore</Text>
            </View>
            <Gap h={18} />
            <Heading style={{ fontSize: 28, fontWeight: '700', lineHeight: 34, color: c.ink }}>{data.headline}</Heading>
            <Text style={{ fontSize: 16, color: c.muted, lineHeight: 22, marginTop: 8, marginBottom: 16 }}>
              What&apos;s changing in your money, in plain language. Tap any trend to see the transactions behind it.
            </Text>
            {data.trends.map((t) => (
              <Card key={t.id} style={{ borderRadius: 14, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4, backgroundColor: c.chip, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Icon name={t.direction === 'falling' ? 'trending-down' : t.direction === 'steady' ? 'trending-flat' : 'trending-up'} size={16} color={c.ink} />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: c.ink }}>{TREND_DIRECTION_LABEL[t.direction]}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink, marginTop: 12 }}>{t.title}</Text>
                <Text style={{ fontSize: 16, color: c.muted, lineHeight: 22, marginTop: 10 }}>{t.body}</Text>
                <Tap onPress={() => openTrend(t)} style={{ alignSelf: 'flex-start', paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink, textDecorationLine: 'underline' }}>{t.actionLabel}</Text>
                    <Icon name="arrow-forward" size={16} color={c.ink} />
                  </View>
                </Tap>
              </Card>
            ))}
            {data.aboutText && (
              <Card color={c.chip} style={{ flexDirection: 'row', gap: 12, borderRadius: 14 }}>
                <Icon name="info-outline" size={22} color={c.ink} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: c.ink }}>About these insights</Text>
                  <Text style={{ fontSize: 16, color: c.muted, lineHeight: 22, marginTop: 2 }}>{data.aboutText}</Text>
                </View>
              </Card>
            )}
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
