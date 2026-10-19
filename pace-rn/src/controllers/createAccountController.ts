import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useFormSubmit } from './base/useActions';

export interface CreateAccountForm {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
  plaidClientId: string;
  plaidSecret: string;
}

const EMPTY: CreateAccountForm = {
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  securityQuestion: '',
  securityAnswer: '',
  plaidClientId: '',
  plaidSecret: '',
};

/** 01b - Create Account, with the user's own Plaid sandbox keys. The service validates everything. */
export function useCreateAccountController() {
  const { auth } = useServices();
  const { enter } = useSession();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, submit } = useFormSubmit();
  const [form, setForm] = useState(EMPTY);

  /** A setter for one field of the form. */
  const set = (key: keyof CreateAccountForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const create = async () => {
    const r = await submit(() => auth.createAccount(form));
    if (r.ok) enter(r.value);
  };

  return {
    form,
    set,
    securityQuestions: auth.securityQuestions,
    submitting,
    fieldErrors,
    create,
    back: nav.back,
  };
}

export type CreateAccountController = ReturnType<typeof useCreateAccountController>;
