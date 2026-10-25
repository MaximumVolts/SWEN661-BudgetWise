import { Text, View } from 'react-native';
import type { BudgetFormController } from '../../controllers/budgetFormController';
import type { CategoryInfo } from '../../models/transaction';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Field, Gap, PillButton, Screen, Scroll, Tap, TopBar } from '../../ui/components';
import { Icon, iconFor } from '../../ui/icons';

/** Create a budget, or edit / delete one: a spending category and its monthly limit. */
export function BudgetFormScreen({ controller }: { controller: BudgetFormController }) {
  return (
    <Screen>
      <TopBar title={controller.isEditing ? 'Edit budget' : 'New budget'} onBack={controller.back} />
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {({ categories }) => <BudgetFormBody categories={categories} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function BudgetFormBody({ categories, controller }: { categories: CategoryInfo[]; controller: BudgetFormController }) {
  const { isEditing: editing, categoryId, pickCategory, limit, setLimit, submitting, deleting, busy, fieldErrors: e, save, remove } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Scroll>
      <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>Category</Text>
      <Text style={[t.sub, { marginTop: 4, marginBottom: 12 }]}>
        {categories.length === 0 ? 'Every spending category already has a budget.' : 'Spending in this category counts toward the budget.'}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Category" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {categories.map((cat) => {
          const on = cat.id === categoryId;
          return (
            <Tap
              key={cat.id}
              role="radio"
              selected={on}
              disabled={busy}
              onPress={() => pickCategory(cat.id)}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: on ? c.ink : c.outline,
                  backgroundColor: on ? c.ink : c.surface,
                }}
              >
                <Icon name={iconFor(cat.iconKey)} size={48} color={on ? '#FFFFFF' : c.ink} />
                <Text style={{ fontSize: 36, fontWeight: '700', color: on ? '#FFFFFF' : c.ink }}>{cat.name}</Text>
              </View>
            </Tap>
          );
        })}
      </View>
      {e.category && <Text style={{ fontSize: 13, color: c.red, marginTop: 8 }}>{e.category}</Text>}
      <Gap h={26} />
      <Field
        label="Monthly limit"
        prefix="$"
        value={limit}
        onChangeText={setLimit}
        keyboardType="decimal-pad"
        error={e.limit}
        helper="Applies to every month; each month's spending is counted separately"
        onSubmitEditing={save}
      />
      <Gap h={10} />
      <PillButton label={submitting ? 'Saving…' : editing ? 'Save changes' : 'Create budget'} onPress={save} disabled={busy} />
      {editing && (
        <>
          <Gap h={14} />
          <PillButton label={deleting ? 'Deleting…' : 'Delete budget'} icon="delete-outline" filled={false} foreground={c.red} onPress={remove} disabled={busy} />
        </>
      )}
    </Scroll>
  );
}
