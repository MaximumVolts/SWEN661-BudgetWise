import { AppException } from '../models/appException';
import { accountIn, type BankSnapshot, type BankTransaction, displayName, signedAmount } from '../models/bankData';
import {
  type CategoryInfo,
  emptyQuery,
  type FilterChoice,
  type FilterKind,
  type TransactionDetailBundle,
  type TransactionGroup,
  type TransactionItem,
  type TransactionQuery,
  withFilter,
} from '../models/transaction';
import { ALL_CATEGORIES, categoriesOf, categoryById, type CategoryOverrides, hasCategory } from './bankCategories';
import { BankDataService } from './bankDataService';
import { addDays, isBefore } from '../utils/calendar';
import { DateLabels } from '../utils/dateLabels';

/**
 * BUSINESS RULES: filtering/grouping by day, daily totals, categorisation (re-categorising a
 * transaction), pending vs posted status labels.
 */
export interface TransactionService {
  getGroups(query: TransactionQuery): Promise<TransactionGroup[]>;
  getFilterChoices(kind: FilterKind): Promise<FilterChoice[]>;
  getDetail(transactionId: string): Promise<TransactionDetailBundle>;
  getCategories(): Promise<CategoryInfo[]>;
  /** Sets the categories in order: the first is the primary one totals use. Throws when empty. */
  setCategories(transactionId: string, categoryIds: string[]): Promise<void>;
  /**
   * The categories after the user taps [categoryId]: added at the end if it isn't chosen, otherwise
   * removed (so removing the primary makes the next one primary). Undefined when the tap isn't
   * allowed: a transaction always keeps at least one category.
   */
  toggledCategories(selected: string[], categoryId: string): string[] | undefined;
  /** The search to start from: everything, or only [categoryId]'s transactions (e.g. from a trend). */
  queryForCategory(categoryId?: string): TransactionQuery;
  setNote(transactionId: string, note: string): Promise<void>;
}

const DATE_RANGES: Record<string, { label: string; days: number }> = {
  '7d': { label: 'Last 7 days', days: 7 },
  '30d': { label: 'Last 30 days', days: 30 },
  '90d': { label: 'Last 90 days', days: 90 },
};

export const STILL_LOADING = "Your test bank's transactions are still loading. They'll appear here in a few seconds.";

/**
 * A row in the list: "Uber" / "Transportation + Travel · Plaid Checking · Pending" (primary
 * category first; its icon is the row's icon). Shared with other services (dashboard, budgets).
 */
export function transactionItem(t: BankTransaction, snap: BankSnapshot, overrides: CategoryOverrides): TransactionItem {
  const categories = categoriesOf(t, overrides);
  const account = accountIn(snap, t.accountId)?.name;
  return {
    id: t.transactionId,
    title: displayName(t),
    subtitle: [categories.map((c) => c.name).join(' + '), account, t.pending ? 'Pending' : undefined].filter(Boolean).join(' · '),
    amount: signedAmount(t),
    iconKey: categories[0].iconKey,
    highlight: signedAmount(t) > 0,
  };
}

/** The search text as lower-case words ('' → none). */
export const searchWords = (text: string) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Search rule: every word must match the transaction, in any of: the merchant / bank descriptor,
 * any of its categories, the account (name or last digits), its note, "pending", or the amount. A
 * number matches the amount exactly ("12.50", "$12.50"), or by whole dollars when it has no cents
 * ("12" finds $12.00 and $12.75), or a whole number in the text (the account digits "0000"); other
 * words match anywhere in the text.
 */
export function matchesSearch(
  t: BankTransaction,
  words: string[],
  snap: BankSnapshot,
  overrides: CategoryOverrides,
  note: string | undefined,
): boolean {
  const account = accountIn(snap, t.accountId);
  const text = [
    displayName(t),
    t.name,
    ...categoriesOf(t, overrides).map((c) => c.name),
    account?.name,
    account?.mask,
    t.pending ? 'pending' : undefined,
    note,
  ]
    .filter((s): s is string => !!s)
    .join(' ')
    .toLowerCase();
  const amount = Math.abs(t.amount);
  const textWords = new Set(text.split(/[^a-z0-9.]+/));
  return words.every((w) => {
    const number = w.replace(/[$,]/g, '');
    // Anchored, with no nested repetition: linear time (the rule's check is overly cautious).
    // eslint-disable-next-line security/detect-unsafe-regex
    if (!/^-?\d+(\.\d{1,2})?$/.test(number)) return text.includes(w);
    // Numbers match the amount, or a whole number in the text (e.g. account digits "0000"), not
    // any digits inside a longer number.
    const value = Math.abs(Number(number));
    const amountMatches = number.includes('.') ? Math.abs(amount - value) < 0.005 : Math.floor(amount) === value;
    return amountMatches || textWords.has(number);
  });
}

function find(snap: BankSnapshot, id: string): BankTransaction {
  const t = snap.transactions.find((x) => x.transactionId === id);
  if (!t) throw new AppException('That transaction is no longer available from your bank.');
  return t;
}

/**
 * [TransactionService] over the linked banks' transactions from Plaid (sandbox). Category
 * overrides and notes are kept by Pace, never sent to the bank.
 */
export class PlaidTransactionService extends BankDataService implements TransactionService {
  async getGroups(query: TransactionQuery): Promise<TransactionGroup[]> {
    const snap = await this.bankData.load();
    if (!snap.transactionsReady && snap.transactions.length === 0) throw new AppException(STILL_LOADING);
    const overrides = await this.overrides();
    const days = query.date ? DATE_RANGES[query.date.id]?.days : undefined;
    const since = days === undefined ? undefined : addDays(this.currentDate(), -(days - 1));
    const words = searchWords(query.search);
    const notes = words.length ? await this.notes() : {};
    const matches = snap.transactions.filter(
      (t) =>
        (!query.account || t.accountId === query.account.id) &&
        (!query.category || hasCategory(t, overrides, query.category.id)) &&
        (!since || !isBefore(t.date, since)) &&
        (!words.length || matchesSearch(t, words, snap, overrides, notes[t.transactionId])),
    );

    const groups: TransactionGroup[] = [];
    for (const t of matches) {
      const item = transactionItem(t, snap, overrides);
      const dayLabel = DateLabels.short(t.date);
      const last = groups[groups.length - 1];
      if (last?.dayLabel === dayLabel) {
        groups[groups.length - 1] = { dayLabel, total: last.total + item.amount, items: [...last.items, item] };
      } else {
        groups.push({ dayLabel, total: item.amount, items: [item] });
      }
    }
    return groups;
  }

  async getFilterChoices(kind: FilterKind): Promise<FilterChoice[]> {
    const snap = await this.bankData.load();
    const overrides = await this.overrides();
    switch (kind) {
      case 'account':
        return snap.accounts
          .filter((a) => snap.transactions.some((t) => t.accountId === a.accountId))
          .map((a) => ({ id: a.accountId, label: a.mask ? `${a.name} ••${a.mask}` : a.name }));
      case 'category':
        return ALL_CATEGORIES.filter((c) => snap.transactions.some((t) => hasCategory(t, overrides, c.id))).map((c) => ({
          id: c.id,
          label: c.name,
        }));
      case 'date':
        return Object.entries(DATE_RANGES).map(([id, r]) => ({ id, label: r.label }));
    }
  }

  async getDetail(transactionId: string): Promise<TransactionDetailBundle> {
    const snap = await this.bankData.load();
    const t = find(snap, transactionId);
    const categories = categoriesOf(t, await this.overrides());
    const account = accountIn(snap, t.accountId);
    return {
      transaction: {
        id: t.transactionId,
        title: displayName(t),
        iconKey: categories[0].iconKey,
        amount: signedAmount(t),
        dateLabel: DateLabels.long(t.date),
        accountLabel: account ? `${account.name}${account.mask ? ` ••${account.mask}` : ''}` : 'Linked account',
        statusLabel: t.pending ? 'Pending' : `Posted ${DateLabels.short(t.date)}`,
        merchantLabel: t.name,
        selectedCategoryIds: categories.map((c) => c.id),
        note: (await this.notes())[t.transactionId],
      },
      categories: ALL_CATEGORIES,
    };
  }

  async getCategories() {
    return ALL_CATEGORIES;
  }

  /** Keeps the given order (first = primary), drops duplicates and unknown ids. */
  async setCategories(transactionId: string, categoryIds: string[]) {
    find(await this.bankData.load(), transactionId);
    const known = new Set(ALL_CATEGORIES.map((c) => c.id));
    const ids = [...new Set(categoryIds.filter((id) => known.has(id)))];
    if (!ids.length) throw new AppException('Choose at least one category.');
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to change categories.');
    await this.annotations.setCategoryOverride(userId, transactionId, ids);
  }

  toggledCategories(selected: string[], categoryId: string): string[] | undefined {
    const next = selected.includes(categoryId) ? selected.filter((id) => id !== categoryId) : [...selected, categoryId];
    return next.length ? next : undefined;
  }

  queryForCategory(categoryId?: string): TransactionQuery {
    return categoryId ? withFilter(emptyQuery, 'category', { id: categoryId, label: categoryById(categoryId).name }) : emptyQuery;
  }

  async setNote(transactionId: string, note: string) {
    const userId = this.currentUserId();
    if (userId === undefined) throw new AppException('Sign in to add notes.');
    await this.annotations.setNote(userId, transactionId, note.trim());
  }
}
