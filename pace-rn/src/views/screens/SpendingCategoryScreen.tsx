import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { SpendingCategoryController } from '../../controllers/spendingCategoryController';
import { useDisplay } from '../../state/PreferencesContext';
import { BarChart } from '../../ui/charts';
import { Change } from '../../ui/Change';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, Screen, Scroll, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';
import { TransactionRow } from '../../ui/rows';
import { useStateFor } from '../../utils/useStateFor';

/** 10b - Spending by category: one category over the period chosen on Spending. */
export function SpendingCategoryScreen({ controller }: { controller: SpendingCategoryController }) {
  const { state, reload, back, openTransaction } = controller;
  const { colors: c, type: t } = useDisplay();
  const [highlighted, setHighlighted] = useStateFor(state.data, state.data?.highlightedBar);

  return (
    <Screen>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <Scroll>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: -12, paddingTop: 8 }}>
              <Tap onPress={back} label="Back">
                <Icon name="arrow-back" size={28} color={c.ink} />
              </Tap>
              <IconBadge icon={iconFor(data.iconKey)} size={36} />
              <Heading style={{ flex: 1, fontSize: 22, fontWeight: '500', color: c.ink }}>{data.name}</Heading>
            </View>
            <Gap h={18} />
            <Card color={c.chip}>
              <Text style={{ fontSize: 13, color: c.muted }}>{data.periodTitle}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ flex: 1, fontSize: 32, fontWeight: '500', color: c.ink }}>{Fmt.money(data.amount)}</Text>
                {data.changePercent !== undefined && <Change pct={data.changePercent} big />}
              </View>
              <Text style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>
                {`${Math.round(data.shareOfTotal * 100)}% of your spending · ${
                  data.changePercent === undefined ? 'nothing to compare with before' : 'vs the period before'
                }`}
              </Text>
              <Gap h={16} />
              <BarChart bars={data.bars} highlighted={highlighted} onBarPress={setHighlighted} />
            </Card>
            <Gap h={14} />
            <Card style={{ flexDirection: 'row' }}>
              <Stat label="Transactions" value={`${data.transactionCount}`} />
              <Stat label="Average" value={Fmt.moneyOrMissing(data.averageAmount)} />
              <Stat label="Largest" value={Fmt.moneyOrMissing(data.largestAmount)} />
            </Card>
            <Gap h={22} />
            <Heading style={t.label}>TRANSACTIONS</Heading>
            <Gap h={10} />
            {data.transactions.length === 0 ? (
              <Text style={[t.body, { paddingVertical: 16 }]}>No {data.name.toLowerCase()} spending in this period.</Text>
            ) : (
              <Card padding={0}>
                {data.transactions.map((tx, i) => (
                  <Fragment key={tx.id}>
                    {i > 0 && <HairLine />}
                    <TransactionRow t={tx} onPress={() => openTransaction(tx.id)} />
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

function Stat({ label, value }: { label: string; value: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 13, color: c.muted }}>{label}</Text>
      <Text style={{ fontSize: 17, fontWeight: '700', color: c.ink, marginTop: 2 }}>{value}</Text>
    </View>
  );
}
