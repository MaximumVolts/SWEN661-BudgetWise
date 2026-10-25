import { Text, View } from 'react-native';
import type { SignInController } from '../../controllers/signInController';
import { useDisplay } from '../../state/PreferencesContext';
import { Field, Gap, PillButton, Screen, Scroll, Tap } from '../../ui/components';
import { Icon } from '../../ui/icons';

/** 01 - Sign In. Google / Apple sign-in isn't offered. */
export function SignInScreen({ controller }: { controller: SignInController }) {
  const { username, setUsername, password, setPassword, submitting, fieldErrors, signIn, forgotPassword, createAccount } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <Scroll>
        <Gap h={16} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="speed" color="#1A1A1A" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: c.ink }}>Pace</Text>
        </View>
        <Gap h={40} />
        <Text style={t.display}>Your money, at your pace.</Text>
        <Gap h={20} />
        <Text style={t.body}>Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.</Text>
        <Gap h={28} />
        <Field
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          error={fieldErrors.username}
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secure
          autoComplete="password"
          error={fieldErrors.password}
          onSubmitEditing={signIn}
        />
        <View style={{ alignItems: 'flex-end' }}>
          <Tap onPress={forgotPassword} style={{ padding: 8 }}>
            <Text style={{ fontWeight: '700', fontSize: 24, color: c.ink }}>Forgot password?</Text>
          </Tap>
        </View>
        <Gap h={20} />
        <PillButton label={submitting ? 'Signing in…' : 'Sign in'} onPress={signIn} disabled={submitting} />
      </Scroll>
      <Text style={{ fontSize: 16, color: c.muted }}>New to Pace? </Text>
      <Tap onPress={createAccount} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontSize: 36, fontWeight: '700', color: c.ink }}>Create account</Text>
        </View>
      </Tap>
    </Screen>
  );
}
