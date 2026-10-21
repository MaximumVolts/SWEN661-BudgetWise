import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { ManageBudgetsController } from '../../controllers/manageBudgetsController';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, IconBadge, PillButton, Screen, Scroll, Tap, TopBar } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** Budgets manager: every budget (each applies to every month) with Edit / Delete, plus "New budget". */
export function ManageBudgetsScreen({ controller }: { controller: ManageBudgetsController }) {
  const { state, reload, deleting, remove, edit, newBudget, back } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Manage budgets" onBack={back} />
      <AsyncView state={state} onRetry={reload}>
        {(list) => (
          <Scroll>
            <Text style={t.body}>
              A monthly spending limit for each category you want to track. Limits apply to every month; spending is counted month by month.
            </Text>
            <Gap h={18} />
            <Card padding={0} style={{ paddingHorizontal: 16 }}>
              {list.length === 0 ? (
                <Text style={[t.body, { paddingVertical: 16 }]}>No budgets yet. Create one to start tracking a spending category.</Text>
              ) : (
                list.map((b, i) => (
                  <Fragment key={b.categoryId}>
                    {i > 0 && <HairLine />}
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 72 }}>
                      <IconBadge icon={iconFor(b.iconKey)} size={40} />
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={t.row}>{b.name}</Text>
                        <Text style={[t.sub, { marginTop: 2 }]}>{deleting === b.categoryId ? 'Deleting…' : `${Fmt.money(b.monthlyLimit)} a month`}</Text>
                      </View>
                      <Tap onPress={() => edit(b.categoryId)} label={`Edit ${b.name} budget`}>
                        <Icon name="edit" size={22} color={c.ink} />
                      </Tap>
                      <Tap onPress={() => remove(b.categoryId, b.name)} disabled={deleting !== undefined} label={`Delete ${b.name} budget`}>
                        <Icon name="delete-outline" size={22} color={c.red} />
                      </Tap>
                    </View>
                  </Fragment>
                ))
              )}
            </Card>
            <Gap h={20} />
            <PillButton label="New budget" icon="add" onPress={newBudget} />
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
