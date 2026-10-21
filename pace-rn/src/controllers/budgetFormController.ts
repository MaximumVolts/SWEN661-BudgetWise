import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useStateFor } from '../utils/useStateFor';
import { useAction, useFormSubmit } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** The limit as text for the field: "400", or "250.50" when it has cents. */
const limitText = (v?: number) => (v === undefined ? '' : v === Math.round(v) ? v.toFixed(0) : v.toFixed(2));

/**
 * Create a budget (no [id]) or edit / delete the one for category [id]: a spending category and
 * its monthly limit. The rules (one budget per category, valid limits) are BudgetService's.
 */
export function useBudgetFormController(id?: string) {
  const { budgets } = useServices();
  const nav = useAppNavigator();
  const { confirm } = useDialogs();
  const perform = useAction();
  const { submitting, fieldErrors, setFieldErrors, submit } = useFormSubmit();
  const editing = id !== undefined;
  const { state, reload } = useAsyncData(() => budgets.formOptions(id), [budgets, id]);
  const [categoryId, setCategoryId] = useState(id);
  // Starts from the budget being edited once it has loaded.
  const [limit, setLimit] = useStateFor(state.data, limitText(state.data?.existing?.monthlyLimit));
  const [deleting, setDeleting] = useState(false);

  const pickCategory = (categoryId: string) => {
    setCategoryId(categoryId);
    setFieldErrors(({ category: _, ...rest }) => rest);
  };
  const save = async () => {
    const r = await submit(() => (editing ? budgets.updateBudget(id, limit, categoryId) : budgets.createBudget(categoryId, limit)));
    if (r.ok) nav.back();
  };
  const remove = async () => {
    const name = state.data?.existing?.name ?? 'this';
    if (!(await confirm({ title: `Delete the ${name} budget?`, message: 'Its monthly limit will be removed. Your transactions aren’t affected.', action: 'Delete' })))
      return;
    setDeleting(true);
    const ok = await perform(() => budgets.deleteBudget(id!));
    setDeleting(false);
    if (ok) nav.back();
  };

  return {
    state,
    reload,
    isEditing: editing,
    categoryId,
    pickCategory,
    limit,
    setLimit,
    submitting,
    deleting,
    /** Saving or deleting: the form is disabled. */
    busy: submitting || deleting,
    fieldErrors,
    save,
    remove,
    back: nav.back,
  };
}

export type BudgetFormController = ReturnType<typeof useBudgetFormController>;
