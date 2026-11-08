import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { ConnectBankController } from '../../../controllers/connectBankController';
import type { OnboardingController } from '../../../controllers/onboardingController';
import type { SignInController } from '../../../controllers/signInController';
import { useDisplay } from '../../../state/PreferencesContext';
import { AsyncView, ConnectingNotice, Field, Heading, TestModeBanner } from '../../../ui/components';
import { Checkbox, DButton, DChip, DText, Panel, Radio, SwitchLine } from '../../../ui/desktop';
import { Icon, type IconName } from '../../../ui/icons';
import { KeyGroup } from '../../../ui/keyboard';

/** The right-hand side of the sign-up frame: a readable column with room around it. */
function JourneyPage({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const { colors: c } = useDisplay();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ paddingHorizontal: 96, paddingTop: header ? 56 : 104, paddingBottom: 64 }} keyboardShouldPersistTaps="handled">
      <View style={{ width: '100%', maxWidth: 928, gap: 24 }}>
        {header}
        {children}
      </View>
    </ScrollView>
  );
}

/** "← Back · STEP 2 OF 3 · Skip" above a setup step. */
function StepHeader({ step, onBack, onSkip }: { step: number; onBack?: () => void; onSkip?: () => void }) {
  const { colors: c } = useDisplay();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48 }}>
      <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: -12 }}>{onBack && <DButton label="Back" icon="arrow-back" kind="text" onPress={onBack} />}</View>
      <Text style={{ fontSize: 12, letterSpacing: 0.8, color: c.muted }}>STEP {step} OF 3</Text>
      <View style={{ flex: 1 }}>{onSkip && <DButton label="Skip" kind="text" align="end" onPress={onSkip} />}</View>
    </View>
  );
}

/** Step 1 - Sign in. */
export function SignInDesktop({ controller }: { controller: SignInController }) {
  const { username, setUsername, password, setPassword, submitting, fieldErrors, signIn, forgotPassword, createAccount } = controller;
  const { colors: c } = useDisplay();
  return (
    <JourneyPage>
      <Heading style={[DText.title, { fontSize: 36, lineHeight: 44, color: c.ink }]}>Your money, at your pace.</Heading>
      <Text style={[DText.body, { color: c.muted, marginTop: -8 }]}>Connect your accounts once, and Pace automatically keeps track of your spending, budgets, and bills.</Text>
      <View>
        <Field
          inset
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          error={fieldErrors.username}
        />
        <Field inset label="Password" value={password} onChangeText={setPassword} secure autoComplete="password" error={fieldErrors.password} onSubmitEditing={signIn} />
        <View style={{ marginTop: -8 }}>
          <DButton label="Forgot password?" kind="text" align="end" onPress={forgotPassword} />
        </View>
      </View>
      <DButton label={submitting ? 'Signing in…' : 'Sign in'} kind="primary" onPress={signIn} disabled={submitting} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
        <Text style={[DText.body, { color: c.muted }]}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <Text style={[DText.body, { color: c.muted }]}>New to Pace?</Text>
        <DButton label="Create account" kind="text" onPress={createAccount} />
      </View>
    </JourneyPage>
  );
}

/** Step 2 - Priorities: what Pace should help with, how the user is paid, chart patterns. */
export function OnboardingDesktop({ controller }: { controller: OnboardingController }) {
  const { state, reload, selected, toggle, income, setIncome, chartPatterns, setChartPatterns, next, skip, back } = controller;
  const { colors: c } = useDisplay();
  return (
    <JourneyPage header={<StepHeader step={2} onBack={back} onSkip={skip} />}>
      <Heading style={[DText.title, { color: c.ink }]}>What should Pace help you with?</Heading>
      <Text style={[DText.body, { color: c.muted, marginTop: -8 }]}>Pick as many as you like. You can change these anytime in Settings.</Text>
      <AsyncView state={state} onRetry={reload}>
        {(options) => (
          <View style={{ gap: 24 }}>
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: c.ink }}>Your priorities</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {options.priorities.map((o) => (
                  <DChip key={o.id} label={o.label} role="checkbox" selected={selected.has(o.id)} onPress={() => toggle(o.id)} />
                ))}
              </View>
            </View>
            {options.incomeOptions.length > 0 && (
              <Panel title="Your income">
                <KeyGroup role="radiogroup" label="How you're paid" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, paddingTop: 8 }}>
                  {options.incomeOptions.map((o) => (
                    <View key={o.id} style={{ flex: 1, minWidth: 260 }}>
                      <Radio label={o.title} caption={o.subtitle} selected={income === o.id} onPress={() => setIncome(o.id)} />
                    </View>
                  ))}
                </KeyGroup>
              </Panel>
            )}
            <View style={{ maxWidth: 420 }}>
              <SwitchLine title="Show patterns and icons on charts" caption="Helpful if colors are hard to tell apart" value={chartPatterns} onChange={setChartPatterns} />
            </View>
            <DButton label="Continue" kind="primary" onPress={next} />
          </View>
        )}
      </AsyncView>
    </JourneyPage>
  );
}

/** Step 3 - Connect a bank (Plaid's sandbox test bank only), after agreeing to it. */
export function ConnectBankDesktop({ controller }: { controller: ConnectBankController }) {
  const { connecting, connect, back, agreed, setAgreed, notNow } = controller;
  const { colors: c } = useDisplay();
  return (
    <JourneyPage header={<StepHeader step={3} onBack={connecting ? undefined : back} onSkip={connecting ? undefined : notNow} />}>
      <Heading style={[DText.title, { color: c.ink }]}>Connect your bank with Plaid</Heading>
      <Text style={[DText.body, { color: c.muted, marginTop: -8 }]}>
        Pace uses Plaid to link checking, savings and credit accounts. Transactions import automatically, so you never have to type them in.
      </Text>
      <TestModeBanner />
      {connecting ? (
        <ConnectingNotice />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <Point icon="science" title="Test bank only" body="Pace links Plaid's sandbox test bank. You won't be asked for, and can't enter, real bank details." />
            <Point icon="visibility" title="Read-only access" body="Pace sees balances and transactions. It can't move your money." />
            <Point icon="lock-outline" title="Encrypted on this computer" body="Bank access tokens are encrypted with your computer's secure storage." />
            <Point icon="link-off" title="Disconnect anytime" body="Remove a connection from your Profile, and its accounts are deleted from this computer." />
          </View>
          <Checkbox label="I agree to let Pace access my test account data through Plaid." checked={agreed} onChange={setAgreed} />
        </>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <DButton label={connecting ? 'Connecting to test bank…' : 'Connect with Plaid'} icon="link" kind="primary" onPress={connect} disabled={connecting || !agreed} />
        {!connecting && <DButton label="Not now" kind="text" onPress={notNow} />}
      </View>
    </JourneyPage>
  );
}

function Point({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  const { colors: c } = useDisplay();
  return (
    <Panel style={{ flexBasis: 360, flexGrow: 1 }}>
      <Icon name={icon} color={c.ink} />
      <Text style={{ fontSize: 16, fontWeight: '500', color: c.ink }}>{title}</Text>
      <Text style={[DText.body, { color: c.muted }]}>{body}</Text>
    </Panel>
  );
}

