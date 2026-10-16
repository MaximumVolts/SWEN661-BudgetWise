import type { BillFormController } from '../../controllers/billFormController';
import { RECURRING_KIND_LABEL, type RecurringFormOptions } from '../../models/recurring';
import { ChoiceChips } from '../../ui/ChoiceChips';
import { AsyncView, DateField, Field, Gap, PillButton, Screen, Scroll, TopBar } from '../../ui/components';
import { iconFor } from '../../ui/icons';

/** Add a recurring expense or edit one the user added. */
export function BillFormScreen({ controller }: { controller: BillFormController }) {
  return (
    <Screen>
      <TopBar title={controller.isEditing ? 'Edit recurring expense' : 'New recurring expense'} onBack={controller.back} />
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(options) => <BillFormBody options={options} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function BillFormBody({ options, controller: f }: { options: RecurringFormOptions; controller: BillFormController }) {
  const e = f.fieldErrors;
  return (
    <Scroll>
      <Gap h={8} />
      <Field label="Name" placeholder="e.g. Netflix or Rent" value={f.name} onChangeText={f.setName} error={e.name} />
      <Field label="Amount each time" prefix="$" value={f.amount} onChangeText={f.setAmount} keyboardType="decimal-pad" error={e.amount} />
      <ChoiceChips
        title="Type"
        options={options.kinds.map((k) => ({ value: k, label: RECURRING_KIND_LABEL[k] }))}
        selected={f.kind}
        onSelect={f.pickKind}
        error={e.kind}
        disabled={f.submitting}
      />
      <ChoiceChips
        title="How often"
        options={options.frequencies.map((fr) => ({ value: fr.code, label: fr.label }))}
        selected={f.frequency.code}
        onSelect={f.pickFrequency}
        error={e.frequency}
        disabled={f.submitting}
      />
      <Gap h={22} />
      <DateField label="Next payment" value={f.firstDue} onChange={f.pickFirstDue} error={e.firstDue} />
      <ChoiceChips
        title="Category"
        options={options.categories.map((c) => ({ value: c.id, label: c.name, icon: iconFor(c.iconKey) }))}
        selected={f.categoryId}
        onSelect={f.pickCategory}
        error={e.category}
        disabled={f.submitting}
      />
      <Gap h={28} />
      <PillButton label={f.submitting ? 'Saving…' : f.isEditing ? 'Save changes' : 'Start tracking'} onPress={f.save} disabled={f.submitting} />
    </Scroll>
  );
}
