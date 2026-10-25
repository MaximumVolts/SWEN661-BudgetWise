import { Text, View } from 'react-native';
import type { ForgotPasswordController } from '../../controllers/forgotPasswordController';
import { useDisplay } from '../../state/PreferencesContext';
import { Card, Field, Gap, PillButton, Screen, Scroll, Tap, TopBar } from '../../ui/components';
import { Icon } from '../../ui/icons';

/**
 * 01c - Reset Password. Step 1 asks for the username; step 2 shows the account's security
 * question and takes the answer and a new password.
 */
export function ForgotPasswordScreen({ controller }: { controller: ForgotPasswordController }) {
  const {
    username,
    setUsername,
    question,
    answer,
    setAnswer,
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    fieldErrors: e,
    lookUp,
    reset,
    back,
    signIn,
  } = controller;
  const { colors: c, type: t } = useDisplay();

  return (
    <Screen>
      <TopBar title="Reset password" onBack={back} />
      <Scroll>
        <Gap h={8} />
        {question === undefined ? (
          <>
            <Text style={t.h1}>Forgot your password?</Text>
            <Gap h={10} />
            <Text style={t.body}>Enter your account’s username and we’ll ask your security question.</Text>
            <Gap h={24} />
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              error={e.username}
              onSubmitEditing={lookUp}
            />
            <Gap h={10} />
            <PillButton label={submitting ? 'Checking…' : 'Continue'} onPress={lookUp} disabled={submitting} />
          </>
        ) : (
          <>
            <Text style={t.h1}>Answer your security question</Text>
            <Gap h={18} />
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Icon name="help-outline" color={c.ink} />
                <Text style={{ flex: 1, fontSize: 17, fontWeight: '600', color: c.ink }}>{question}</Text>
              </View>
            </Card>
            <Gap h={18} />
            <Field label="Answer" value={answer} onChangeText={setAnswer} error={e.securityAnswer} helper="Not case-sensitive" />
            <Field
              label="New password"
              value={password}
              onChangeText={setPassword}
              secure
              error={e.password}
              helper="At least 8 characters, with a letter and a number"
            />
            <Field label="Confirm new password" value={confirm} onChangeText={setConfirm} secure error={e.confirmPassword} onSubmitEditing={reset} />
            <Gap h={10} />
            <PillButton label={submitting ? 'Resetting…' : 'Reset password'} onPress={reset} disabled={submitting} />
          </>
        )}
      </Scroll>
      <Tap onPress={signIn} style={{ alignItems: 'center', paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ fontSize: 36, color: c.muted }}>Remembered it? </Text>
          <Text style={{ fontSize: 36, fontWeight: '700', color: c.ink }}>Sign in</Text>
        </View>
      </Tap>
    </Screen>
  );
}
