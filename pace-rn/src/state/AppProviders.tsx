import { type ReactNode, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { AppServices } from '../services/appServices';
import { DialogProvider } from './DialogContext';
import { NoticeProvider } from './NoticeContext';
import { PreferencesProvider } from './PreferencesContext';
import { ServicesProvider, useServices } from './ServicesContext';
import { SessionProvider } from './SessionContext';

/**
 * Keeps the phone's bill reminders in step while the app runs (like Flutter's BillReminderController
 * at the app root). When to reschedule is BillReminderService's decision.
 */
function BillReminderScheduler() {
  const { reminders } = useServices();
  useEffect(() => reminders.keepScheduled(), [reminders]);
  return null;
}

/** All of the app's shared state, as nested context providers. */
export function AppProviders({ services, children }: { services: AppServices; children: ReactNode }) {
  // Background re-checks for bank data stop when the app goes away.
  useEffect(() => () => services.stop(), [services]);
  return (
    <SafeAreaProvider>
      <ServicesProvider services={services}>
        <SessionProvider>
          <PreferencesProvider>
            <NoticeProvider>
              <DialogProvider>
                <BillReminderScheduler />
                {children}
              </DialogProvider>
            </NoticeProvider>
          </PreferencesProvider>
        </SessionProvider>
      </ServicesProvider>
    </SafeAreaProvider>
  );
}
