import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';

/** 08 - Budgets: this month and the two before; limits carry over, spending is per month. */
export function useBudgetsController() {
  const { budgets, bankLink } = useServices();
  const nav = useAppNavigator();
  const periods = useAsyncData(() => budgets.getPeriods(), [budgets]);
  const [chosen, setChosen] = useState<number>();
  const list = periods.state.data ?? [];
  // "Current period" is a service decision.
  const selected = chosen ?? Math.max(0, list.findIndex((p) => p.isCurrent));
  const periodId = list[selected]?.id;
  const overview = useAsyncData(
    async () => (periodId ? budgets.getOverview(periodId) : undefined),
    [budgets, periodId],
    [budgets.changes, bankLink.dataUpdates],
  );

  return {
    periods,
    overview,
    selected,
    selectPeriod: setChosen,
    openManageBudgets: nav.openManageBudgets,
    /** A category's budget in the period being shown. */
    openCategory: (id: string) => nav.openBudgetCategory(id, periodId),
    newBudget: () => nav.openBudgetForm(),
  };
}

export type BudgetsController = ReturnType<typeof useBudgetsController>;
