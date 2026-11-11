import { Text, View } from 'react-native';
import type { AccountsController } from '../../../controllers/accountsController';
import { useDisplay } from '../../../state/PreferencesContext';
import { AsyncView } from '../../../ui/components';
import { DButton, DesktopPage, DTable, DText, Panel, Row, Stat } from '../../../ui/desktop';
import { Fmt } from '../../../ui/format';
import { Icon } from '../../../ui/icons';

const count = (n: number) => `${n} account${n === 1 ? '' : 's'}`;

/** 04 - Accounts on desktop: totals, then each bank's accounts as a table. */
export function AccountsDesktop({ controller }: { controller: AccountsController }) {
  const { state, reload, openAccount, addAccount, sync } = controller;
  const { colors: c } = useDisplay();
  return (
    <DesktopPage title="Accounts" actions={<DButton label="Add account" icon="add" kind="accent" onPress={addAccount} />}>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <View style={{ gap: 24 }}>
            {data.summary && (
              <Row>
                <Stat label="Cash" value={Fmt.money(data.summary.cash)} caption={count(data.summary.cashAccounts)} />
                <Stat label="Owed (credit & loans)" value={Fmt.money(data.summary.owed)} caption={count(data.summary.owedAccounts)} />
              </Row>
            )}
            {data.groups.length === 0 && data.emptyMessage && (
              <Panel>
                <Text style={[DText.body, { color: c.muted }]}>{data.emptyMessage}</Text>
              </Panel>
            )}
            {data.groups.map((g) => (
              <Panel key={g.title} title={`${g.title} · ${g.institution}`}>
                <DTable
                  columns={[{ label: 'Account', flex: 1.4 }, { label: 'Type' }, { label: 'Connection', flex: 1.6 }, { label: 'Balance', align: 'right' }]}
                  rows={g.accounts.map((a) => ({
                    key: a.id,
                    onPress: openAccount,
                    cells: [a.name, a.subtitle, a.syncLabel, Fmt.money(a.balance)],
                  }))}
                />
              </Panel>
            ))}
            {data.groups.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="verified-user" size={20} color={c.ink} />
                <Text style={[DText.small, { flex: 1, color: c.muted }]}>Read-only access through Plaid&apos;s sandbox. Pace can see balances and transactions, never move money.</Text>
                <DButton label="Sync now" icon="sync" onPress={sync} />
              </View>
            )}
          </View>
        )}
      </AsyncView>
    </DesktopPage>
  );
}
