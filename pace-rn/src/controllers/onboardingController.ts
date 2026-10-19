import { useState } from 'react';
import type { FlowStep } from '../models/navigation';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 02 - Onboarding priorities: what the user wants help with, and how they're paid. */
export function useOnboardingController() {
  const { onboarding } = useServices();
  const { enter } = useSession();
  const nav = useAppNavigator();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => onboarding.loadOptions(), [onboarding]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [income, setIncome] = useState<string>();

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const next = async () => {
    let step: FlowStep | undefined;
    if (!(await perform(async () => (step = await onboarding.savePreferences(selected, income))))) return;
    // Connecting a bank is pushed on top, so Back returns here.
    if (step === 'connectBank') nav.openConnectBank();
    else if (step) enter(step);
  };

  return { state, reload, selected, toggle, income, setIncome, next };
}

export type OnboardingController = ReturnType<typeof useOnboardingController>;
