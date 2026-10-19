import { useEffect, useRef, useState } from 'react';
import { type FilterChoice, type FilterKind, type TransactionQuery, withFilter } from '../models/transaction';
import { useAppNavigator } from '../navigation/appNavigator';
import { useDialogs } from '../state/DialogContext';
import { useServices } from '../state/ServicesContext';
import { useAction } from './base/useActions';
import { useAsyncData } from './base/useAsyncData';

/** How long typing has to pause before the search runs. */
const SEARCH_DELAY_MS = 300;

const FILTER_TITLES: Record<FilterKind, [string, string]> = {
  account: ['Account', 'All accounts'],
  category: ['Category', 'All categories'],
  date: ['Date', 'Any date'],
};

/**
 * 06 - Transactions: search as you type, filter by account / category / date.
 * [category]: the starting filter when opened for a category (e.g. from a trend).
 */
export function useTransactionsController(category?: string) {
  const { transactions, bankLink } = useServices();
  const nav = useAppNavigator();
  const { choose } = useDialogs();
  const perform = useAction();
  const [query, setQuery] = useState<TransactionQuery>(() => transactions.queryForCategory(category));
  /** What's in the search box (the query catches up once typing pauses). */
  const [searchText, setSearchText] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const { state, reload } = useAsyncData(() => transactions.getGroups(query), [transactions, query], [bankLink.dataUpdates]);

  const search = (text: string) => {
    setSearchText(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setQuery((q) => ({ ...q, search: text })), SEARCH_DELAY_MS);
  };
  const clearSearch = () => {
    clearTimeout(timer.current);
    setSearchText('');
    setQuery((q) => ({ ...q, search: '' }));
  };

  const pickFilter = async (kind: FilterKind) => {
    let choices: FilterChoice[] = [];
    if (!(await perform(async () => (choices = await transactions.getFilterChoices(kind))))) return;
    const [title, all] = FILTER_TITLES[kind];
    const current = query[kind];
    const picked = await choose({
      title: `Filter by ${title.toLowerCase()}`,
      options: [{ id: '', label: all }, ...choices],
      selectedId: current?.id ?? '',
    });
    if (picked === undefined) return;
    setQuery((q) => withFilter(q, kind, picked ? choices.find((ch) => ch.id === picked) : undefined));
  };

  return { state, reload, query, searchText, search, clearSearch, pickFilter, openTransaction: nav.openTransaction };
}

export type TransactionsController = ReturnType<typeof useTransactionsController>;
