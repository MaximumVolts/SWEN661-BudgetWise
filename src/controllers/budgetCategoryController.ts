import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';

/** 09 - Budget category detail: [periodId]'s spending against the limit, the pace, recent transactions. */
export function useBudgetCategoryController(id: string, periodId?: string) {
  const { budgets, bankLink } = useServices();
  const nav = useAppNavigator();
  const { state, reload } = useAsyncData(() => budgets.getCategoryDetail(id, periodId ?? ''), [budgets, id, periodId], [
    budgets.changes,
    bankLink.dataUpdates,
  ]);
  return {
    state,
    reload,
    back: nav.back,
    edit: () => nav.openBudgetForm(id),
    openTransaction: nav.openTransaction,
  };
}

export type BudgetCategoryController = ReturnType<typeof useBudgetCategoryController>;
