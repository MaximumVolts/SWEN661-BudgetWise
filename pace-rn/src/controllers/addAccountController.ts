import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/**
 * Accounts → Add an account: choose one of Plaid's sandbox test banks to link. Banks already
 * connected can't be picked (BankLinkService says which).
 */
export function useAddAccountController() {
  const { bankLink } = useServices();
  const nav = useAppNavigator();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => bankLink.institutions(), [bankLink]);
  const [chosen, setChosen] = useState<string>();
  const [connecting, setConnecting] = useState(false);
  const institutions = state.data ?? [];
  // The first bank not linked yet is preselected.
  const selected = institutions.find((i) => i.id === chosen && !i.isLinked) ?? institutions.find((i) => !i.isLinked);

  const connect = async () => {
    if (!selected) return;
    setConnecting(true);
    const ok = await perform(() => bankLink.startLink(selected.id));
    setConnecting(false);
    if (!ok) return;
    notify(`${selected.name} connected`);
    nav.back();
  };

  return { state, reload, selected, choose: setChosen, connecting, connect, back: nav.back };
}

export type AddAccountController = ReturnType<typeof useAddAccountController>;
