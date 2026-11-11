import type { TrendItem } from '../models/trend';
import { useAppNavigator } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useAsyncData } from './base/useAsyncData';

/** 17 - Trends: what's changing in the user's money, in plain language. */
export function useTrendsController() {
  const { trends, bankLink } = useServices();
  const nav = useAppNavigator();
  const { state, reload } = useAsyncData(() => trends.getTrends(), [trends], [bankLink.dataUpdates]);

  /** Opens the transactions behind [t] (TrendService says which). */
  const openTrend = (t: TrendItem) => nav.openTransactions(trends.transactionFilterFor(t.id));

  return { state, reload, back: nav.back, openTrend };
}

export type TrendsController = ReturnType<typeof useTrendsController>;
