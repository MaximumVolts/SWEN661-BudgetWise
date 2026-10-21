import type { CategoryInfo } from '../models/transaction';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useStateFor } from '../utils/useStateFor';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 07 - Transaction detail: its categories (first = primary), details and the user's note. */
export function useTransactionDetailController(id: string) {
  const { transactions } = useServices();
  const nav = useAppNavigator();
  const { promptText } = useDialogs();
  const notify = useNotice();
  const perform = useAction();
  const { state, reload, refresh } = useAsyncData(() => transactions.getDetail(id), [transactions, id]);
  const t = state.data?.transaction;
  /** The chosen category ids (first = primary); starts over when the transaction reloads. */
  const [selected, setSelected] = useStateFor(t, t?.selectedCategoryIds ?? []);

  /** Adds or removes [cat] as TransactionService's rules say. Shown at once; put back if saving fails. */
  const toggle = async (cat: CategoryInfo) => {
    if (!t) return;
    const next = transactions.toggledCategories(selected, cat.id);
    if (!next) return;
    const previous = selected;
    setSelected(next);
    if (!(await perform(() => transactions.setCategories(t.id, next)))) setSelected(previous);
  };

  const editNote = async () => {
    if (!t) return;
    const note = await promptText({ title: t.note ? 'Edit note' : 'Add a note', label: 'Note', initial: t.note, action: 'Save' });
    if (note === undefined) return;
    if (await perform(() => transactions.setNote(t.id, note))) await refresh();
  };

  return {
    state,
    reload,
    selected,
    toggle,
    editNote,
    newCategory: () => notify('New category is not implemented yet.'),
    back: nav.back,
  };
}

export type TransactionDetailController = ReturnType<typeof useTransactionDetailController>;
