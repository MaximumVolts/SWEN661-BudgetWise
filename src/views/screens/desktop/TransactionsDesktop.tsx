import { Text, TextInput, View } from 'react-native';
import type { TransactionDetailController } from '../../../controllers/transactionDetailController';
import type { TransactionsController } from '../../../controllers/transactionsController';
import { BUDGET_STATUS_LABEL, progress, remaining } from '../../../models/budget';
import type { FilterKind, TransactionDetailBundle } from '../../../models/transaction';
import { useDisplay } from '../../../state/PreferencesContext';
import { AsyncView, ProgressBar, Tap } from '../../../ui/components';
import { Badge, Col, DButton, DChip, DesktopPage, DTable, DText, InfoRow, Panel, Row } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon, iconFor } from '../../../ui/icons';

/** 06 - Transactions on desktop: search, filters, and a table (date, merchant, category, account, status, amount). */
export function TransactionsDesktop({ controller }: { controller: TransactionsController }) {
  const { state, reload, query, searchText, search, clearSearch, pickFilter, openTransaction } = controller;
  const { colors: c } = useDisplay();

  const filter = (kind: FilterKind, label: string) => (
    <DChip label={query[kind]?.label ?? label} selected={query[kind] !== undefined} icon="expand-more" onPress={() => pickFilter(kind)} />
  );

  const trimmed = query.search.trim();
  return (
    <DesktopPage title="Transactions">
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.outline, borderRadius: 6, backgroundColor: c.surface, paddingLeft: 16, minHeight: 60 }}>
        <View style={{ flex: 1, paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: c.ink }}>Search transactions</Text>
          <TextInput
            accessibilityLabel="Search transactions"
            placeholder="Merchant, amount, date or category"
            placeholderTextColor={c.muted}
            value={searchText}
            onChangeText={search}
            returnKeyType="search"
            style={{ fontSize: 16, color: c.ink, paddingVertical: 2 }}
          />
        </View>
        {searchText.length > 0 && (
          <Tap onPress={clearSearch} label="Clear search">
            <Icon name="close" color={c.ink} />
          </Tap>
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {filter('date', 'Any date')}
        {filter('account', 'Account')}
        {filter('category', 'Category')}
      </View>
      <AsyncView state={state} onRetry={reload}>
        {(groups) => {
          const items = groups.flatMap((g) => g.items.map((t) => ({ t, day: g.dayLabel })));
          const spent = items.reduce((s, { t }) => s + (t.amount < 0 ? -t.amount : 0), 0);
          return (
            <View style={{ gap: 12 }}>
              <Text style={[DText.small, { color: c.muted }]}>
                {items.length} transaction{items.length === 1 ? '' : 's'} · {Fmt.money(spent)} spent
              </Text>
              <DTable
                columns={[
                  { label: 'Date', flex: 0.9 },
                  { label: 'Merchant', flex: 1.6 },
                  { label: 'Category', flex: 1.1 },
                  { label: 'Account', flex: 1.3 },
                  { label: 'Status', flex: 0.8 },
                  { label: 'Amount', flex: 0.9, align: 'right' },
                ]}
                empty={trimmed ? `No transactions match "${trimmed}".` : 'No transactions to show.'}
                rows={items.map(({ t, day }) => ({
                  key: t.id,
                  onPress: () => openTransaction(t.id),
                  cells: [day, t.title, t.categoryLabel ?? '', t.accountLabel ?? '', t.statusLabel ?? '', Fmt.signed(t.amount)],
                }))}
              />
              {groups.length > 0 && (
                <Text style={[DText.small, { color: c.muted }]}>
                  Daily totals: {groups.slice(0, 3).map((g) => `${g.dayLabel} ${Fmt.signed(g.total)}`).join(' · ')}
                </Text>
              )}
            </View>
          );
        }}
      </AsyncView>
    </DesktopPage>
  );
}

/** 07 - A transaction on desktop: summary and details on the left, categories and its budget on the right. */
export function TransactionDetailDesktop({ controller }: { controller: TransactionDetailController }) {
  return (
    <AsyncView state={controller.state} onRetry={controller.reload}>
      {(bundle) => <Detail bundle={bundle} controller={controller} />}
    </AsyncView>
  );
}

function Detail({ bundle, controller: ctl }: { bundle: TransactionDetailBundle; controller: TransactionDetailController }) {
  const { colors: c } = useDisplay();
  const t = bundle.transaction;
  const primary = ctl.selected[0];
  const budget = ctl.budget;
  return (
    <DesktopPage
      title="Transaction"
      trail={`Transactions / ${t.title}`}
      onBack={ctl.back}
      actions={<DButton label={t.note ? 'Edit note' : 'Add a note'} icon="edit" onPress={ctl.editNote} />}
    >
      <Row>
        <Col flex={0.8}>
          <Panel>
            <Icon name={iconFor(t.iconKey)} size={36} color={c.ink} />
            <Text style={{ fontSize: 28, lineHeight: 36, color: c.ink }}>{t.title}</Text>
            <Text style={[DText.big, { color: c.ink }]}>{Fmt.signed(t.amount)}</Text>
            <Text style={[DText.body, { color: c.muted }]}>{t.dateLabel}</Text>
            <Badge label={t.statusLabel} />
          </Panel>
          <Panel title="Transaction details">
            <View>
              <InfoRow icon="credit-card" title="Account" caption={t.accountLabel} />
              <InfoRow icon="check-circle-outline" title="Status" value={t.statusLabel} />
              <InfoRow icon="storefront" title="Merchant" caption={t.merchantLabel} last={!t.note} />
              {t.note && <InfoRow icon="sticky-note-2" title="Note" caption={t.note} last />}
            </View>
          </Panel>
        </Col>
        <Col>
          <Panel title={ctl.selected.length > 1 ? 'Categories' : 'Category'}>
            <Text style={[DText.body, { color: c.muted }]}>
              Wrong category? Pick another and Pace updates your budgets and charts. The first one you pick is the primary category: its amount counts there.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {bundle.categories.map((cat) => {
                const on = ctl.selected.includes(cat.id);
                const isPrimary = cat.id === primary && ctl.selected.length > 1;
                return <DChip key={cat.id} label={isPrimary ? `${cat.name} · Primary` : cat.name} role="checkbox" selected={on} onPress={() => ctl.toggle(cat)} />;
              })}
              <DChip label="New category" icon="add" onPress={ctl.newCategory} />
            </View>
          </Panel>
          {budget && (
            <Panel title={`${budget.category.name} budget · ${budget.periodLabel}`}>
              <Text style={{ fontSize: 28, lineHeight: 36, color: c.ink }}>
                {Fmt.money(budget.category.spent)} of {Fmt.money(budget.category.limit, 0)}
              </Text>
              <ProgressBar
                value={progress(budget.category)}
                color={budget.category.status === 'over' ? c.red : c.ink}
                striped={budget.category.status !== 'onTrack'}
                height={8}
                label={`${budget.category.name} budget used`}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Badge label={`${BUDGET_STATUS_LABEL[budget.category.status]} · ${Math.round(progress(budget.category) * 100)}% used`} tone={budget.category.status === 'over' ? 'danger' : 'muted'} />
                </View>
                <Text style={[DText.body, { color: c.ink }]}>{Fmt.leftOrOver(remaining(budget.category))}</Text>
              </View>
              <DButton label="View budget" icon="arrow-forward" onPress={ctl.openBudget} />
            </Panel>
          )}
        </Col>
      </Row>
    </DesktopPage>
  );
}
