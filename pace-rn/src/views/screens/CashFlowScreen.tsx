import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { CashFlowController } from '../../controllers/cashFlowController';
import type { BreakdownLine } from '../../models/cashFlow';
import { useDisplay } from '../../state/PreferencesContext';
import { CashFlowChart } from '../../ui/charts';
import { AsyncView, Card, Chip, Gap, HairLine, Heading, PillButton, Screen, Scroll, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon } from '../../ui/icons';

/** 16 - Cash flow projection: where cash is heading over 30 / 60 / 90 days. */
export function CashFlowScreen({ controller }: { controller: CashFlowController }) {
  const { state, reload, setRange, setScenario, removeIncome, addIncome, back } = controller;
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
              <Heading style={{ fontSize: 22, fontWeight: '500', color: c.ink, marginLeft: 4 }}>Cash Flow Projection</Heading>
            </View>
            <Gap h={16} />
            <View accessibilityRole="tablist" style={{ flexDirection: 'row', height: 40, borderRadius: 20, borderWidth: 1, borderColor: c.outline, overflow: 'hidden', backgroundColor: c.surface }}>
              {data.rangeLabels.map((l, i) => {
                const on = i === data.selectedRange;
                return (
                  <Pressable
                    key={l}
                    accessibilityRole="tab"
                    accessibilityLabel={l}
                    accessibilityState={{ selected: on }}
                    onPress={() => setRange(i)}
                    style={{ flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.lime : c.surface, borderLeftWidth: i ? 1 : 0, borderLeftColor: c.outline }}
                  >
                    {on && <Icon name="check" size={18} color="#1A1A1A" />}
                    <Text style={{ fontWeight: on ? '700' : '500', color: on ? '#1A1A1A' : c.ink }}>{l}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: c.muted }}>Income</Text>
              {data.scenarioLabels.map((l, i) => (
                <Chip key={l} label={l} selected={i === data.selectedScenario} showCheck selectedBg={c.lime} selectedFg="#1A1A1A" onPress={() => setScenario(i)} />
              ))}
            </View>
            <Gap h={16} />
            <Text style={{ fontSize: 13, color: c.muted }}>{data.projectedDateLabel}</Text>
            <Text style={{ fontSize: 40, color: c.ink }}>{Fmt.money(data.projectedAmount)}</Text>
            {data.lowestAmount !== undefined && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Icon name="trending-down" size={20} color={c.ink} />
                <Text style={{ flex: 1, fontSize: 15, lineHeight: 20, color: c.ink }}>
                  <Text style={{ fontWeight: '700' }}>Lowest point: {Fmt.money(data.lowestAmount)}</Text>
                  {data.lowestDescription ? ` ${data.lowestDescription}` : ''}
                </Text>
              </View>
            )}
            <Gap h={14} />
            <Card>
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink, marginBottom: 12 }}>{data.chartTitle}</Text>
              <CashFlowChart data={data.chart} />
            </Card>
            <Gap h={14} />
            <Card padding={0} style={{ overflow: 'hidden' }}>
              <Text style={{ fontWeight: '700', color: c.ink, padding: 16 }}>How we got this</Text>
              <HairLine />
              {data.breakdown.map((l, i) => (
                <Fragment key={`${l.title}-${i}`}>
                  <Line line={l} onRemove={l.expectedIncomeId ? () => removeIncome(l) : undefined} />
                  <HairLine indent={16} />
                </Fragment>
              ))}
              <View style={{ flexDirection: 'row', backgroundColor: c.panel, paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ flex: 1, fontWeight: '700', color: c.ink }}>Projected cash</Text>
                <Text style={{ fontWeight: '700', color: c.ink }}>{Fmt.money(data.projectedAmount)}</Text>
              </View>
            </Card>
            <Gap h={14} />
            <PillButton label="Add expected income" icon="add" filled={false} onPress={addIncome} />
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}

function Line({ line, onRemove }: { line: BreakdownLine; onRemove?: () => void }) {
  const { colors: c } = useDisplay();
  const [text, color] =
    line.tone === 'positive'
      ? [`+${Fmt.money(line.amount)}`, c.olive]
      : line.tone === 'negative'
        ? [`−${Fmt.money(line.amount)}`, c.red]
        : [Fmt.money(line.amount), c.ink];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: c.ink }}>{line.title}</Text>
        <Text style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>{line.subtitle}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: '700', color }}>{text}</Text>
      {onRemove && (
        <Tap onPress={onRemove} label={`Remove ${line.title}`}>
          <Icon name="close" size={20} color={c.muted} />
        </Tap>
      )}
    </View>
  );
}
