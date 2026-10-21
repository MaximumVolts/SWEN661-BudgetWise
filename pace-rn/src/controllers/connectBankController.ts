import { useState } from 'react';
import type { LinkOutcome } from '../models/navigation';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useAction } from './base/useActions';

/** 03 - Connect Bank: links Plaid's sandbox test bank, then moves on to where the service says. */
export function useConnectBankController() {
  const { bankLink } = useServices();
  const { enter } = useSession();
  const nav = useAppNavigator();
  const perform = useAction();
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    setConnecting(true);
    let outcome: LinkOutcome | undefined;
    const ok = await perform(async () => (outcome = await bankLink.startLink()));
    setConnecting(false);
    if (ok && outcome?.linked && outcome.next) enter(outcome.next);
  };

  return { connecting, connect, back: nav.back };
}

export type ConnectBankController = ReturnType<typeof useConnectBankController>;
