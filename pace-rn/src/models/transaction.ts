export interface CategoryInfo {
  id: string;
  name: string;
  iconKey: string;
}

/** Negative [amount] = money out, positive = money in (income). */
export interface TransactionItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  iconKey: string;
  /** Lime icon background (e.g. income). */
  highlight?: boolean;
}

export interface TransactionGroup {
  dayLabel: string;
  total: number;
  items: TransactionItem[];
}

export interface TransactionDetailData {
  id: string;
  title: string;
  iconKey: string;
  amount: number;
  dateLabel: string;
  accountLabel: string;
  statusLabel: string;
  merchantLabel: string;
  /**
   * The transaction's categories in order. The first is primary: its full amount counts there in
   * spending, budgets and trends; the rest are labels for display and filtering.
   */
  selectedCategoryIds: string[];
  /** The user's own note on it, if any. */
  note?: string;
}

export interface TransactionDetailBundle {
  transaction: TransactionDetailData;
  categories: CategoryInfo[];
}

export type FilterKind = 'account' | 'category' | 'date';

export interface FilterChoice {
  id: string;
  label: string;
}

/** Filters applied to the transactions list. undefined = no filter ("All"). */
export interface TransactionQuery {
  account?: FilterChoice;
  category?: FilterChoice;
  date?: FilterChoice;
  /** What the user typed in the search field ('' = no search). */
  search: string;
}

export const emptyQuery: TransactionQuery = { search: '' };

export const withFilter = (q: TransactionQuery, kind: FilterKind, choice?: FilterChoice): TransactionQuery => ({
  ...q,
  [kind]: choice,
});
