import { Text, View } from 'react-native';
import type { ConnectBankController } from '../../controllers/connectBankController';
import { useDisplay } from '../../state/PreferencesContext';
import { Card, ConnectingNotice, Gap, IconBadge, PillButton, Screen, Scroll, TestModeBanner, TopBar } from '../../ui/components';
import type { IconName } from '../../ui/icons';

/**
 * 03 - Connect Bank. Only a Plaid *Sandbox* test bank is ever linked, so the screen says so up
 * front and, while connecting, shows a test-endpoint notice instead of any fields: there is
 * nowhere to enter real bank details.
 */
export function ConnectBankScreen({ controller }: { controller: ConnectBankController }) {
  const { connecting, connect, back } = controller;
  const { type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Connect your bank" onBack={connecting ? undefined : back} />
      <Scroll>
        <Gap h={12} />
        <TestModeBanner />
        <Gap h={18} />
        {connecting ? (
          <ConnectingNotice />
        ) : (
          <>
            <Text style={t.h1}>Bring your accounts together</Text>
            <Gap h={10} />
            <Text style={t.body}>Connect a bank to see spending, bills, budgets and cash flow in one place.</Text>
            <Gap h={22} />
            <Card style={{ borderRadius: 24, gap: 16 }}>
              <Point icon="science" title="Test bank only" body="Pace links Plaid's sandbox test bank. You won't be asked for, and can't enter, real bank details." />
              <Point icon="visibility" title="Read-only access" body="Pace sees balances and transactions. It can't move money." />
              <Point icon="phone-iphone" title="Stays on this device" body="The linked test accounts are saved only on this phone." />
            </Card>
          </>
        )}
      </Scroll>
      <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
        <PillButton
          label={connecting ? 'Connecting to test bank…' : 'Connect test bank with Plaid'}
          icon="link"
          onPress={connect}
          disabled={connecting}
        />
      </View>
    </Screen>
  );
}

function Point({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <IconBadge icon={icon} size={48} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 17, fontWeight: '700', color: c.ink }}>{title}</Text>
        <Text style={{ fontSize: 17, color: c.muted, lineHeight: 22, marginTop: 2 }}>{body}</Text>
      </View>
    </View>
  );
}
