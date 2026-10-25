import { ScrollView, Text, TextInput, View } from 'react-native';
import type { TransactionsController } from '../../controllers/transactionsController';
import type { FilterKind } from '../../models/transaction';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, Heading, IconBadge, Screen, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** 06 - Transactions: search as you type, filter by account / category / date. */
export function TransactionsScreen({ controller }: { controller: TransactionsController }) {
  const { state, reload, query, searchText, search, clearSearch, pickFilter, openTransaction } = controller;
  const { colors: c } = useDisplay();

  const filterButton = (kind: FilterKind, label: string) => {
    const active = query[kind] !== undefined;
    return (
      <Tap onPress={() => pickFilter(kind)} hint={`Filter by ${kind}`}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: active ? c.ink : c.outline,
            backgroundColor: active ? c.ink : c.surface,
          }}
        >
          <Icon name="expand-more" size={48} color={active ? '#FFFFFF' : c.ink} />
          <Text style={{ fontWeight: '700', fontSize: 14, color: active ? '#FFFFFF' : c.ink }}>{label}</Text>
        </View>
      </Tap>
    );
  };

  const trimmed = query.search.trim();
  return (
    <Screen edges={['top']}>
      <View style={{ paddingHorizontal: 20 }}>
        <Gap h={16} />
        <Heading style={{ fontSize: 24, fontWeight: '500', color: c.ink }}>Transactions</Heading>
        <Gap h={14} />
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.outline, borderRadius: 6, backgroundColor: c.surface, paddingLeft: 12 }}>
          <Icon name="search" color={c.ink} />
          <TextInput
            accessibilityLabel="Search transactions"
            placeholder="Search merchant, category, note or amount"
            placeholderTextColor={c.muted}
            value={searchText}
            onChangeText={search}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 16, color: c.ink, paddingVertical: 14, paddingHorizontal: 10 }}
          />
          {searchText.length > 0 && (
            <Tap onPress={clearSearch} label="Clear search">
              <Icon name="close" color={c.ink} size={48} />
            </Tap>
          )}
        </View>
        <Gap h={12} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {filterButton('account', query.account?.label ?? 'All accounts')}
          {filterButton('category', query.category?.label ?? 'Category')}
          {filterButton('date', query.date?.label ?? 'Date')}
        </ScrollView>
      </View>
      <AsyncView state={state} onRetry={reload}>
        {(groups) => (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 }}>
            {groups.length === 0 && (
              <Text style={{ fontSize: 16, color: c.muted, textAlign: 'center', paddingVertical: 48 }}>
                {trimmed ? `No transactions match "${trimmed}".` : 'No transactions to show.'}
              </Text>
            )}
            {groups.map((g) => (
              <View key={g.dayLabel}>
                <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 6 }}>
                  <Text style={{ flex: 1, fontWeight: '700', fontSize: 15, color: c.ink }}>{g.dayLabel}</Text>
                  <Text style={{ fontSize: 14, color: c.muted }}>{Fmt.signed(g.total)}</Text>
                </View>
                {g.items.map((t) => (
                  <View key={t.id} style={{ marginBottom: 8 }}>
                    <Tap onPress={() => openTransaction(t.id)}>
                      <Card padding={12} style={{ borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        <IconBadge icon={iconFor(t.iconKey)} bg={t.highlight ? c.lime : c.chip} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 17, fontWeight: '500', color: c.ink }}>{t.title}</Text>
                          <Text style={{ fontSize: 13, color: c.muted, marginTop: 2 }}>{t.subtitle}</Text>
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: c.ink }}>{Fmt.signed(t.amount)}</Text>
                      </Card>
                    </Tap>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </AsyncView>
    </Screen>
  );
}
