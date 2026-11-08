import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { BillDetailController } from '../../controllers/billDetailController';
import { RECURRING_KIND_LABEL } from '../../models/recurring';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, ListRow, PillButton, Screen, Scroll, TopBar } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, type IconName, iconFor } from '../../ui/icons';

/** One bill or subscription: cost, next due date, source, price changes, payments and actions. */
export function BillDetailScreen({ controller }: { controller: BillDetailController }) {
  const { state, reload, back, act, openTransaction } = controller;
  const { colors: c, type: t } = useDisplay();

  const fact = (icon: IconName, text: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
      <Icon name={icon} size={18} color={c.muted} />
      <Text style={{ flex: 1, fontSize: 14, color: c.muted }}>{text}</Text>
    </View>
  );

  return (
    <Screen>
      <TopBar title={state.data ? RECURRING_KIND_LABEL[state.data.kind] : 'Bill'} onBack={back} />
      <AsyncView state={state} onRetry={reload}>
        {(d) => (
          <Scroll>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <IconBadge icon={iconFor(d.iconKey)} size={56} />
              <View style={{ flex: 1 }}>
                <Heading style={t.title}>{d.name}</Heading>
                <Text style={[t.sub, { marginTop: 2 }]}>{`${RECURRING_KIND_LABEL[d.kind]} · ${d.categoryName}`}</Text>
              </View>
            </View>
            <Gap h={18} />
            <Card>
              <Text style={{ fontSize: 26, fontWeight: '500', color: c.ink }}>{d.amountLabel}</Text>
              <Text style={[t.sub, { marginTop: 4, marginBottom: 6 }]}>{d.yearlyLabel}</Text>
              {fact(d.isPaused ? 'pause-circle-outline' : 'event', d.nextLabel)}
              {fact(d.isManual ? 'edit-note' : 'account-balance', d.sourceLabel)}
            </Card>
            {d.priceChangeLabel && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: c.redBg }}>
                <Icon name="trending-up" color={c.red} />
                <Text style={{ flex: 1, fontSize: 15, color: c.red, fontWeight: '600' }}>{d.priceChangeLabel}</Text>
              </View>
            )}
            <Gap h={18} />
            {d.canMarkPaid && (
              <>
                <PillButton label="Mark next payment as paid" icon="check" onPress={() => act('markPaid')} />
                <Gap h={12} />
              </>
            )}
            <PillButton
              label={d.isPaused ? 'Resume tracking' : 'Pause tracking'}
              icon={d.isPaused ? 'play-arrow' : 'pause'}
              filled={false}
              onPress={() => act(d.isPaused ? 'resume' : 'pause')}
            />
            {d.isManual && (
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <PillButton label="Edit" icon="edit" filled={false} onPress={() => act('edit')} />
                </View>
                <View style={{ flex: 1 }}>
                  <PillButton label="Delete" icon="delete-outline" filled={false} foreground={c.red} onPress={() => act('delete')} />
                </View>
              </View>
            )}
            <Gap h={24} />
            <Heading style={t.label}>PAYMENTS</Heading>
            <Gap h={8} />
            {d.history.length === 0 ? (
              <Text style={t.body}>
                {d.isManual ? 'Bills and subscriptions you add aren’t matched to bank transactions.' : 'No payments found yet.'}
              </Text>
            ) : (
              <Card padding={0}>
                {d.history.map((p, i) => (
                  <Fragment key={p.transactionId}>
                    {i > 0 && <HairLine />}
                    <ListRow
                      title={p.dateLabel}
                      onPress={() => openTransaction(p.transactionId)}
                      trailing={<Text style={t.amount}>{Fmt.signed(p.amount)}</Text>}
                    />
                  </Fragment>
                ))}
              </Card>
            )}
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
