import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { AddAccountController } from '../../controllers/addAccountController';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, ConnectingNotice, Gap, HairLine, IconBadge, PillButton, Screen, Scroll, TestModeBanner, TopBar } from '../../ui/components';
import { Icon } from '../../ui/icons';

/**
 * Accounts → Add an account: choose one of Plaid's sandbox test banks to link. Banks already
 * connected are shown but can't be picked; there is nowhere to enter real bank details.
 */
export function AddAccountScreen({ controller }: { controller: AddAccountController }) {
  const { state, reload, selected, choose, connecting, connect, back } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Add an account" onBack={connecting ? undefined : back} />
      <AsyncView state={state} onRetry={reload}>
        {(list) => (
          <Scroll>
            <Gap h={12} />
            <TestModeBanner />
            <Gap h={18} />
            {connecting ? (
              <ConnectingNotice />
            ) : (
              <>
                <Text style={t.h1}>Choose a test bank</Text>
                <Text style={[t.body, { marginTop: 10, marginBottom: 18 }]}>
                  {selected
                    ? "These are Plaid's sandbox test banks, filled with sample accounts. You won't be asked for, and can't enter, real bank details."
                    : "You've connected all of Plaid's test banks."}
                </Text>
                <Card padding={0} style={{ borderRadius: 20 }}>
                  <View accessibilityRole="radiogroup" accessibilityLabel="Test banks">
                    {list.map((bank, i) => {
                      const on = bank.id === selected?.id;
                      return (
                        <Fragment key={bank.id}>
                          {i > 0 && <HairLine />}
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{ checked: on, disabled: bank.isLinked }}
                            disabled={bank.isLinked}
                            onPress={() => choose(bank.id)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}
                          >
                            <IconBadge icon="account-balance" />
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 17, fontWeight: '500', color: bank.isLinked ? c.muted : c.ink }}>{bank.name}</Text>
                              {bank.isLinked && <Text style={t.sub}>Already connected</Text>}
                            </View>
                            <Icon
                              name={bank.isLinked ? 'check-circle-outline' : on ? 'radio-button-checked' : 'radio-button-unchecked'}
                              color={bank.isLinked ? c.muted : c.ink}
                            />
                          </Pressable>
                        </Fragment>
                      );
                    })}
                  </View>
                </Card>
              </>
            )}
          </Scroll>
        )}
      </AsyncView>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <PillButton
          label={connecting ? 'Connecting to test bank…' : selected ? `Connect ${selected.name}` : 'Nothing left to connect'}
          icon="link"
          onPress={connect}
          disabled={connecting || !selected}
        />
      </View>
    </Screen>
  );
}
