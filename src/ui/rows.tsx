import { Text, View } from 'react-native';
import type { BillItem } from '../models/bill';
import { type BudgetCategory, progress, remaining } from '../models/budget';
import type { TransactionItem } from '../models/transaction';
import { useDisplay } from '../state/PreferencesContext';
import { IconBadge, ListRow, ProgressBar, StatusLabel, StatusMark, statusColor } from './components';
import { Fmt } from './format';
import { iconFor } from './icons';
import { BUDGET_STATUS_LABEL } from '../models/budget';

/** A transaction in a list: income in olive with a sign, money out as a plain amount. */
export function TransactionRow({ t, onPress }: { t: TransactionItem; onPress?: () => void }) {
  const { colors: c } = useDisplay();
  const income = t.amount > 0;
  return (
    <ListRow
      onPress={onPress}
      leading={<IconBadge icon={iconFor(t.iconKey)} bg={t.highlight ? c.lime : c.chip} size={38} />}
      title={t.title}
      titleStyle={{ fontSize: 16, fontWeight: '500' }}
      subtitle={<Text style={{ fontSize: 12, color: c.muted }}>{t.subtitle}</Text>}
      trailing={
        <Text style={{ fontSize: 15, fontWeight: income ? '700' : '400', color: income ? c.olive : c.ink }}>
          {income ? Fmt.signed(t.amount) : Fmt.money(Math.abs(t.amount))}
        </Text>
      }
    />
  );
}

/** A bill due: overdue ones in red. */
export function BillRow({ b, onPress }: { b: BillItem; onPress?: () => void }) {
  const { colors: c } = useDisplay();
  return (
    <ListRow
      onPress={onPress}
      leading={<IconBadge icon={iconFor(b.iconKey)} bg={b.isOverdue ? c.redBg : c.chip} fg={b.isOverdue ? c.red : c.ink} size={38} square />}
      title={b.title}
      titleStyle={{ fontSize: 16, fontWeight: '500' }}
      subtitle={<Text style={{ fontSize: 12, color: b.isOverdue ? c.red : c.muted }}>{b.subtitle}</Text>}
      trailing={<Text style={{ fontSize: 15, color: c.ink }}>{Fmt.money(b.amount)}</Text>}
    />
  );
}

/** A budget category: what's left, a progress bar (striped when near / over in colorblind mode) and its status. */
export function BudgetRow({ b, compact }: { b: BudgetCategory; compact?: boolean }) {
  const { colors: c, colorblind } = useDisplay();
  const over = b.status === 'over';
  return (
    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
      <IconBadge icon={over ? 'cancel' : iconFor(b.iconKey)} bg={over ? c.redBg : c.chip} fg={over ? c.red : c.ink} size={38} square />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: c.ink }}>{b.name}</Text>
          <Text style={{ fontSize: 16, fontWeight: '500', color: over ? c.red : c.ink }}>{Fmt.leftOrOver(remaining(b))}</Text>
        </View>
        {!compact && (
          <Text style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>
            {Fmt.money(b.spent)} of {Fmt.money(b.limit, 0)}
          </Text>
        )}
        <View style={{ marginVertical: 6 }}>
          <ProgressBar
            value={progress(b)}
            color={over ? c.red : c.ink}
            height={5}
            striped={b.status !== 'onTrack' && colorblind}
            label={`${b.name} budget used`}
          />
        </View>
        {compact ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <StatusMark status={b.status} size={14} />
            <Text style={{ fontSize: 11, color: statusColor(b.status, c) }}>{BUDGET_STATUS_LABEL[b.status]}</Text>
          </View>
        ) : (
          <StatusLabel status={b.status} />
        )}
      </View>
    </View>
  );
}
