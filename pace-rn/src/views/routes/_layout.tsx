import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../../state/AppProviders';
import { useDisplay } from '../../state/PreferencesContext';
import { appServices } from '../../state/ServicesContext';
import { useSession } from '../../state/SessionContext';

/**
 * The routes each stage of the journey can reach. A route whose guard turns false (e.g. on sign
 * out) is left automatically for the first one that's allowed.
 */
function RootStack() {
  const { stage } = useSession();
  const { colors } = useDisplay();
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Protected guard={stage === 'signedOut'}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="create-account" />
          <Stack.Screen name="forgot-password" />
        </Stack.Protected>
        <Stack.Protected guard={stage === 'setup'}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="connect-bank" />
        </Stack.Protected>
        <Stack.Protected guard={stage === 'app'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="transaction/[id]" />
          <Stack.Screen name="spending-category/[id]" />
          <Stack.Screen name="budget-category/[id]" />
          <Stack.Screen name="budget-form" />
          <Stack.Screen name="manage-budgets" />
          <Stack.Screen name="bill/[id]" />
          <Stack.Screen name="bill-form" />
          <Stack.Screen name="accounts" />
          <Stack.Screen name="add-account" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="goals" />
          <Stack.Screen name="goal-form" />
          <Stack.Screen name="cash-flow" />
          <Stack.Screen name="expected-income-form" />
          <Stack.Screen name="trends" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="statements" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders services={appServices()}>
      <RootStack />
    </AppProviders>
  );
}
