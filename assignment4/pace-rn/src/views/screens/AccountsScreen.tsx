import { Fragment } from 'react';
import { Text, View } from 'react-native';
import type { AccountsController } from '../../controllers/accountsController';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, Gap, HairLine, Heading, IconBadge, PillButton, Screen, Scroll, Tap } from '../../ui/components';
import { Fmt } from '../../ui/format';
import { Icon, iconFor } from '../../ui/icons';

/** 04 - Accounts: the linked banks' accounts and live balances. */
export function AccountsScreen({ controller }: { controller: AccountsController }) {
  const { state, reload, back, openOptions, openAccount, addAccount } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 }}>
        <Tap onPress={back} label="Back">
          <Icon name="arrow-back" size={26} color={c.ink} />
        </Tap>
        <Heading style={{ flex: 1, fontSize: 24, fontWeight: '500', color: c.ink }}>Accounts</Heading>
        <Tap onPress={openOptions} label="Account options">
          <Icon name="more-vert" color={c.ink} />
        </Tap>
      </View>
      <AsyncView state={state} onRetry={reload}>
        {(data) => (
          <Scroll>
            <Gap h={16} />
            {data.groups.length === 0 && data.emptyMessage && (
              <Card style={{ marginBottom: 24 }}>
                <Text style={t.body}>{data.emptyMessage}</Text>
              </Card>
            )}
            {data.groups.map((g) => (
              <View key={g.title} style={{ marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: c.ink }}>{g.title}</Text>
                  <Text style={{ fontSize: 15, color: c.muted }}>{g.institution}</Text>
                </View>
                <Card padding={0} style={{ borderRadius: 20 }}>
                  {g.accounts.map((a, i) => (
                    <Fragment key={a.id}>
                      {i > 0 && <HairLine />}
                      <Tap onPress={openAccount}>
                        <View style={{ flexDirection: 'row', padding: 16, gap: 16 }}>
                          <IconBadge icon={iconFor(a.iconKey)} size={48} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 18, color: c.ink }}>{a.name}</Text>
                            <Text style={{ fontSize: 14, color: c.muted }}>{a.subtitle}</Text>
                            <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
                              <Icon name="check-circle-outline" size={20} color={c.ink} />
                              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: c.ink }}>{a.syncLabel}</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>{Fmt.money(a.balance)}</Text>
                        </View>
                      </Tap>
                    </Fragment>
                  ))}
                </Card>
              </View>
            ))}
            <PillButton label="Link another account" icon="add" filled={false} onPress={addAccount} />
          </Scroll>
        )}
      </AsyncView>
    </Screen>
  );
}
