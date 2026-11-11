import { Text, View } from 'react-native';
import type { CashFlowController } from '../../../controllers/cashFlowController';
import type { GoalsController } from '../../../controllers/goalsController';
import type { TrendsController } from '../../../controllers/trendsController';
import type { BreakdownLine } from '../../../models/cashFlow';
import { goalProgress, goalRemaining, hasProgress, type SavingsGoal } from '../../../models/goal';
import { TREND_DIRECTION_LABEL } from '../../../models/trend';
import { useDisplay } from '../../../state/PreferencesContext';
import { CashFlowChart } from '../../../ui/charts';
import { AsyncView, Heading, ProgressBar, Tap } from '../../../ui/components';
import { Badge, ChipGroup, Col, DButton, DesktopPage, DText, Panel, Row } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon, iconFor } from '../../../ui/icons';

/** 13 - Savings goals on desktop: the total saved, then each goal as a card. */
export function GoalsDesktop({ controller }: { controller: GoalsController }) {
  const { state, reload, addGoal } = controller;
  const { colors: c } = useDisplay();
  return (
    <DesktopPage title="Savings Goals" actions={<DButton label="New goal" icon="add" kind="accent" onPress={addGoal} />}>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <View style={{ gap: 24 }}>
            <View accessible accessibilityLabel={`Saved toward goals: ${Fmt.moneyOrMissing(data.totalSaved)}. ${data.subtitle ?? ''}`}>
              <Text style={[DText.small, { color: c.ink, fontSize: 14 }]}>Saved toward goals</Text>
              <Text style={[DText.big, { color: c.ink }]}>{Fmt.moneyOrMissing(data.totalSaved)}</Text>
              <Text style={[DText.body, { color: c.muted }]}>{data.subtitle ?? 'No savings goals yet'}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
              {data.goals.map((g) => (
                <View key={g.id} style={{ flexBasis: 420, flexGrow: 1 }}>
                  <GoalCard goal={g} controller={controller} />
                </View>
              ))}
              <View style={{ flexBasis: 420, flexGrow: 1 }}>
                <Panel tone="muted" title={data.goals.length ? 'Make room for what matters' : 'No savings goals yet'}>
                  <Text style={[DText.body, { color: c.muted }]}>
                    {data.goals.length
                      ? 'Your goals stay separate from everyday spending. Add a contribution to keep your progress up to date.'
                      : 'Add a goal for something you are saving toward, and track every contribution.'}
                  </Text>
                </Panel>
              </View>
            </View>
          </View>
        )}
      </AsyncView>
    </DesktopPage>
  );
}

function GoalCard({ goal, controller }: { goal: SavingsGoal; controller: GoalsController }) {
  const { colors: c } = useDisplay();
  const name = goal.name ?? 'Unnamed goal';
  const left = goalRemaining(goal);
  return (
    <Panel title={name}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon name={iconFor(goal.iconKey)} color={c.ink} />
        <Text style={[DText.body, { flex: 1, color: c.muted }]}>{goal.subtitle ?? 'No details available'}</Text>
        <DButton label="Edit" icon="edit" kind="text" onPress={controller.editGoal} accessibilityLabel={`Edit ${name}`} />
      </View>
      <Text style={[DText.big, { color: c.ink }]}>{Fmt.moneyOrMissing(goal.saved)}</Text>
      <Text style={[DText.body, { color: c.muted, marginTop: -8 }]}>of {Fmt.moneyOrMissing(goal.target, 0)}</Text>
      <ProgressBar value={goalProgress(goal)} height={6} label={`${name} progress`} />
      <View style={{ flexDirection: 'row' }}>
        <Text style={[DText.small, { flex: 1, color: c.ink }]}>{hasProgress(goal) ? `${Math.round(goalProgress(goal) * 100)}% saved` : Fmt.missing}</Text>
        <Text style={[DText.small, { color: c.ink }]}>{Fmt.moneyOrMissing(left === undefined || left >= 0 ? left : 0)} to go</Text>
      </View>
      {goal.tip && (
        <Panel tone="muted" padding={20}>
          <Text style={[DText.body, { color: c.ink }]}>{goal.tip}</Text>
        </Panel>
      )}
      {goal.contributions.length > 0 && (
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink, marginBottom: 4 }}>Recent contributions</Text>
          {goal.contributions.map((ct, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.line }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.chip, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="add" color={c.ink} />
              </View>
              <Text style={[DText.body, { flex: 1, color: c.ink }]}>{ct.dateLabel}</Text>
              <Text style={[DText.body, { color: c.ink }]}>{Fmt.signed(ct.amount)}</Text>
            </View>
          ))}
        </View>
      )}
      <DButton label="Add contribution" icon="add" kind={goal.contributions.length ? 'primary' : 'outline'} onPress={() => controller.contribute(goal)} />
    </Panel>
  );
}

/** 16 - Cash flow on desktop: where cash is heading, the chart, and how the projection adds up. */
export function CashFlowDesktop({ controller }: { controller: CashFlowController }) {
  const { state, reload, setRange, setScenario, removeIncome, addIncome } = controller;
  const { colors: c } = useDisplay();
  return (
    <DesktopPage title="Cash Flow Projection" actions={<DButton label="Add expected income" icon="add" onPress={addIncome} />}>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <View style={{ gap: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
              <ChipGroup label="Projection length" labels={data.rangeLabels} selected={data.selectedRange} onChange={setRange} />
              <Text style={[DText.small, { color: c.muted }]}>Income</Text>
              <ChipGroup label="Income scenario" labels={data.scenarioLabels} selected={data.selectedScenario} onChange={setScenario} />
            </View>
            <View>
              <Text style={[DText.small, { color: c.ink }]}>{data.projectedDateLabel}</Text>
              <Text style={[DText.big, { color: c.ink }]}>{Fmt.money(data.projectedAmount)}</Text>
              {data.lowestAmount !== undefined && (
                <Text style={[DText.body, { color: c.ink }]}>
                  ↓ Lowest point: {Fmt.money(data.lowestAmount)}
                  {data.lowestDescription ? ` ${data.lowestDescription}` : ''}
                </Text>
              )}
            </View>
            <Row>
              <Col flex={1.5}>
                <Panel title={data.chartTitle}>
                  <CashFlowChart data={data.chart} height={260} />
                  <Panel tone="muted" padding={20}>
                    <Text style={[DText.small, { color: c.ink }]}>
                      Expected income and scheduled payments are included in this projection. Everyday spending uses your recent average.
                    </Text>
                  </Panel>
                </Panel>
              </Col>
              <Col>
                <Panel title="How we got this">
                  <View>
                    {data.breakdown.map((l, i) => (
                      <BreakdownRow key={`${l.title}-${i}`} line={l} onRemove={l.expectedIncomeId ? () => removeIncome(l) : undefined} />
                    ))}
                  </View>
                  <View style={{ flexDirection: 'row', backgroundColor: c.chip, paddingHorizontal: 16, paddingVertical: 16 }}>
                    <Text style={[DText.body, { flex: 1, color: c.ink }]}>Projected cash</Text>
                    <Text style={[DText.body, { fontWeight: '500', color: c.ink }]}>{Fmt.money(data.projectedAmount)}</Text>
                  </View>
                </Panel>
              </Col>
            </Row>
          </View>
        )}
      </AsyncView>
    </DesktopPage>
  );
}

function BreakdownRow({ line, onRemove }: { line: BreakdownLine; onRemove?: () => void }) {
  const { colors: c } = useDisplay();
  const [text, color] =
    line.tone === 'positive' ? [`+${Fmt.money(line.amount)}`, c.olive] : line.tone === 'negative' ? [`−${Fmt.money(line.amount)}`, c.red] : [Fmt.money(line.amount), c.ink];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.line }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{line.title}</Text>
        <Text style={[DText.small, { color: c.muted }]}>{line.subtitle}</Text>
      </View>
      <Text style={{ fontSize: 16, color }}>{text}</Text>
      {onRemove && (
        <Tap onPress={onRemove} label={`Remove ${line.title}`} style={{ minWidth: 36, minHeight: 36 }}>
          <Icon name="close" size={20} color={c.muted} />
        </Tap>
      )}
    </View>
  );
}

/** 17 - Trends on desktop: each trend as a card, two to a row. */
export function TrendsDesktop({ controller }: { controller: TrendsController }) {
  const { state, reload, openTrend } = controller;
  const { colors: c } = useDisplay();
  return (
    <DesktopPage title="Plaid TrendScore">
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <View style={{ gap: 24 }}>
            <View style={{ gap: 12 }}>
              <Heading style={{ fontSize: 28, lineHeight: 36, color: c.ink }}>{data.headline}</Heading>
              <Text style={[DText.body, { color: c.muted }]}>What&apos;s changing in your money, in plain language. Open any trend to see the transactions behind it.</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
              {data.trends.map((t) => (
                <View key={t.id} style={{ flexBasis: 420, flexGrow: 1 }}>
                  <Panel title={t.title}>
                    <Badge
                      label={TREND_DIRECTION_LABEL[t.direction]}
                      icon={t.direction === 'falling' ? 'trending-down' : t.direction === 'steady' ? 'trending-flat' : 'trending-up'}
                    />
                    <Text style={[DText.body, { color: c.ink }]}>{t.body}</Text>
                    <DButton label={t.actionLabel} icon="arrow-forward" kind="text" onPress={() => openTrend(t)} />
                  </Panel>
                </View>
              ))}
            </View>
            {data.aboutText && (
              <Panel tone="muted" title="About these insights">
                <Text style={[DText.body, { color: c.ink }]}>{data.aboutText}</Text>
              </Panel>
            )}
          </View>
        )}
      </AsyncView>
    </DesktopPage>
  );
}
