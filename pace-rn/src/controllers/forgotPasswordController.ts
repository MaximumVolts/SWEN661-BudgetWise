import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useFormSubmit } from './base/useActions';

/**
 * 01c - Reset Password. Step 1 asks for the username; step 2 shows the account's security
 * question and takes the answer and a new password. The rules (lockout etc.) are AuthService's.
 */
export function useForgotPasswordController() {
  const { auth } = useServices();
  const { enter } = useSession();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, setFieldErrors, submit } = useFormSubmit();
  const [username, setUsername] = useState('');
  /** The account's security question; undefined while on step 1. */
  const [question, setQuestion] = useState<string>();
  const [answer, setAnswer] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const lookUp = async () => {
    const r = await submit(() => auth.securityQuestionFor(username));
    if (r.ok) setQuestion(r.value);
  };
  const reset = async () => {
    const r = await submit(() =>
      auth.resetPassword({ username: username.trim(), securityAnswer: answer, newPassword: password, confirmPassword: confirm }),
    );
    if (r.ok) enter(r.value);
  };
  /** Back from step 2 returns to step 1; from step 1 it leaves the screen. */
  const back = () => {
    if (question === undefined) return nav.back();
    setQuestion(undefined);
    setFieldErrors({});
  };

  return {
    username,
    setUsername,
    question,
    answer,
    setAnswer,
    password,
    setPassword,
    confirm,
    setConfirm,
    submitting,
    fieldErrors,
    lookUp,
    reset,
    back,
    signIn: nav.back,
  };
}

export type ForgotPasswordController = ReturnType<typeof useForgotPasswordController>;
