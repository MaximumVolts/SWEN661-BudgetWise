import { Text, View } from 'react-native';
import type { CreateAccountController } from '../../controllers/createAccountController';
import { useDisplay } from '../../state/PreferencesContext';
import { Field, Gap, PillButton, Screen, Scroll, SelectField, Tap, TopBar } from '../../ui/components';

/** 01b - Create Account, with the user's own Plaid sandbox keys. */
export function CreateAccountScreen({ controller }: { controller: CreateAccountController }) {
  const { form, set, securityQuestions, submitting, fieldErrors: e, create, back } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Create account" onBack={back} />
      <Scroll>
        <Gap h={8} />
        <Text style={t.h1}>Start your Pace account</Text>
        <Gap h={10} />
        <Text style={t.body}>Your account is stored only on this device.</Text>
        <Gap h={24} />
        <Field label="Name" value={form.name} onChangeText={set('name')} autoCapitalize="words" autoComplete="name" error={e.name} />
        <Field
          label="Username"
          value={form.username}
          onChangeText={set('username')}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username-new"
          error={e.username}
          helper="3–30 letters, numbers, dots, dashes or underscores"
        />
        <Field
          label="Password"
          value={form.password}
          onChangeText={set('password')}
          secure
          autoComplete="password-new"
          error={e.password}
          helper="At least 8 characters, with a letter and a number"
        />
        <Field label="Confirm password" value={form.confirmPassword} onChangeText={set('confirmPassword')} secure error={e.confirmPassword} />
        <Gap h={10} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>Security question</Text>
        <Text style={[t.body, { marginTop: 4, marginBottom: 14 }]}>Used to reset your password if you forget it.</Text>
        <SelectField
          label="Question"
          value={form.securityQuestion || undefined}
          options={securityQuestions.map((q) => ({ id: q, label: q }))}
          onChange={set('securityQuestion')}
          error={e.securityQuestion}
        />
        <Field label="Answer" value={form.securityAnswer} onChangeText={set('securityAnswer')} error={e.securityAnswer} helper="Not case-sensitive" />
        <Gap h={10} />
        <Text style={{ fontSize: 18, fontWeight: '700', color: c.ink }}>Plaid sandbox keys</Text>
        <Text style={[t.body, { marginTop: 4, marginBottom: 14 }]}>
          Pace links Plaid&apos;s test bank with your own free sandbox keys. Find them at dashboard.plaid.com → Developers → Keys. Use the
          Sandbox secret, never Production.
        </Text>
        <Field
          label="Client ID"
          value={form.plaidClientId}
          onChangeText={set('plaidClientId')}
          autoCapitalize="none"
          autoCorrect={false}
          error={e.plaidClientId}
        />
        <Field
          label="Sandbox secret"
          value={form.plaidSecret}
          onChangeText={set('plaidSecret')}
          secure
          autoCapitalize="none"
          autoCorrect={false}
          error={e.plaidSecret}
          helper="Stored only on this device, with your account"
          onSubmitEditing={create}
        />
        <Gap h={10} />
        <PillButton label={submitting ? 'Creating account…' : 'Create account'} onPress={create} disabled={submitting} />
      </Scroll>
      <Tap onPress={back} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontSize: 36, color: c.muted }}>Already have an account? </Text>
          <Text style={{ fontSize: 36, fontWeight: '700', color: c.ink }}>Sign in</Text>
        </View>
      </Tap>
    </Screen>
  );
}
