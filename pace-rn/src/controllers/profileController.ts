import { useState } from 'react';
import type { BankConnection } from '../models/linkedBank';
import type { ProfileData } from '../models/profile';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useStateFor } from '../utils/useStateFor';
import { useAction, useFormSubmit } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

interface ProfileFields {
  name: string;
  clientId: string;
  secret: string;
}

/** 16 - Profile: the name and Plaid sandbox keys (the username is read-only), plus the bank connection. */
export function useProfileController() {
  const { profile, bankLink } = useServices();
  const nav = useAppNavigator();
  const { confirm } = useDialogs();
  const perform = useAction();
  const { submitting, fieldErrors, submit } = useFormSubmit();
  const { state, reload } = useAsyncData(
    async () => ({ profile: await profile.load(), banks: await bankLink.connections() }),
    [profile, bankLink],
    [bankLink.dataUpdates],
  );

  // The form starts from the first profile loaded; after that it's the user's (reloads don't reset it).
  const loaded = state.data?.profile;
  const [edits, setEdits] = useState<ProfileFields>();
  const fields: ProfileFields = edits ?? { name: loaded?.name ?? '', clientId: loaded?.plaidClientId ?? '', secret: '' };
  /** The profile as last saved here, else as loaded. */
  const [saved, setSaved] = useState<ProfileData>();
  const [justSaved, setJustSaved] = useState(false);

  // The "saved" confirmation goes away once the user edits again.
  const edit = (key: keyof ProfileFields) => (value: string) => {
    setEdits({ ...fields, [key]: value });
    setJustSaved(false);
  };
  const save = async () => {
    setJustSaved(false);
    const r = await submit(() => profile.update({ name: fields.name, plaidClientId: fields.clientId, plaidSecret: fields.secret }));
    if (!r.ok) return;
    setSaved(r.value);
    setEdits({ ...fields, secret: '' });
    setJustSaved(true);
  };

  // Bank connection: link the sandbox test bank, or remove a connection.
  const [connecting, setConnecting] = useState(false);
  /** The connection being removed, until the list reloads without it. */
  const [removing, setRemoving] = useStateFor<string | undefined>(state.data?.banks, undefined);

  const connectBank = async () => {
    setConnecting(true);
    await perform(() => bankLink.startLink());
    setConnecting(false);
  };
  const removeBank = async (bank: BankConnection) => {
    const ok = await confirm({
      title: `Remove ${bank.institutionName}?`,
      message: 'Pace will disconnect this Plaid test connection and delete its accounts from this phone. You can connect the test bank again any time.',
      action: 'Remove',
    });
    if (!ok) return;
    setRemoving(bank.itemId);
    if (!(await perform(() => bankLink.removeConnection(bank.itemId)))) setRemoving(undefined);
  };

  return {
    state,
    reload,
    profile: saved ?? loaded,
    fields,
    setName: edit('name'),
    setClientId: edit('clientId'),
    setSecret: edit('secret'),
    submitting,
    fieldErrors,
    justSaved,
    save,
    connecting,
    removing,
    connectBank,
    removeBank,
    back: nav.back,
  };
}

export type ProfileController = ReturnType<typeof useProfileController>;
