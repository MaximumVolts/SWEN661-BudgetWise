import { useState } from 'react';
import type { FlowStep } from '../models/navigation';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDisplay } from '../state/PreferencesContext';
import { useServices } from '../state/ServicesContext';
import { useSession } from '../state/SessionContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 02 - Onboarding priorities: what the user wants help with, and how they're paid. */
export function useOnboardingController() {
  const { onboarding, settings } = useServices();
  const { enter } = useSession();
  const { preferences } = useDisplay();
  const nav = useAppNavigator();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => onboarding.loadOptions(), [onboarding]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [income, setIncome] = useState<string>();
  /** "Show patterns and icons on charts" (colorblind mode); undefined = left as it is. */
  const [chartPatterns, setChartPatterns] = useState<boolean>();

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async (priorities: Set<string>, incomeId: string | undefined) => {
    let step: FlowStep | undefined;
    const ok = await perform(async () => {
      step = await onboarding.savePreferences(priorities, incomeId);
      if (chartPatterns !== undefined && chartPatterns !== preferences.colorblindMode) await settings.setColorblindMode(chartPatterns);
    });
    if (!ok) return;
    // Connecting a bank is pushed on top, so Back returns here.
    if (step === 'connectBank') nav.openConnectBank();
    else if (step) enter(step);
  };

  return {
    state,
    reload,
    selected,
    toggle,
    income,
    setIncome,
    chartPatterns: chartPatterns ?? preferences.colorblindMode,
    setChartPatterns,
    next: () => save(selected, income),
    /** Moves on without answering. */
    skip: () => save(new Set(), undefined),
    /** Back only when there's a previous page (there's none right after signing up). */
    back: nav.canGoBack() ? nav.back : undefined,
  };
}

export type OnboardingController = ReturnType<typeof useOnboardingController>;
