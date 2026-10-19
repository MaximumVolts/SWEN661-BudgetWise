import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** Budgets manager: every budget (each applies to every month) with Edit / Delete, plus "New budget". */
export function useManageBudgetsController() {
  const { budgets } = useServices();
  const nav = useAppNavigator();
  const { confirm } = useDialogs();
  const perform = useAction();
  const { state, reload } = useAsyncData(() => budgets.budgets(), [budgets], [budgets.changes]);
  /** The category whose budget is being deleted. */
  const [deleting, setDeleting] = useState<string>();

  const remove = async (categoryId: string, name: string) => {
    if (!(await confirm({ title: `Delete the ${name} budget?`, message: 'Its monthly limit will be removed. Your transactions aren’t affected.', action: 'Delete' })))
      return;
    setDeleting(categoryId);
    await perform(() => budgets.deleteBudget(categoryId));
    setDeleting(undefined);
  };

  return {
    state,
    reload,
    deleting,
    remove,
    edit: (categoryId: string) => nav.openBudgetForm(categoryId),
    newBudget: () => nav.openBudgetForm(),
    back: nav.back,
  };
}

export type ManageBudgetsController = ReturnType<typeof useManageBudgetsController>;
