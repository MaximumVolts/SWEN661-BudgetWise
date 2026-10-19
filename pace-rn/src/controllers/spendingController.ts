import { useState } from 'react';
import { useAppNavigator } from '../navigation/appNavigator';
import { useNotice } from '../state/NoticeContext';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';

/** The periods Spending can show, until the service sends its own labels. */
export const SPENDING_RANGES = ['Month', '3 months', 'Year'];

/** 10 - Spending: totals by period (Month / 3 months / Year) and category. */
export function useSpendingController() {
  const { spending, bankLink } = useServices();
  const nav = useAppNavigator();
  const notify = useNotice();
  const [range, setRange] = useState(0);
  const { state, reload } = useAsyncData(() => spending.getSpending(range), [spending, range], [bankLink.dataUpdates]);

  return {
    state,
    reload,
    range,
    rangeLabels: state.data?.rangeLabels ?? SPENDING_RANGES,
    setRange,
    chooseDateRange: () => notify('Custom date ranges are not implemented yet.'),
    /** One category over the period being shown. */
    openCategory: (id: string) => nav.openSpendingCategory(id, range),
  };
}

export type SpendingController = ReturnType<typeof useSpendingController>;
