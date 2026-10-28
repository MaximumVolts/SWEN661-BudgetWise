import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { BudgetsController } from '../../controllers/budgetsController';
import { type BudgetCategory, progress, remaining } from '../../models/budget';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, Heading, IconBadge, PillButton, ProgressBar, Screen, Scroll, SegTabs, StatusLabel, statusColor, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** 08 - Budgets: this month and the two before. */
export function BudgetsScreen({ controller }: { controller: BudgetsController }) {
  const { periods, overview, selected, selectPeriod, openManageBudgets, openCategory, newBudget } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingTop: 8 }}>
        <Heading style={{ flex: 1, fontSize: 24, fontWeight: '500', color: c.ink }}>Budgets</Heading>
        <Tap onPress={openManageBudgets} label="Budget options">
          <Icon name="more-vert" color={c.ink} size={48} />
        </Tap>
      </View>
      <AsyncView state={periods.state} onRetry={periods.reload}>
        {(ps) => (
          <>
            <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
              <SegTabs labels={ps.map((p) => p.label)} selected={selected} onChange={selectPeriod} />
            </View>
            <AsyncView state={overview.state} onRetry={overview.reload}>
              {(o) =>
                o && (
                  <Scroll>
                    <Card style={{ borderRadius: 14 }}>
                      <View style={{ flexDirection: 'row' }}>
                        <Text style={{ flex: 1, fontSize: 15, color: c.ink }}>{o.summary.periodLabel}</Text>
                        <Text style={{ fontSize: 15, color: c.muted }}>
                          {Fmt.money(o.summary.spent)} of {Fmt.money(o.summary.limit, 0)}
                        </Text>
                      </View>
                      <Gap h={10} />
                      <ProgressBar
                        value={progress(o.summary)}
                        color={statusColor(o.summary.status, c)}
                        striped={o.summary.status !== 'onTrack'}
                        height={10}
                        label={`${o.summary.periodLabel} budget used`}
                      />
                      <Gap h={10} />
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ flex: 1, fontSize: 15, color: c.muted }}>{Fmt.leftOrOver(remaining(o.summary))}</Text>
                        <StatusLabel status={o.summary.status} hideOnTrack />
                      </View>
                    </Card>
                    <Gap h={22} />
                    <Heading style={t.label}>CATEGORIES</Heading>
                    <Gap h={10} />
                    <Card style={{ borderRadius: 18 }}>
                      {o.categories.length === 0 ? (
                        <Text style={t.body}>
                          No budgets yet. Create one to set a monthly limit for a spending category; it applies to every month.
                        </Text>
                      ) : (
                        o.categories.map((cat, i) => (
                          <Fragment key={cat.id}>
                            {i > 0 && <View style={{ height: 1, backgroundColor: c.line, marginVertical: 14 }} />}
                            <Tap
                              onPress={() => openCategory(cat.id)}
                            >
                              <CategoryBlock b={cat} />
                            </Tap>
                          </Fragment>
                        ))
                      )}
                    </Card>
                    <Gap h={18} />
                    <PillButton label="New budget" icon="add" onPress={newBudget} />
                  </Scroll>
                )
              }
            </AsyncView>
          </>
        )}
      </AsyncView>
    </Screen>
  );
}

function CategoryBlock({ b }: { b: BudgetCategory }) {
  const { colors: c } = useDisplay();
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <IconBadge icon={iconFor(b.iconKey)} size={40} />
        <Text style={{ flex: 1, fontSize: 18, color: c.ink }}>{b.name}</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: c.ink }}>{Fmt.leftOrOver(remaining(b))}</Text>
      </View>
      <Gap h={14} />
      <ProgressBar
        value={progress(b)}
        color={b.status === 'onTrack' ? c.ink : statusColor(b.status, c)}
        height={10}
        striped={b.status !== 'onTrack'}
        label={`${b.name} budget used`}
      />
      <Gap h={8} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <StatusLabel status={b.status} />
        </View>
        <Text style={{ fontSize: 14, color: c.muted }}>
          {Fmt.money(b.spent)} of {Fmt.money(b.limit)}
        </Text>
      </View>
    </View>
  );
}
