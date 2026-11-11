import { Text, View } from 'react-native';
import type { BudgetCategoryController } from '../../../controllers/budgetCategoryController';
import type { BudgetsController } from '../../../controllers/budgetsController';
import { type BudgetCategory, BUDGET_STATUS_LABEL, type BudgetStatus, progress, remaining } from '../../../models/budget';
import { useDisplay } from '../../../state/PreferencesContext';
import { AsyncView, ProgressBar, StatusMark, Tap } from '../../../ui/components';
import { Badge, Col, DButton, DesktopPage, DTable, DText, Panel, Row } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon } from '../../../ui/icons';

/** 08 - Budgets on desktop: the month's totals on the left, every category on the right. */
export function BudgetsDesktop({ controller }: { controller: BudgetsController }) {
  const { periods, overview, selected, selectPeriod, openManageBudgets, openCategory, newBudget } = controller;
  const { colors: c, colorblind } = useDisplay();
  return (
    <DesktopPage
      title="Budgets"
      actions={
        <>
          <DButton label="Manage budgets" kind="text" onPress={openManageBudgets} />
          <DButton label="Add budget" icon="add" kind="accent" onPress={newBudget} />
        </>
      }
    >
      <AsyncView state={periods.state} onRetry={periods.reload}>
        {(ps) => {
          const period = ps[selected];
          const year = period?.id.slice(0, 4) ?? '';
          // Periods come newest first, so "earlier" is further down the list.
          const earlier = selected + 1 < ps.length ? () => selectPeriod(selected + 1) : undefined;
          const later = selected > 0 ? () => selectPeriod(selected - 1) : undefined;
          return (
            <View style={{ gap: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: c.outline, borderRadius: 24, height: 48, paddingHorizontal: 4 }}>
                <Tap onPress={earlier} disabled={!earlier} label="Earlier month" style={{ minWidth: 40, minHeight: 40 }}>
                  <Icon name="chevron-left" color={earlier ? c.ink : c.line} />
                </Tap>
                <Text accessibilityLiveRegion="polite" style={{ fontSize: 14, fontWeight: '500', color: c.ink, minWidth: 110, textAlign: 'center' }}>
                  {period ? `${period.label} ${year}` : ''}
                </Text>
                <Tap onPress={later} disabled={!later} label="Later month" style={{ minWidth: 40, minHeight: 40 }}>
                  <Icon name="chevron-right" color={later ? c.ink : c.line} />
                </Tap>
              </View>
              <AsyncView state={overview.state} onRetry={overview.reload}>
                {(o) => {
                  if (!o) return null;
                  const counts = (s: BudgetStatus) => o.categories.filter((cat) => cat.status === s).length;
                  return (
                    <Row>
                      <Col flex={0.85}>
                        <Panel title={`Remaining ${period?.isCurrent ? 'this month' : `in ${period?.label ?? ''}`}`}>
                          <Text style={[DText.big, { color: remaining(o.summary) < 0 ? c.red : c.ink }]}>{Fmt.leftOrOver(remaining(o.summary))}</Text>
                          <ProgressBar value={progress(o.summary)} height={8} color={o.summary.status === 'over' ? c.red : c.ink} label={`${o.summary.periodLabel} budget used`} />
                          <View style={{ gap: 6 }}>
                            <Figure label="Total budget" value={Fmt.money(o.summary.limit)} />
                            <Figure label="Spent" value={Fmt.money(o.summary.spent)} />
                            <Figure label="Used" value={`${Math.round(progress(o.summary) * 100)}%`} />
                          </View>
                          <View style={{ gap: 8, alignItems: 'flex-start' }}>
                            {counts('over') > 0 && <Badge label={`${counts('over')} over budget`} tone="danger" />}
                            {counts('nearLimit') > 0 && <Badge label={`${counts('nearLimit')} near limit`} />}
                            {counts('onTrack') > 0 && <Badge label={`${counts('onTrack')} under budget`} />}
                          </View>
                        </Panel>
                        <Panel title="Chart legend">
                          <LegendLine status="onTrack" text="Solid: under" />
                          <LegendLine status="nearLimit" text={colorblind ? 'Striped: near limit' : 'Near limit'} />
                          <LegendLine status="over" text={colorblind ? 'Striped red: over' : 'Red: over'} />
                        </Panel>
                      </Col>
                      <Col flex={2}>
                        <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>Categories</Text>
                        {o.categories.length === 0 ? (
                          <Panel>
                            <Text style={[DText.body, { color: c.muted }]}>No budgets yet. Add one to set a monthly limit for a spending category; it applies to every month.</Text>
                          </Panel>
                        ) : (
                          o.categories.map((cat) => <CategoryCard key={cat.id} b={cat} onPress={() => openCategory(cat.id)} />)
                        )}
                      </Col>
                    </Row>
                  );
                }}
              </AsyncView>
            </View>
          );
        }}
      </AsyncView>
    </DesktopPage>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Text style={[DText.small, { color: c.muted, width: 92 }]}>{label}</Text>
      <Text style={[DText.small, { color: c.ink }]}>{value}</Text>
    </View>
  );
}

function LegendLine({ status, text }: { status: BudgetStatus; text: string }) {
  const { colors: c, colorblind } = useDisplay();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <StatusMark status={status} size={14} />
        <Text style={[DText.small, { color: c.ink }]}>{text}</Text>
      </View>
      <View style={{ width: 120 }}>
        <ProgressBar value={status === 'over' ? 1 : status === 'nearLimit' ? 0.85 : 0.5} color={status === 'over' ? c.red : c.ink} striped={colorblind && status !== 'onTrack'} height={6} />
      </View>
    </View>
  );
}

function CategoryCard({ b, onPress }: { b: BudgetCategory; onPress: () => void }) {
  const { colors: c, colorblind } = useDisplay();
  const over = b.status === 'over';
  return (
    <Tap onPress={onPress} style={{ alignItems: 'stretch' }}>
      <Panel style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: c.ink }}>{b.name}</Text>
          <Text style={{ fontSize: 16, color: over ? c.red : c.olive }}>{Fmt.leftOrOver(remaining(b))}</Text>
        </View>
        <ProgressBar value={progress(b)} color={over ? c.red : c.ink} striped={colorblind && b.status !== 'onTrack'} height={8} label={`${b.name} budget used`} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <StatusMark status={b.status} size={14} />
            <Text style={[DText.small, { color: over ? c.red : c.ink }]}>{BUDGET_STATUS_LABEL[b.status]}</Text>
          </View>
          <Text style={[DText.small, { color: c.muted }]}>
            {Fmt.money(b.spent)} of {Fmt.money(b.limit, 0)}
          </Text>
        </View>
      </Panel>
    </Tap>
  );
}

/** 09 - A budget category on desktop: spent against the limit, Pace's read on it, recent transactions. */
export function BudgetCategoryDesktop({ controller }: { controller: BudgetCategoryController }) {
  const { state, reload, back, edit, openTransaction } = controller;
  const { colors: c, colorblind } = useDisplay();
  return (
    <AsyncView state={state} onRetry={reload}>
      {(data) => (
        <DesktopPage title={data.name} trail={`Budgets / ${data.name} / ${data.periodLabel}`} onBack={back} actions={<DButton label="Edit" icon="edit" onPress={edit} />}>
          <Row>
            <Col>
              <Panel tone="muted" title={data.periodLabel}>
                <Text style={[DText.big, { color: c.ink }]}>{Fmt.money(data.spent)}</Text>
                <Text style={[DText.body, { color: c.muted }]}>of {Fmt.money(data.limit, 0)}</Text>
                <ProgressBar
                  value={progress(data)}
                  color={data.status === 'over' ? c.red : c.ink}
                  track={c.surface}
                  striped={colorblind && data.status !== 'onTrack'}
                  height={8}
                  label={`${data.name} budget used`}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[DText.small, { flex: 1, color: data.status === 'over' ? c.red : c.ink }]}>{BUDGET_STATUS_LABEL[data.status]}</Text>
                  <Text style={[DText.body, { color: c.ink }]}>{Fmt.leftOrOver(remaining(data))}</Text>
                </View>
              </Panel>
            </Col>
            <Col>
              {(data.paceHeadline || data.paceBody) && (
                <Panel title="Pace">
                  {data.paceHeadline && <Text style={{ fontSize: 28, lineHeight: 36, color: c.ink }}>{data.paceHeadline}</Text>}
                  {data.paceBody && <Text style={[DText.body, { color: c.muted }]}>{data.paceBody}</Text>}
                </Panel>
              )}
            </Col>
          </Row>
          {data.recent.length > 0 && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>Recent transactions</Text>
              <DTable
                columns={[{ label: 'Merchant', flex: 2 }, { label: 'Date' }, { label: 'Category' }, { label: 'Amount', align: 'right' }]}
                rows={data.recent.map((t) => ({
                  key: t.id,
                  onPress: () => openTransaction(t.id),
                  cells: [t.title, t.dateLabel ?? '', t.categoryLabel ?? '', Fmt.signed(t.amount)],
                }))}
              />
            </View>
          )}
        </DesktopPage>
      )}
    </AsyncView>
  );
}
