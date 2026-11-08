import { Text, View } from 'react-native';
import type { DashboardController } from '../../../controllers/dashboardController';
import { BUDGET_STATUS_LABEL, progress, remaining } from '../../../models/budget';
import type { DashboardData } from '../../../models/dashboard';
import { TREND_DIRECTION_LABEL } from '../../../models/trend';
import { useDisplay } from '../../../state/PreferencesContext';
import { SpendAreaChart } from '../../../ui/charts';
import { AsyncView, ProgressBar, StatusMark, Tap } from '../../../ui/components';
import { Badge, Col, DButton, DesktopPage, DText, InfoRow, Panel, Row } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon, iconFor } from '../../../ui/icons';

/** 05 - Home on desktop: spend, accounts and budget; then transactions, bills and a trend; then tools. */
export function HomeDesktop({ controller }: { controller: DashboardController }) {
  return (
    <AsyncView state={controller.state} onRetry={controller.reload}>
      {(data) => <Home data={data} controller={controller} />}
    </AsyncView>
  );
}

function Home({ data, controller: ctl }: { data: DashboardData; controller: DashboardController }) {
  const { colors: c, colorblind } = useDisplay();
  const spend = data.spend;
  const budget = data.budget;
  return (
    <DesktopPage title="Home" actions={<Text style={[DText.body, { color: c.muted }]}>{data.dateLabel}</Text>}>
      {data.reviewBanner && (
        <Tap onPress={ctl.openTransactions} style={{ alignItems: 'stretch' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: c.lime, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#1A1A1A' }}>{data.reviewBanner.title}</Text>
              <Text style={{ fontSize: 12, color: '#1A1A1A' }}>{data.reviewBanner.subtitle}</Text>
            </View>
            <Icon name="arrow-forward" size={20} color="#1A1A1A" />
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#1A1A1A' }}>Review transactions</Text>
          </View>
        </Tap>
      )}

      <Row>
        <Col>
          <Panel title={spend.title}>
            <View accessible accessibilityLabel={`${spend.title}: ${Fmt.money(spend.amount, 0)}`}>
              <Text style={[DText.big, { color: c.ink }]}>{Fmt.money(spend.amount, 0)}</Text>
              {spend.deltaAmount !== undefined && (
                <Text style={[DText.small, { color: spend.deltaIsAbove ? c.red : c.olive }]}>
                  {`${spend.deltaIsAbove ? '↑' : '↓'} ${Fmt.money(spend.deltaAmount)} ${spend.deltaIsAbove ? 'above' : 'below'} ${spend.deltaPeriodLabel ?? ''}`}
                </Text>
              )}
            </View>
            <SpendAreaChart data={spend.chart} height={170} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Legend color={c.ink} label={spend.currentLegend} />
              {spend.previousLegend && <Legend color={c.previous} label={spend.previousLegend} dotted={colorblind} />}
            </View>
            {data.paydayLabel && (
              <Tap onPress={ctl.paydayInfo} style={{ alignItems: 'flex-start', minHeight: 32 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{data.paydayLabel}</Text>
              </Tap>
            )}
          </Panel>
        </Col>

        <Col>
          <Panel title="Accounts">
            {data.accounts.length === 0 ? (
              <Text style={[DText.body, { color: c.muted }]}>No bank connected yet.</Text>
            ) : (
              <View>
                {data.accounts.map((a, i) => (
                  <InfoRow
                    key={a.id}
                    icon={iconFor(a.iconKey)}
                    title={a.name}
                    caption={a.subtitle}
                    value={Fmt.money(a.balance)}
                    valueTone={a.tone === 'alert' ? 'danger' : undefined}
                    onPress={ctl.openAccounts}
                    last={i === data.accounts.length - 1}
                  />
                ))}
              </View>
            )}
            {data.lastSyncLabel && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[DText.small, { color: c.muted }]}>{data.lastSyncLabel} ·</Text>
                <Tap onPress={ctl.sync} style={{ minHeight: 32, minWidth: 0 }}>
                  <Text style={[DText.small, { color: c.ink, textDecorationLine: 'underline' }]}>Sync now</Text>
                </Tap>
              </View>
            )}
            <DButton label="Add account" onPress={ctl.openAddAccount} />
          </Panel>
        </Col>

        <Col>
          {budget ? (
            <Panel title={`Your budget · ${budget.periodLabel}`}>
              <Text style={[DText.small, { color: c.muted }]}>
                {Fmt.money(budget.spent)} of {Fmt.money(budget.limit, 0)}
              </Text>
              <Text style={{ fontSize: 28, lineHeight: 36, color: remaining(budget) < 0 ? c.red : c.ink }}>
                {remaining(budget) >= 0 ? `${Fmt.money(remaining(budget))} left to spend` : `${Fmt.money(-remaining(budget))} over budget`}
              </Text>
              <ProgressBar value={progress(budget)} height={8} label={`${budget.periodLabel} budget used`} />
              {budget.statusLabel && <Text style={[DText.small, { color: c.muted }]}>{budget.statusLabel}</Text>}
              {data.budgetCategories.map((b) => {
                const over = b.status === 'over';
                return (
                  <Tap key={b.id} onPress={() => ctl.openBudgetCategory(b.id)} style={{ alignItems: 'stretch', minHeight: 0 }}>
                    <View style={{ gap: 8, paddingTop: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Icon name={iconFor(b.iconKey)} size={20} color={c.ink} />
                        <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: c.ink }}>{b.name}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: over ? c.red : c.ink }}>{Fmt.leftOrOver(remaining(b))}</Text>
                      </View>
                      <ProgressBar value={progress(b)} color={over ? c.red : c.ink} height={6} striped={b.status !== 'onTrack'} label={`${b.name} budget used`} />
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <StatusMark status={b.status} size={14} />
                        <Text style={[DText.small, { color: over ? c.red : c.muted }]}>{BUDGET_STATUS_LABEL[b.status]}</Text>
                      </View>
                    </View>
                  </Tap>
                );
              })}
              <DButton label="See budget" kind="text" onPress={ctl.openBudgets} />
            </Panel>
          ) : (
            <Panel title="Your budget">
              <Text style={[DText.body, { color: c.muted }]}>Set a monthly limit for a category to see how you&apos;re doing.</Text>
              <DButton label="See budgets" onPress={ctl.openBudgets} />
            </Panel>
          )}
        </Col>
      </Row>

      <Row>
        <Col>
          <Panel title="Recent transactions">
            {data.recentTransactions.length === 0 ? (
              <Text style={[DText.body, { color: c.muted }]}>No transactions yet.</Text>
            ) : (
              <View>
                {data.recentTransactions.map((t, i) => (
                  <InfoRow
                    key={t.id}
                    icon={iconFor(t.iconKey)}
                    title={t.title}
                    caption={t.subtitle}
                    value={t.amount > 0 ? Fmt.signed(t.amount) : Fmt.money(Math.abs(t.amount))}
                    valueTone={t.amount > 0 ? 'success' : undefined}
                    onPress={() => ctl.openTransaction(t.id)}
                    last={i === data.recentTransactions.length - 1}
                  />
                ))}
              </View>
            )}
            <DButton label="See more" kind="text" onPress={ctl.openTransactions} />
          </Panel>
        </Col>
        <Col>
          <Panel title="Upcoming bills">
            {data.upcomingBills.length === 0 ? (
              <Text style={[DText.body, { color: c.muted }]}>No bills due soon.</Text>
            ) : (
              <View>
                {data.upcomingBills.map((b, i) => (
                  <InfoRow
                    key={b.id}
                    icon={iconFor(b.iconKey)}
                    title={b.title}
                    caption={b.subtitle}
                    value={Fmt.money(b.amount)}
                    valueTone={b.isOverdue ? 'danger' : undefined}
                    onPress={() => ctl.openBill(b.id)}
                    last={i === data.upcomingBills.length - 1}
                  />
                ))}
              </View>
            )}
            <DButton label="See all bills" kind="text" onPress={ctl.openBills} />
          </Panel>
        </Col>
        <Col>
          <Panel title="Trends for you">
            {data.featuredTrend ? (
              <>
                <Badge label={TREND_DIRECTION_LABEL[data.featuredTrend.direction]} />
                <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{data.featuredTrend.title}</Text>
                <Text style={[DText.body, { color: c.muted }]}>{data.featuredTrend.body}</Text>
                <DButton label={data.featuredTrend.actionLabel} onPress={() => ctl.openTrendTransactions(data.featuredTrend!.id)} />
                {data.featuredTrendSource && <Text style={[DText.small, { color: c.muted }]}>{data.featuredTrendSource}</Text>}
              </>
            ) : (
              <Text style={[DText.body, { color: c.muted }]}>Trends appear once there&apos;s enough history.</Text>
            )}
            <DButton label="See all trends" kind="text" onPress={ctl.openTrends} />
          </Panel>
        </Col>
      </Row>

      {data.tools.length > 0 && (
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>More tools</Text>
          <Row>
            {data.tools.map((tool) => (
              <Col key={tool.id}>
                <Panel title={tool.title}>
                  <Icon name={iconFor(tool.iconKey)} color={c.ink} />
                  <Text style={[DText.small, { color: c.muted }]}>{tool.subtitle}</Text>
                  <DButton label="View details" icon="arrow-forward" kind="text" onPress={() => ctl.openTool(tool.id)} accessibilityLabel={`${tool.title}: view details`} />
                </Panel>
              </Col>
            ))}
          </Row>
        </View>
      )}
    </DesktopPage>
  );
}

function Legend({ color, label, dotted }: { color: string; label: string; dotted?: boolean }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: dotted ? 'transparent' : color, borderWidth: dotted ? 1 : 0, borderStyle: 'dotted', borderColor: color }} />
      <Text style={[DText.small, { color: c.muted }]}>{label}</Text>
    </View>
  );
}
