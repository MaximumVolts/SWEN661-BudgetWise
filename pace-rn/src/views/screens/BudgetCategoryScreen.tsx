import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { BudgetCategoryController } from '../../controllers/budgetCategoryController';
import { progress, remaining } from '../../models/budget';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, ProgressBar, Screen, Scroll, StatusLabel, statusColor, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon } from '../../ui/icons';
import { TransactionRow } from '../../ui/rows';

/** 09 - Budget category detail: this month's spending against the limit, the pace, recent transactions. */
export function BudgetCategoryScreen({ controller }: { controller: BudgetCategoryController }) {
  const { state, reload, back, edit, openTransaction } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <Scroll>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: -12, paddingTop: 8 }}>
              <Tap onPress={back} label="Back">
                <Icon name="arrow-back" size={48} color={c.ink} />
              </Tap>
              <Heading style={{ flex: 1, fontSize: 22, fontWeight: '500', color: c.ink }}>{data.name}</Heading>
              <Tap onPress={edit} style={{ padding: 12 }}>
                <Text style={{ fontWeight: '700', fontSize: 18, color: c.ink }}>Edit</Text>
              </Tap>
            </View>
            <Gap h={18} />
            <Card color={c.chip}>
              <Text style={{ fontSize: 13, color: c.muted }}>{data.periodLabel}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={{ flex: 1, fontSize: 32, fontWeight: '500', color: c.ink }}>{Fmt.money(data.spent)}</Text>
                <Text style={{ fontSize: 14, color: c.muted, marginBottom: 6 }}>of {Fmt.money(data.limit, 0)}</Text>
              </View>
              <Gap h={6} />
              <ProgressBar
                value={progress(data)}
                color={data.status === 'onTrack' ? c.ink : statusColor(data.status, c)}
                track={c.surface}
                height={10}
                striped={data.status !== 'onTrack'}
                label={`${data.name} budget used`}
              />
              <Gap h={10} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <StatusLabel status={data.status} />
                </View>
                <Text style={{ fontSize: 14, color: c.ink }}>{Fmt.leftOrOver(remaining(data))}</Text>
              </View>
            </Card>
            {(data.paceHeadline || data.paceBody) && (
              <>
                <Gap h={22} />
                <Heading style={t.label}>PACE</Heading>
                <Gap h={10} />
                <Card>
                  {data.paceHeadline && <Text style={{ fontSize: 17, fontWeight: '700', lineHeight: 22, color: c.ink }}>{data.paceHeadline}</Text>}
                  {data.paceHeadline && data.paceBody && <Gap h={10} />}
                  {data.paceBody && <Text style={{ fontSize: 17, lineHeight: 23, color: c.muted }}>{data.paceBody}</Text>}
                </Card>
              </>
            )}
            {data.recent.length > 0 && (
              <>
                <Gap h={22} />
                <Heading style={t.label}>RECENT TRANSACTIONS</Heading>
                <Gap h={10} />
                <Card padding={0}>
                  {data.recent.map((tx, i) => (
                    <Fragment key={tx.id}>
                      {i > 0 && <HairLine />}
                      <TransactionRow t={tx} onPress={() => openTransaction(tx.id)} />
                    </Fragment>
                  ))}
                </Card>
              </>
            )}
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
