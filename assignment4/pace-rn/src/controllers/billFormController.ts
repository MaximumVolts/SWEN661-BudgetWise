import { Frequency, type RecurringFrequency, type RecurringKind } from '../models/recurring';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useStateFor } from '../utils/useStateFor';
import { useFormSubmit } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

const amountText = (v?: number) => (v === undefined ? '' : v === Math.round(v) ? v.toFixed(0) : v.toFixed(2));

/**
 * Add a recurring expense (no [id]) or edit one the user added: name, amount, bill or
 * subscription, how often, the next payment date and a category. What's valid is BillService's.
 * The fields start from the expense being edited once its options have loaded.
 */
export function useBillFormController(id?: string) {
  const { bills } = useServices();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, setFieldErrors, submit } = useFormSubmit();
  const { state, reload } = useAsyncData(() => bills.formOptions(id), [bills, id]);
  const options = state.data;
  const editing = options?.editing;
  const [name, setName] = useStateFor(options, editing?.name ?? '');
  const [amount, setAmount] = useStateFor(options, amountText(editing?.amount));
  const [kind, setKind] = useStateFor<RecurringKind | undefined>(options, editing?.kind);
  const [frequency, setFrequency] = useStateFor<RecurringFrequency>(options, editing?.frequency ?? Frequency.monthly);
  const [firstDue, setFirstDue] = useStateFor<Date | undefined>(options, editing?.firstDue);
  const [categoryId, setCategoryId] = useStateFor<string | undefined>(options, editing?.categoryId);

  /** Sets a choice and clears its error. */
  const pick =
    <T>(field: string, set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setFieldErrors(({ [field]: _, ...rest }) => rest);
    };

  const save = async () => {
    const r = await submit(() => bills.saveRecurring({ editingId: id, name, amount, frequency, firstDue, categoryId, kind }));
    if (r.ok) nav.back();
  };

  return {
    state,
    reload,
    isEditing: id !== undefined,
    name,
    setName,
    amount,
    setAmount,
    kind,
    pickKind: pick('kind', setKind),
    frequency,
    pickFrequency: pick('frequency', (code: string) => setFrequency(options!.frequencies.find((f) => f.code === code)!)),
    firstDue,
    pickFirstDue: pick('firstDue', setFirstDue),
    categoryId,
    pickCategory: pick('category', setCategoryId),
    submitting,
    fieldErrors,
    save,
    back: nav.back,
  };
}

export type BillFormController = ReturnType<typeof useBillFormController>;
