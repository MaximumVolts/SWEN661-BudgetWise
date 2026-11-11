import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useFormSubmit } from './base/useActions';

/** 01 - Sign In: username + password. AuthService checks them and decides where the user goes next. */
export function useSignInController() {
  const { auth } = useServices();
  const { enter } = useSession();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, submit } = useFormSubmit();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async () => {
    const r = await submit(() => auth.signIn(username, password));
    if (r.ok) enter(r.value);
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    submitting,
    fieldErrors,
    signIn,
    forgotPassword: nav.openForgotPassword,
    createAccount: nav.openCreateAccount,
  };
}

export type SignInController = ReturnType<typeof useSignInController>;
