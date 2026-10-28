import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { DashboardController } from '../../controllers/dashboardController';
import { progress, remaining } from '../../models/budget';
import type { DashboardAccount, DashboardData } from '../../models/dashboard';
import { TREND_DIRECTION_LABEL } from '../../models/trend';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Columns, Gap, HairLine, IconBadge, ListRow, ProgressBar, Screen, Scroll, SectionHeader, Tap } from '../../ui/components';
import { SpendAreaChart } from '../../ui/charts';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';
import { BillRow, BudgetRow, TransactionRow } from '../../ui/rows';

/** 05 - Dashboard (Home). On tablets, accounts and transactions sit beside budgets, bills and tools. */
export function DashboardScreen({ controller }: { controller: DashboardController }) {
  return (
    <Screen edges={['top']} wide>
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(data) => <Dashboard data={data} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function Dashboard({ data, controller: ctl }: { data: DashboardData; controller: DashboardController }) {
  const { colors: c, type: t, colorblind } = useDisplay();
  const spend = data.spend;

  // Colorblind mode: legend keys show the line's style (solid / dotted), not just its color.
  const legendKey = (color: string, dotted?: boolean) =>
    !colorblind ? (
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    ) : (
      <View style={{ width: 16, height: 3, flexDirection: 'row', justifyContent: 'space-between' }}>
        {dotted ? (
          [0, 1, 2].map((i) => <View key={i} style={{ width: 3, height: 3, backgroundColor: color }} />)
        ) : (
          <View style={{ flex: 1, backgroundColor: color }} />
        )}
      </View>
    );

  const spendSummary = [
    spend.title,
    Fmt.money(spend.amount, 0),
    spend.deltaAmount !== undefined && `${Fmt.money(spend.deltaAmount)} ${spend.deltaIsAbove ? 'above' : 'below'}${spend.deltaPeriodLabel ? ` ${spend.deltaPeriodLabel}` : ''}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Scroll padded={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4 }}>
        <Tap onPress={ctl.openSettings} label="Settings">
          <Icon name="settings" color={c.ink} size={48} />
        </Tap>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '500', color: c.ink }}>{data.dateLabel}</Text>
        <Tap
          onPress={ctl.openNotifications}
          label={data.hasUnreadNotifications ? 'Notifications, you have unread notifications' : 'Notifications'}
        >
          <View>
            <Icon name="notifications-none" size={48} color={c.ink} />
            {data.hasUnreadNotifications && (
              <View style={{ position: 'absolute', right: 2, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: c.red }} />
            )}
          </View>
        </Tap>
      </View>

      {data.reviewBanner && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Tap onPress={ctl.openTransactions}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.lime, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 }}>
              <Icon name="receipt-long" color="#1A1A1A" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#1A1A1A' }}>{data.reviewBanner.title}</Text>
                <Text style={{ fontSize: 12.5, color: '#1A1A1A' }}>{data.reviewBanner.subtitle}</Text>
              </View>
              <Icon name="chevron-right" color="#1A1A1A" />
            </View>
          </Tap>
        </View>
      )}

      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ borderRadius: 20 }} padding={20}>
          {/* TalkBack/VoiceOver read the title, total and change as one item. */}
          <View accessible accessibilityLabel={spendSummary}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={{ flex: 1, fontSize: 14, color: c.muted }}>{spend.title}</Text>
            {spend.deltaAmount !== undefined && (
              <>
                <Icon name={spend.deltaIsAbove ? 'arrow-upward' : 'arrow-downward'} size={15} color={spend.deltaIsAbove ? c.red : c.olive} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: spend.deltaIsAbove ? c.red : c.olive }}>
                  {` ${Fmt.money(spend.deltaAmount)} ${spend.deltaIsAbove ? 'above' : 'below'} ${spend.deltaPeriodLabel ?? ''}`}
                </Text>
              </>
            )}
          </View>
          <Text style={t.big}>{Fmt.money(spend.amount, 0)}</Text>
          </View>
          <SpendAreaChart data={spend.chart} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            {legendKey(c.ink)}
            <Text style={{ fontSize: 12, color: c.muted }}>{spend.currentLegend}</Text>
            {spend.previousLegend && (
              <>
                <Gap w={8} />
                {legendKey(c.previous, true)}
                <Text style={{ fontSize: 12, color: c.muted }}>{spend.previousLegend}</Text>
              </>
            )}
          </View>
        </Card>
      </View>

      {data.paydayLabel && (
        <View style={{ marginHorizontal: 20, marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.chip, borderRadius: 8, paddingLeft: 16 }}>
          <Icon name="account-balance-wallet" size={20} color={c.olive} />
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: c.ink }}>{data.paydayLabel}</Text>
          <Tap onPress={ctl.paydayInfo} label="About payday estimate">
            <Icon name="info-outline" size={48} color={c.ink} />
          </Tap>
        </View>
      )}

      <Columns
        left={
          <>
          {data.accounts.length > 0 && (
            <>
              <SectionHeader title="ACCOUNTS" action="Add account" big onAction={ctl.openAddAccount} />
              <HairLine />
              {data.accounts.map((a) => (
                <Fragment key={a.id}>
                  <AccountTile a={a} onPress={ctl.openAccounts} />
                  <HairLine />
                </Fragment>
              ))}
              {data.lastSyncLabel && (
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 6 }}>
                  <Icon name="sync" size={16} color={c.ink} />
                  <Text style={{ fontSize: 12, color: c.muted }}>{data.lastSyncLabel}</Text>
                  <Tap onPress={ctl.sync} style={{ padding: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: c.olive }}>Sync now</Text>
                  </Tap>
                </View>
              )}
            </>
          )}

          {data.recentTransactions.length > 0 && (
            <>
              <SectionHeader title="RECENT TRANSACTIONS" big />
              <HairLine />
              {data.recentTransactions.map((tx) => (
                <Fragment key={tx.id}>
                  <TransactionRow t={tx} onPress={() => ctl.openTransaction(tx.id)} />
                  <HairLine />
                </Fragment>
              ))}
              <View style={{ alignItems: 'center', marginVertical: 14 }}>
                <Tap onPress={ctl.openTransactions}>
                  <View style={{ paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.outline }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>See more</Text>
                  </View>
                </Tap>
              </View>
            </>
          )}

          </>
        }
        right={
          <>
          {data.budget && (
            <>
              <SectionHeader title="YOUR BUDGET" action="See budget" big onAction={ctl.openBudgets} />
              <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ flex: 1, fontSize: 12, color: c.muted }}>{data.budget.periodLabel}</Text>
                  <Text style={{ fontSize: 12, color: c.muted }}>
                    {Fmt.money(data.budget.spent)} of {Fmt.money(data.budget.limit, 0)}
                  </Text>
                </View>
                <Text style={{ fontSize: 26, fontWeight: '500', color: c.ink, marginVertical: 6 }}>
                  {remaining(data.budget) >= 0
                    ? `${Fmt.money(remaining(data.budget))} left to spend`
                    : `${Fmt.money(-remaining(data.budget))} over budget`}
                </Text>
                <ProgressBar value={progress(data.budget)} label={`${data.budget.periodLabel} budget used`} />
                {data.budget.statusLabel && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.ink }} />
                    <Text style={{ fontSize: 12, color: c.muted }}>{data.budget.statusLabel}</Text>
                  </View>
                )}
              </View>
              <HairLine />
              {data.budgetCategories.map((b) => (
                <Fragment key={b.id}>
                  <Tap onPress={() => ctl.openBudgetCategory(b.id)}>
                    <BudgetRow b={b} compact />
                  </Tap>
                  <HairLine />
                </Fragment>
              ))}
              <Gap h={20} />
            </>
          )}

          {data.upcomingBills.length > 0 && (
            <>
              <SectionHeader title="UPCOMING BILLS" action="See all bills" big onAction={ctl.openBills} />
              {data.upcomingBills.map((b) => (
                <Fragment key={b.id}>
                  <BillRow b={b} onPress={() => ctl.openBill(b.id)} />
                  <HairLine />
                </Fragment>
              ))}
              <Gap h={20} />
            </>
          )}

          {data.featuredTrend && (
            <>
              <SectionHeader title="TRENDS FOR YOU" action="See all trends" big onAction={ctl.openTrends} />
              <HairLine />
              <View style={{ backgroundColor: c.surface, padding: 20 }}>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4, backgroundColor: c.lime, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Icon name={data.featuredTrend.direction === 'falling' ? 'trending-down' : 'trending-up'} size={16} color="#1A1A1A" />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#1A1A1A' }}>{TREND_DIRECTION_LABEL[data.featuredTrend.direction]}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '500', color: c.ink, marginTop: 12 }}>{data.featuredTrend.title}</Text>
                <Text style={{ fontSize: 16, color: c.muted, lineHeight: 22, marginTop: 12 }}>{data.featuredTrend.body}</Text>
                <View style={{ alignItems: 'flex-start', marginTop: 14 }}>
                  <Tap onPress={() => ctl.openTrendTransactions(data.featuredTrend!.id)}>
                    <View style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: c.outline }}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{data.featuredTrend.actionLabel}</Text>
                    </View>
                  </Tap>
                </View>
                {data.featuredTrendSource && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 }}>
                    <Icon name="person-outline" size={14} color={c.ink} />
                    <Text style={{ fontSize: 12, color: c.muted }}>{data.featuredTrendSource}</Text>
                  </View>
                )}
              </View>
              <HairLine />
            </>
          )}

          {data.tools.length > 0 && (
            <>
              <SectionHeader title="MORE TOOLS" big />
              <HairLine />
              {data.tools.map((tool) => (
                <Fragment key={tool.id}>
                  <ListRow
                    onPress={() => ctl.openTool(tool.id)}
                    leading={<IconBadge icon={iconFor(tool.iconKey)} bg={tool.accent ? c.lime : c.chip} size={38} square />}
                    title={tool.title}
                    titleStyle={{ fontSize: 16, fontWeight: '500' }}
                    subtitle={<Text style={{ fontSize: 12, color: c.muted }}>{tool.subtitle}</Text>}
                    trailing={<Icon name="chevron-right" color={c.ink} />}
                  />
                  <HairLine />
                </Fragment>
              ))}
            </>
          )}
          </>
        }
      />
    </Scroll>
  );
}

function AccountTile({ a, onPress }: { a: DashboardAccount; onPress: () => void }) {
  const { colors: c } = useDisplay();
  const red = a.tone === 'alert';
  return (
    <ListRow
      onPress={onPress}
      leading={<IconBadge icon={iconFor(a.iconKey)} bg={red ? c.redBg : a.tone === 'accent' ? c.lime : c.chip} fg={red ? c.red : c.ink} size={38} square />}
      title={a.name}
      titleStyle={{ fontSize: 16, fontWeight: '500' }}
      subtitle={a.subtitle ? <Text style={{ fontSize: 12, color: red ? c.red : c.muted }}>{a.subtitle}</Text> : undefined}
      trailing={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: red ? c.red : c.ink }}>{Fmt.money(a.balance)}</Text>
          {a.hasInfo && <Icon name="info-outline" size={18} color={c.ink} />}
          <Icon name="chevron-right" color={c.ink} />
        </View>
      }
    />
  );
}
