import { Text, View } from 'react-native';
import type { TransactionDetailController } from '../../controllers/transactionDetailController';
import type { TransactionDetailBundle } from '../../models/transaction';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, IconBadge, PillButton, Screen, Scroll, Tap, TopBar } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** 07 - Transaction detail: its categories (first = primary), details and the user's note. */
export function TransactionDetailScreen({ controller }: { controller: TransactionDetailController }) {
  return (
    <Screen>
      <TopBar title="Transaction" onBack={controller.back} />
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(bundle) => <Detail bundle={bundle} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function Detail({ bundle, controller }: { bundle: TransactionDetailBundle; controller: TransactionDetailController }) {
  const { selected, toggle, editNote, newCategory } = controller;
  const { colors: c } = useDisplay();
  const t = bundle.transaction;

  const primary = selected[0];
  return (
    <Scroll>
      <View style={{ alignItems: 'center' }}>
        <Gap h={8} />
        <IconBadge icon={iconFor(t.iconKey)} size={56} />
        <Text style={{ fontSize: 20, fontWeight: '500', color: c.ink, marginTop: 12 }}>{t.title}</Text>
        <Text style={{ fontSize: 32, fontWeight: '500', color: c.ink, marginTop: 4 }}>{Fmt.money(t.amount)}</Text>
        <Text style={{ fontSize: 14, color: c.muted, marginTop: 6 }}>{t.dateLabel}</Text>
      </View>
      <Gap h={22} />
      <Card>
        <Text style={{ fontSize: 14, color: c.muted }}>{selected.length > 1 ? 'Categories' : 'Category'}</Text>
        <Text style={{ fontSize: 13, color: c.muted, lineHeight: 18, marginTop: 4 }}>
          Tap to add or remove. The primary category is the one this amount counts toward in spending and budgets; others are extra labels.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
          {bundle.categories.map((cat) => {
            const on = selected.includes(cat.id);
            const isPrimary = cat.id === primary && selected.length > 1;
            return (
              <Tap key={cat.id} onPress={() => toggle(cat)} selected={on} hint={on ? 'Removes this category' : 'Adds this category'}>
                <View
                  accessibilityValue={isPrimary ? { text: 'Primary category' } : undefined}
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
                  <Text style={{ fontSize: 14, fontWeight: '700', color: on ? '#FFFFFF' : c.ink }}>{cat.name}</Text>
                  {isPrimary && (
                    <View style={{ backgroundColor: c.lime, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1A1A' }}>Primary</Text>
                    </View>
                  )}
                </View>
              </Tap>
            );
          })}
          <Tap onPress={newCategory}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface }}>
              <Icon name="add" size={48} color={c.ink} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: c.ink }}>New category</Text>
            </View>
          </Tap>
        </View>
      </Card>
      <Gap h={14} />
      <Card padding={0} style={{ paddingHorizontal: 16 }}>
        <KV k="Account" v={t.accountLabel} />
        <HairLine />
        <KV k="Status" v={t.statusLabel} />
        <HairLine />
        <KV k="Merchant" v={t.merchantLabel} />
        {t.note && (
          <>
            <HairLine />
            <KV k="Note" v={t.note} />
          </>
        )}
      </Card>
      <Gap h={14} />
      <PillButton label={t.note ? 'Edit note' : 'Add a note'} icon="edit" filled={false} onPress={editNote} />
    </Scroll>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', paddingVertical: 14, gap: 12 }}>
      <Text style={{ fontSize: 14, color: c.muted }}>{k}</Text>
      <Text style={{ flex: 1, textAlign: 'right', fontSize: 16, color: c.ink }}>{v}</Text>
    </View>
  );
}
