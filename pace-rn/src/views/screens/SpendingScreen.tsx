import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { SpendingController } from '../../controllers/spendingController';
import { useDisplay } from '../../state/PreferencesContext';
import { BarChart } from '../../ui/charts';
import { Change } from '../../ui/Change';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, ProgressBar, Screen, Scroll, SegTabs, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';
import { useStateFor } from '../../utils/useStateFor';

/** 10 - Spending: totals by period and category. */
export function SpendingScreen({ controller }: { controller: SpendingController }) {
  const { state, reload, range, rangeLabels, setRange, chooseDateRange, openCategory } = controller;
  const { colors: c } = useDisplay();
  // The service highlights the latest bar; tapping another highlights it until new data arrives.
  const [highlighted, setHighlighted] = useStateFor(state.data, state.data?.highlightedBar);

  return (
    <Screen edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingTop: 8 }}>
        <Heading style={{ flex: 1, fontSize: 24, fontWeight: '500', color: c.ink }}>Spending</Heading>
        <Tap onPress={chooseDateRange} label="Choose date range">
          <Icon name="calendar-today" size={48} color={c.ink} />
        </Tap>
      </View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <SegTabs labels={rangeLabels} selected={range} onChange={setRange} />
      </View>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <Scroll>
            <Card style={{ borderRadius: 18 }}>
              <Text style={{ fontSize: 13, color: c.muted }}>{data.periodTitle}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, fontSize: 32, fontWeight: '500', color: c.ink }}>{Fmt.money(data.total)}</Text>
                {data.changePercent !== undefined && <Change pct={data.changePercent} big />}
              </View>
              <Gap h={16} />
              <BarChart bars={data.bars} highlighted={highlighted} onBarPress={setHighlighted} />
            </Card>
            <Gap h={14} />
            <Card style={{ borderRadius: 18, paddingVertical: 4 }}>
              {data.categories.length === 0 && (
                <Text style={{ fontSize: 16, color: c.muted, paddingVertical: 14 }}>No spending in this period.</Text>
              )}
              {data.categories.map((cat, i) => (
                <Fragment key={cat.id}>
                  {i > 0 && <HairLine />}
                  <Tap
                    onPress={() => openCategory(cat.id)}
                  >
                    <View style={{ paddingVertical: 14 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                        <IconBadge icon={iconFor(cat.iconKey)} />
                        <Text style={{ flex: 1, fontSize: 17, color: c.ink }}>{cat.name}</Text>
                        {/* Amount and change stack on the right so long names like "Transportation" keep room. */}
                        <View style={{ alignItems: 'flex-end', gap: 2 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{Fmt.money(cat.amount)}</Text>
                          {cat.changePercent === undefined ? (
                            <Text style={{ fontSize: 13, color: c.muted }}>No change</Text>
                          ) : (
                            <Change pct={cat.changePercent} />
                          )}
                        </View>
                      </View>
                      <View style={{ width: '22%', marginTop: 10 }}>
                        <ProgressBar value={cat.share} />
                      </View>
                    </View>
                  </Tap>
                </Fragment>
              ))}
            </Card>
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
