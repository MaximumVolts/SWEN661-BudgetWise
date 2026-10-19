import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { BillsController } from '../../controllers/billsController';
import type { BillsUpcomingData, RecurringData, RecurringItem } from '../../models/bill';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, Screen, Scroll, SegTabs, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';
import { BillRow } from '../../ui/rows';

/** 11 / 12 - Bills: upcoming payments, and everything recurring (subscriptions and bills). */
export function BillsScreen({ controller }: { controller: BillsController }) {
  const { state, reload, tab, selectTab, addBill } = controller;
  const { colors: c } = useDisplay();

  return (
    <Screen edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 8, paddingTop: 8 }}>
        <Heading style={{ flex: 1, fontSize: 24, fontWeight: '500', color: c.ink }}>Bills</Heading>
        <Tap onPress={addBill} label="Add bill or subscription">
          <Icon name="add" size={30} color={c.ink} />
        </Tap>
      </View>
      <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
        <SegTabs labels={['Upcoming', 'Recurring']} selected={tab} onChange={selectTab} />
      </View>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (tab === 0 ? <Upcoming data={data.upcoming} controller={controller} /> : <Recurring data={data.recurring} controller={controller} />)}
      </AsyncView>
    </Screen>
  );
}

function Upcoming({ data, controller }: { data: BillsUpcomingData; controller: BillsController }) {
  const { colors: c, type: t } = useDisplay();
  return (
    <Scroll>
      <Card color={c.chip}>
        <Text style={{ fontSize: 14, color: c.muted }}>{data.summaryLabel}</Text>
        <Text style={{ fontSize: 34, fontWeight: '500', color: c.ink, marginVertical: 4 }}>{Fmt.money(data.summaryAmount)}</Text>
        <Text style={{ fontSize: 14, color: c.muted }}>{data.summaryDetail}</Text>
      </Card>
      {data.sections.map((s) => (
        <View key={s.title}>
          <Gap h={20} />
          <Heading style={t.label}>{s.title.toUpperCase()}</Heading>
          <Gap h={8} />
          <Card padding={0}>
            {s.items.map((b, i) => (
              <Fragment key={b.id}>
                {i > 0 && <HairLine />}
                <BillRow b={b} onPress={() => controller.openBill(b.id)} />
              </Fragment>
            ))}
          </Card>
        </View>
      ))}
    </Scroll>
  );
}

function Recurring({ data, controller }: { data: RecurringData; controller: BillsController }) {
  const { colors: c, type: t } = useDisplay();
  return (
    <Scroll>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Stat label="Monthly" value={Fmt.money(data.monthlyTotal)} />
        <Stat label="Yearly" value={Fmt.money(data.yearlyTotal)} />
      </View>
      {data.items.length === 0 && <Text style={[t.body, { marginTop: 20 }]}>Nothing tracked yet. Tap + to add a bill or subscription.</Text>}
      {data.groups.map((group) => (
        <View key={group.kind}>
          <Gap h={20} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Heading style={[t.label, { flex: 1 }]}>{group.title.toUpperCase()}</Heading>
            <Text style={t.sub}>{Fmt.money(group.monthly)} a month</Text>
          </View>
          <Gap h={8} />
          <Card padding={0} style={{ paddingHorizontal: 12 }}>
            {group.items.map((item, i) => (
              <Fragment key={item.id}>
                {i > 0 && <HairLine />}
                <Tap onPress={() => controller.openBill(item.id)}>
                  <SubRow item={item} onMenu={() => controller.openMenu(item)} />
                </Tap>
              </Fragment>
            ))}
          </Card>
        </View>
      ))}
      {data.insight && (
        <Card color={c.chip} style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>Subscription insight</Text>
          <Text style={{ fontSize: 17, color: c.muted, lineHeight: 23, marginTop: 6 }}>{data.insight}</Text>
        </Card>
      )}
    </Scroll>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors: c } = useDisplay();
  return (
    <Card style={{ flex: 1 }}>
      <Text style={{ fontSize: 14, color: c.muted }}>{label}</Text>
      <Text style={{ fontSize: 26, fontWeight: '500', color: c.ink, marginTop: 6 }}>{value}</Text>
    </Card>
  );
}

function SubRow({ item, onMenu }: { item: RecurringItem; onMenu: () => void }) {
  const { colors: c } = useDisplay();
  const active = item.status === 'active';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
      <IconBadge icon={iconFor(item.iconKey)} />
      <View style={{ flex: 1, marginHorizontal: 14 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: c.ink }}>{item.name}</Text>
        <Text style={{ fontSize: 14, color: c.muted, marginTop: 2 }}>{item.detailLine}</Text>
        <Text style={{ fontSize: 14, color: c.muted }}>{item.isManual ? `${item.yearlyLine} · added by you` : item.yearlyLine}</Text>
        {item.priceChangeLine && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="trending-up" size={16} color={c.red} />
            <Text style={{ flex: 1, fontSize: 13, color: c.red, fontWeight: '600' }}>{item.priceChangeLine}</Text>
          </View>
        )}
      </View>
      <Icon name={active ? 'check-circle-outline' : 'pause-circle-outline'} size={18} color={active ? c.ink : c.muted} />
      <Text style={{ fontSize: 14, fontWeight: '700', color: active ? c.ink : c.muted, marginLeft: 6 }}>{active ? 'Active' : 'Paused'}</Text>
      <Tap onPress={onMenu} label={`Options for ${item.name}`}>
        <Icon name="more-vert" size={20} color={c.ink} />
      </Tap>
    </View>
  );
}
