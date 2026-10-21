import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { GoalsController } from '../../controllers/goalsController';
import { goalProgress, goalRemaining, hasProgress, type SavingsGoal } from '../../models/goal';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, PillButton, ProgressBar, Screen, Scroll, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** 13 - Savings goals: kept separate from spending budgets. */
export function GoalsScreen({ controller }: { controller: GoalsController }) {
  const { state, reload, back, addGoal } = controller;
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
              <Heading style={{ flex: 1, fontSize: 22, fontWeight: '500', color: c.ink, marginLeft: 4 }}>Savings Goals</Heading>
              <Tap onPress={addGoal} label="Add savings goal">
                <Icon name="add" size={30} color={c.ink} />
              </Tap>
            </View>
            <Gap h={20} />
            <Text style={{ fontSize: 14, color: c.muted }}>Saved toward goals</Text>
            <Text style={{ fontSize: 44, color: c.ink, marginVertical: 4 }}>{Fmt.moneyOrMissing(data.totalSaved)}</Text>
            <Text style={{ fontSize: 14, color: c.muted }}>{data.subtitle ?? 'No savings goal data found'}</Text>
            <Gap h={18} />
            <Card padding={data.goals.length ? 0 : 20} style={{ borderRadius: 20, overflow: 'hidden' }}>
              {data.goals.length === 0 ? (
                <>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>No savings goals yet</Text>
                  <Text style={{ fontSize: 14, color: c.muted, marginTop: 4 }}>Tap + to add your first goal.</Text>
                </>
              ) : (
                data.goals.map((g, i) => (
                  <Fragment key={g.id}>
                    {i > 0 && <HairLine />}
                    <GoalBlock goal={g} controller={controller} />
                  </Fragment>
                ))
              )}
            </Card>
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}

function GoalBlock({ goal, controller }: { goal: SavingsGoal; controller: GoalsController }) {
  const { colors: c } = useDisplay();
  const name = goal.name ?? 'Unnamed goal';
  const pct = hasProgress(goal) ? `${Math.round(goalProgress(goal) * 100)}%` : Fmt.missing;
  const left = goalRemaining(goal);
  const hasHistory = goal.contributions.length > 0;

  const tip = () => {
    const text = goal.tip!;
    const at = goal.tipHighlight ? text.indexOf(goal.tipHighlight) : -1;
    const base = { fontSize: 14, color: c.ink, flex: 1 } as const;
    if (at < 0) return <Text style={base}>{text}</Text>;
    return (
      <Text style={base}>
        {text.slice(0, at)}
        <Text style={{ fontWeight: '700' }}>{goal.tipHighlight}</Text>
        {text.slice(at + goal.tipHighlight!.length)}
      </Text>
    );
  };

  return (
    <View>
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconBadge icon={iconFor(goal.iconKey)} bg={c.lime} fg="#1A1A1A" size={48} square />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>{name}</Text>
            <Text style={{ fontSize: 12.5, color: c.muted }}>{goal.subtitle ?? 'No details available'}</Text>
          </View>
          <Tap onPress={controller.editGoal} label={`Edit ${name}`}>
            <Icon name="edit-note" size={26} color={c.ink} />
          </Tap>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
          <Text style={{ fontSize: 30, color: c.ink }}>{Fmt.moneyOrMissing(goal.saved)}</Text>
          <Text style={{ fontSize: 14, color: c.muted }}>of {Fmt.moneyOrMissing(goal.target, 0)}</Text>
        </View>
        <View style={{ marginVertical: 8 }}>
          <ProgressBar value={goalProgress(goal)} height={6} track={c.line} label={`${name} progress`} />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, fontSize: 12, color: c.muted }}>{pct} saved</Text>
          <Text style={{ fontSize: 12, color: c.muted }}>{Fmt.moneyOrMissing(left === undefined || left >= 0 ? left : 0)} to go</Text>
        </View>
      </View>
      {goal.tip && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.chip, paddingHorizontal: 16, paddingVertical: 14 }}>
          <Icon name="lightbulb-outline" size={22} color={c.ink} />
          {tip()}
        </View>
      )}
      <View style={{ padding: 16 }}>
        {hasHistory && (
          <>
            <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink, marginBottom: 8 }}>Recent contributions</Text>
            {goal.contributions.map((ct, i) => (
              <Fragment key={i}>
                {i > 0 && <HairLine />}
                <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
                  <Text style={{ flex: 1, fontSize: 14, color: c.ink }}>{ct.dateLabel}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>{Fmt.signed(ct.amount)}</Text>
                </View>
              </Fragment>
            ))}
            <Gap h={16} />
          </>
        )}
        <PillButton
          label="Add contribution"
          icon="add"
          background={hasHistory ? undefined : c.chip}
          foreground={hasHistory ? undefined : c.ink}
          onPress={() => controller.contribute(goal)}
        />
      </View>
    </View>
  );
}
