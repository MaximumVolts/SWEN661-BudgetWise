import { Text } from 'react-native';
import type { GoalFormController } from '../../controllers/goalFormController';
import { useDisplay } from '../../state/PreferencesContext';
import { ChoiceChips } from '../../ui/ChoiceChips';
import { DateField, Field, Gap, PillButton, Screen, Scroll, TopBar } from '../../ui/components';
import { iconFor } from '../../ui/icons';

/** Savings goals → +: name, target, what's already saved, an optional target date and an icon. */
export function GoalFormScreen({ controller: f }: { controller: GoalFormController }) {
  const { type: t } = useDisplay();
  const e = f.fieldErrors;

  return (
    <Screen>
      <TopBar title="New savings goal" onBack={f.back} />
      <Scroll>
        <Gap h={8} />
        <Field label="Name" placeholder="e.g. Emergency fund" value={f.name} onChangeText={f.setName} autoCapitalize="sentences" error={e.name} />
        <Field label="Target" prefix="$" value={f.target} onChangeText={f.setTarget} keyboardType="decimal-pad" error={e.target} />
        <Field
          label="Saved so far (optional)"
          prefix="$"
          value={f.saved}
          onChangeText={f.setSaved}
          keyboardType="decimal-pad"
          helper="Leave empty if you’re starting from zero"
          error={e.saved}
        />
        <DateField
          label="Target date (optional)"
          value={f.targetDate}
          onChange={f.pickTargetDate}
          minimumDate={f.earliestTargetDate}
          error={e.targetDate}
        />
        {f.targetDate && <Text style={[t.sub, { marginTop: -10 }]}>Pace will suggest how much to save each month.</Text>}
        <ChoiceChips
          title="Icon"
          options={f.icons.map((i) => ({ value: i.key, label: i.label, icon: iconFor(i.key) }))}
          selected={f.iconKey}
          onSelect={f.setIconKey}
          error={e.icon}
          disabled={f.submitting}
        />
        <Gap h={28} />
        <PillButton label={f.submitting ? 'Saving…' : 'Add goal'} onPress={f.save} disabled={f.submitting} />
      </Scroll>
    </Screen>
  );
}
