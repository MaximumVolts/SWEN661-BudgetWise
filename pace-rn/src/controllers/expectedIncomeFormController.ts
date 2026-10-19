import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useFormSubmit } from './base/useActions';

/** Cash flow → Add expected income: what it is, how much, and when it's expected. CashFlowService validates. */
export function useExpectedIncomeFormController() {
  const { cashFlow } = useServices();
  const nav = useAppNavigator();
  const { submitting, fieldErrors, submit } = useFormSubmit();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState<Date>();

  const save = async () => {
    const r = await submit(() => cashFlow.addExpectedIncome({ name, amount, date }));
    if (r.ok) nav.back();
  };

  return {
    name,
    setName,
    amount,
    setAmount,
    date,
    setDate,
    /** Expected income can't be in the past. */
    earliestDate: cashFlow.earliestIncomeDate(),
    submitting,
    fieldErrors,
    save,
    back: nav.back,
  };
}

export type ExpectedIncomeFormController = ReturnType<typeof useExpectedIncomeFormController>;
