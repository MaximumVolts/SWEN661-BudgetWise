import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '../../state/AppProviders';
import { useDisplay } from '../../state/PreferencesContext';
import { appServices } from '../../state/ServicesContext';
import { useSession } from '../../state/SessionContext';
import { Platform } from 'react-native';
import { useDesktop } from '../../ui/responsive';
import { AppFrameView, type FrameMode } from '../AppFrameView';
import { KeyboardShortcutsView } from '../KeyboardShortcutsView';

/**
 * The routes each stage of the journey can reach. A route whose guard turns false (e.g. on sign
 * out) is left automatically for the first one that's allowed.
 */
function RootStack() {
  const { stage } = useSession();
  const { colors } = useDisplay();
  const desktop = useDesktop();
  const stack = (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: desktop ? 'none' : undefined }}>
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
        <Stack.Screen name="comparison" />
      </Stack.Protected>
    </Stack>
  );
  // Desktop: signed-in pages sit in the sidebar frame; signing in and setup beside the step list.
  // Phones and tablets never get a frame, so the stack stays as it is there.
  const mode: FrameMode = !desktop ? 'none' : stage === 'app' ? 'app' : 'journey';
  return (
    <>
      <StatusBar style="dark" />
      {Platform.OS === 'web' ? <AppFrameView mode={mode}>{stack}</AppFrameView> : stack}
      {/* Desktop keyboard shortcuts, once signed in (any window width). */}
      {Platform.OS === 'web' && stage === 'app' && <KeyboardShortcutsView />}
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
