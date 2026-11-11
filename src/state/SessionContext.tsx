import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { FlowStep } from '../models/navigation';
import { useServices } from './ServicesContext';

/**
 * Where the user is in the app's journey, which decides the routes they can reach:
 *  - signedOut: sign in, create an account, reset a password;
 *  - setup: a new account's onboarding and first bank connection;
 *  - app: everything else.
 */
export type SessionStage = 'signedOut' | 'setup' | 'app';

interface Session {
  stage: SessionStage;
  /** Moves the journey to the step a service decided on (e.g. after signing in or up). */
  enter(step: FlowStep): void;
  signOut(): Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

const stageFor = (step: FlowStep): SessionStage => (step === 'home' ? 'app' : 'setup');

export function SessionProvider({ children }: { children: ReactNode }) {
  const { auth } = useServices();
  const [stage, setStage] = useState<SessionStage>(auth.isSignedIn ? 'app' : 'signedOut');

  // Signing out (or deleting the account) from anywhere ends the session.
  useEffect(() => auth.signedInChanges.subscribe((signedIn) => !signedIn && setStage('signedOut')), [auth]);

  const enter = useCallback((step: FlowStep) => setStage(auth.isSignedIn ? stageFor(step) : 'signedOut'), [auth]);
  const signOut = useCallback(() => auth.signOut(), [auth]);
  const value = useMemo(() => ({ stage, enter, signOut }), [stage, enter, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside <SessionProvider>');
  return session;
}
