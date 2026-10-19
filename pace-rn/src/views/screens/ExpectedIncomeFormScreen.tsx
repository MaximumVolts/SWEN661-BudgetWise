import { Text } from 'react-native';
import type { ExpectedIncomeFormController } from '../../controllers/expectedIncomeFormController';
import { useDisplay } from '../../state/PreferencesContext';
import { DateField, Field, Gap, PillButton, Screen, Scroll, TopBar } from '../../ui/components';

/** Cash flow → Add expected income: what it is, how much, and when it's expected. */
export function ExpectedIncomeFormScreen({ controller: f }: { controller: ExpectedIncomeFormController }) {
  const { type: t } = useDisplay();
  const e = f.fieldErrors;

  return (
    <Screen>
      <TopBar title="Add expected income" onBack={f.back} />
      <Scroll>
        <Gap h={8} />
        <Text style={t.body}>
          One-off money you expect, like a tax refund or a freelance payment. It’s added to your cash flow projection on that date.
        </Text>
        <Gap h={18} />
        <Field label="What is it?" placeholder="e.g. Tax refund" value={f.name} onChangeText={f.setName} autoCapitalize="sentences" error={e.name} />
        <Field label="Amount" prefix="$" value={f.amount} onChangeText={f.setAmount} keyboardType="decimal-pad" error={e.amount} />
        <DateField label="Expected on" value={f.date} onChange={f.setDate} minimumDate={f.earliestDate} error={e.date} />
        <Gap h={10} />
        <PillButton label={f.submitting ? 'Saving…' : 'Add income'} onPress={f.save} disabled={f.submitting} />
      </Scroll>
    </Screen>
  );
}
