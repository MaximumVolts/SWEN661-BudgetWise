import { Text, View } from 'react-native';
import type { BillsController } from '../../../controllers/billsController';
import type { SpendingController } from '../../../controllers/spendingController';
import type { BillsUpcomingData, RecurringData } from '../../../models/bill';
import { useDisplay } from '../../../state/PreferencesContext';
import { BarChart } from '../../../ui/charts';
import { AsyncView, Tap } from '../../../ui/components';
import { ChipGroup, Col, DButton, DesktopPage, DTable, DText, InfoRow, Panel, Row, Stat } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon, iconFor } from '../../../ui/icons';
import { useStateFor } from '../../../utils/useStateFor';

/** "▲ 22.1%" / "▼ 18.2%" (the triangle carries the direction, not the color). */
const changeText = (pct?: number) => (pct === undefined ? 'No change' : `${pct >= 0 ? '▲' : '▼'} ${Fmt.percent(Math.abs(pct))}`);

/** 10 - Spending on desktop: the period's total and bars, then each category against the period before. */
export function SpendingDesktop({ controller }: { controller: SpendingController }) {
  const { state, reload, range, rangeLabels, setRange, chooseDateRange, openCategory } = controller;
  const { colors: c } = useDisplay();
  const [highlighted, setHighlighted] = useStateFor(state.data, state.data?.highlightedBar);
  return (
    <DesktopPage title="Spending" actions={<DButton label="Choose dates" icon="calendar-today" onPress={chooseDateRange} />}>
      <ChipGroup label="Period" labels={rangeLabels} selected={range} onChange={setRange} />
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <View style={{ gap: 24 }}>
            <Panel title={data.periodTitle} action={data.changePercent !== undefined ? <Text style={[DText.body, { color: c.ink }]}>{changeText(data.changePercent)}</Text> : undefined}>
              <Text style={[DText.big, { color: c.ink }]}>{Fmt.money(data.total)}</Text>
              <BarChart bars={data.bars} highlighted={highlighted} onBarPress={setHighlighted} />
            </Panel>
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>Category breakdown</Text>
              <DTable
                columns={[{ label: 'Category', flex: 1.6 }, { label: data.periodTitle }, { label: 'Change vs. period before' }]}
                empty="No spending in this period."
                rows={data.categories.map((cat) => ({
                  key: cat.id,
                  onPress: () => openCategory(cat.id),
                  cells: [
                    <View key="n" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Icon name={iconFor(cat.iconKey)} size={20} color={c.ink} />
                      <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{cat.name}</Text>
                    </View>,
                    Fmt.money(cat.amount),
                    changeText(cat.changePercent),
                  ],
                }))}
              />
            </View>
          </View>
        )}
      </AsyncView>
    </DesktopPage>
  );
}

/** 11 / 12 - Bills on desktop: upcoming payments or everything recurring, as tables. */
export function BillsDesktop({ controller }: { controller: BillsController }) {
  const { state, reload, tab, selectTab, addBill } = controller;
  return (
    <DesktopPage title="Bills" actions={<DButton label={tab === 0 ? 'Add bill' : 'Add recurring bill'} icon="add" kind="accent" onPress={addBill} />}>
      <ChipGroup label="Bills view" labels={['Upcoming', 'Recurring']} selected={tab} onChange={selectTab} />
      <AsyncView state={state} onRetry={reload}>
        {(data) => (tab === 0 ? <Upcoming data={data.upcoming} controller={controller} /> : <Recurring data={data.recurring} controller={controller} />)}
      </AsyncView>
    </DesktopPage>
  );
}

function Upcoming({ data, controller }: { data: BillsUpcomingData; controller: BillsController }) {
  const { colors: c } = useDisplay();
  const soon = data.sections.flatMap((s) => s.items).slice(0, 3);
  return (
    <Row>
      <Col flex={2.4}>
        {data.sections.length === 0 && (
          <Panel>
            <Text style={[DText.body, { color: c.muted }]}>No bills due in the next 30 days.</Text>
          </Panel>
        )}
        {data.sections.map((s) => (
          <View key={s.title} style={{ gap: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{s.title}</Text>
            <DTable
              columns={[{ label: 'Bill', flex: 1.4 }, { label: 'Due date' }, { label: 'Payment' }, { label: 'Amount', align: 'right' }]}
              rows={s.items.map((b) => ({
                key: b.id,
                onPress: () => controller.openBill(b.id),
                cells: [
                  b.title,
                  b.dueLabel ?? b.subtitle,
                  <Text key="p" style={{ fontSize: 16, color: b.isOverdue ? c.red : c.ink, fontWeight: b.isOverdue ? '500' : '400' }}>
                    {b.paymentLabel ?? ''}
                  </Text>,
                  Fmt.money(b.amount),
                ],
              }))}
            />
          </View>
        ))}
      </Col>
      <Col>
        <Stat label={data.summaryLabel} value={Fmt.money(data.summaryAmount)} caption={data.summaryDetail} />
        {soon.length > 0 && (
          <Panel tone="muted" title="Coming up">
            <View>
              {soon.map((b, i) => (
                <InfoRow key={b.id} icon={iconFor(b.iconKey)} title={b.title} caption={b.subtitle} valueTone={b.isOverdue ? 'danger' : undefined} onPress={() => controller.openBill(b.id)} last={i === soon.length - 1} />
              ))}
            </View>
            <Text style={[DText.small, { color: c.muted }]}>Upcoming and recurring bills are kept together so you can plan ahead.</Text>
          </Panel>
        )}
        <DButton label="Manage recurring bills" onPress={() => controller.selectTab(1)} />
      </Col>
    </Row>
  );
}

function Recurring({ data, controller }: { data: RecurringData; controller: BillsController }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ gap: 24 }}>
      <Row>
        <Stat label="Monthly" value={Fmt.money(data.monthlyTotal)} />
        <Stat label="Yearly" value={Fmt.money(data.yearlyTotal)} />
      </Row>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>Recurring & subscriptions</Text>
        <DTable
          columns={[
            { label: 'Name', flex: 1.4 },
            { label: 'Amount' },
            { label: 'Next payment' },
            { label: 'Yearly cost', flex: 1.2 },
            { label: 'Status', flex: 0.7 },
            { label: 'Actions', flex: 0.6, align: 'right' },
          ]}
          empty="Nothing tracked yet. Add a bill or subscription."
          rows={data.items.map((item) => ({
            key: item.id,
            onPress: () => controller.openBill(item.id),
            label: `${item.name}, ${item.amountLabel ?? item.detailLine}, next ${item.nextLabel ?? ''}, ${item.yearlyLine}, ${item.status === 'active' ? 'Active' : 'Paused'}`,
            cells: [
              <View key="n" style={{ gap: 2 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>{item.name}</Text>
                {item.priceChangeLine && <Text style={[DText.small, { color: c.red }]}>{item.priceChangeLine}</Text>}
              </View>,
              item.amountLabel ?? item.detailLine,
              item.nextLabel ?? '',
              item.yearlyLine,
              item.status === 'active' ? 'Active' : 'Paused',
              <Tap key="m" onPress={() => controller.openMenu(item)} label={`Options for ${item.name}`}>
                <Icon name="more-vert" color={c.ink} />
              </Tap>,
            ],
          }))}
        />
      </View>
      {data.insight && (
        <Panel tone="muted" title="Subscription insight">
          <Text style={[DText.body, { color: c.muted }]}>{data.insight}</Text>
        </Panel>
      )}
    </View>
  );
}
