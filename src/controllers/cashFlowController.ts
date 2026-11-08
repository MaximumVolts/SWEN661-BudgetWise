import { useState } from 'react';
import type { BreakdownLine } from '../models/cashFlow';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** 16 - Cash flow projection: where cash is heading over 30 / 60 / 90 days, for a chosen income scenario. */
export function useCashFlowController() {
  const { cashFlow, bankLink } = useServices();
  const nav = useAppNavigator();
  const { confirm } = useDialogs();
  const perform = useAction();
  const [range, setRange] = useState(0);
  const [scenario, setScenario] = useState(1); // Expected
  const { state, reload } = useAsyncData(() => cashFlow.getProjection(range, scenario), [cashFlow, range, scenario], [
    cashFlow.changes,
    bankLink.dataUpdates,
  ]);

  /** Removes income the user added (after asking). */
  const removeIncome = async (line: BreakdownLine) => {
    if (!(await confirm({ title: `Remove ${line.title}?`, message: 'It won’t count in your cash flow projection any more.', action: 'Remove' }))) return;
    await perform(() => cashFlow.removeExpectedIncome(line.expectedIncomeId!));
  };

  return {
    state,
    reload,
    setRange,
    setScenario,
    removeIncome,
    addIncome: nav.openExpectedIncomeForm,
    back: nav.back,
  };
}

export type CashFlowController = ReturnType<typeof useCashFlowController>;
