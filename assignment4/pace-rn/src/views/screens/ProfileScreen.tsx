import { Text, TextInput, View } from 'react-native';
import type { ProfileController } from '../../controllers/profileController';
import type { BankConnection } from '../../models/linkedBank';
import { hasPlaidKeys, type ProfileData } from '../../models/profile';
import { useDisplay } from '../../state/PreferencesContext';
import { AsyncView, Card, ConnectingNotice, Field, Gap, Heading, IconBadge, PillButton, Screen, Scroll, TestModeBanner, TopBar } from '../../ui/components';
import { Icon } from '../../ui/icons';

/** 16 - Profile: the name and Plaid sandbox keys; the username is shown read-only. Plus the bank connection. */
export function ProfileScreen({ controller }: { controller: ProfileController }) {
  return (
    <Screen>
      <TopBar title="Profile" onBack={controller.back} />
      <AsyncView state={controller.state} onRetry={controller.reload}>
        {(loaded) => <ProfileForm data={controller.profile ?? loaded.profile} banks={loaded.banks} controller={controller} />}
      </AsyncView>
    </Screen>
  );
}

function ProfileForm({ data, banks, controller }: { data: ProfileData; banks: BankConnection[]; controller: ProfileController }) {
  const { fields, setName, setClientId, setSecret, submitting, fieldErrors: e, justSaved, save } = controller;
  const { name, clientId, secret } = fields;
  const { colors: c, type: t } = useDisplay();

  return (
    <Scroll>
      <Gap h={12} />
      <View accessible accessibilityLabel={`Profile initials ${data.initials}`} style={{ alignSelf: 'center', width: 88, height: 88, borderRadius: 44, backgroundColor: c.ink, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.lime, fontSize: 32, fontWeight: '700' }}>{data.initials}</Text>
      </View>
      <Gap h={28} />
      <Field label="Name" value={name} onChangeText={setName} autoCapitalize="words" error={e.name} onSubmitEditing={save} />
      {/* Read-only: the username is the account's sign-in and can't be changed here. */}
      <View style={{ marginBottom: 18 }}>
        <Text style={[t.sub, { marginBottom: 6, color: c.ink, fontWeight: '600' }]}>Username</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: c.line, borderRadius: 6, paddingHorizontal: 14 }}>
          <TextInput accessibilityLabel="Username" value={data.username} editable={false} style={{ flex: 1, fontSize: 18, color: c.muted, paddingVertical: 14 }} />
          <Icon name="lock-outline" size={20} color={c.muted} />
        </View>
        <Text style={[t.sub, { marginTop: 4 }]}>Your username is how you sign in, so it can’t be changed.</Text>
      </View>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Icon name="lock-outline" size={22} color={c.ink} />
        <View>
          <Text style={t.sub}>Sign-in method</Text>
          <Text style={[t.row, { marginTop: 2 }]}>{data.signInMethod || '—'}</Text>
        </View>
      </Card>
      <Gap h={28} />
      <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>Plaid sandbox keys</Text>
      <Text style={[t.body, { marginTop: 4, marginBottom: 14 }]}>
        {hasPlaidKeys(data)
          ? "Used to connect Plaid's test bank. Leave the secret blank to keep the one you saved."
          : 'Add your free sandbox keys from dashboard.plaid.com → Developers → Keys to connect a bank.'}
      </Text>
      <Field label="Client ID" value={clientId} onChangeText={setClientId} autoCapitalize="none" autoCorrect={false} error={e.plaidClientId} />
      <Field
        label="Sandbox secret"
        value={secret}
        onChangeText={setSecret}
        secure
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={data.hasPlaidSecret ? 'Saved · enter a new one to replace it' : undefined}
        error={e.plaidSecret}
        onSubmitEditing={save}
      />
      <Gap h={10} />
      <PillButton label={submitting ? 'Saving…' : 'Save changes'} onPress={save} disabled={submitting} />
      {justSaved && (
        <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 }}>
          <Icon name="check-circle-outline" size={20} color={c.olive} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: c.olive }}>Profile saved</Text>
        </View>
      )}
      <Gap h={32} />
      <BankConnections banks={banks} controller={controller} />
    </Scroll>
  );
}

/** Manage the Plaid connection: remove it when linked, or link the sandbox test bank when not. */
function BankConnections({ banks, controller }: { banks: BankConnection[]; controller: ProfileController }) {
  const { connecting, removing, connectBank: connect, removeBank: remove } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <View>
      <Heading style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>Bank connection</Heading>
      <Gap h={12} />
      <TestModeBanner />
      <Gap h={14} />
      {connecting ? (
        <ConnectingNotice />
      ) : banks.length === 0 ? (
        <>
          <Text style={t.body}>No bank connected. Link Plaid’s sandbox test bank to try Pace with sample accounts.</Text>
          <Gap h={16} />
          <PillButton label="Connect test bank with Plaid" icon="link" filled={false} onPress={connect} />
        </>
      ) : (
        banks.map((bank) => (
          <Card key={bank.itemId} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <IconBadge icon="account-balance" />
              <View style={{ flex: 1 }}>
                <Text style={t.row}>{bank.institutionName}</Text>
                <Text style={[t.sub, { marginTop: 2 }]}>
                  {`${bank.accountCount} ${bank.accountCount === 1 ? 'account' : 'accounts'} · Plaid Sandbox · linked ${bank.linkedOnLabel}`}
                </Text>
              </View>
            </View>
            <Gap h={14} />
            <PillButton
              label={removing === bank.itemId ? 'Removing…' : 'Remove connection'}
              icon="link-off"
              filled={false}
              foreground={c.red}
              disabled={removing !== undefined}
              onPress={() => remove(bank)}
            />
          </Card>
        ))
      )}
    </View>
  );
}
