import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';

/** 10b - Spending by category: one category over the period ([rangeIndex]) chosen on Spending. */
export function useSpendingCategoryController(id: string, rangeIndex: number) {
  const { spending, bankLink } = useServices();
  const nav = useAppNavigator();
  const { state, reload } = useAsyncData(() => spending.getCategoryDetail(id, rangeIndex), [spending, id, rangeIndex], [bankLink.dataUpdates]);
  return { state, reload, back: nav.back, openTransaction: nav.openTransaction };
}

export type SpendingCategoryController = ReturnType<typeof useSpendingCategoryController>;
