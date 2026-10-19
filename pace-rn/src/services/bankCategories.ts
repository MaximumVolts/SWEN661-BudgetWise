import type { BankTransaction } from '../models/bankData';
import type { CategoryInfo } from '../models/transaction';

/** Transaction id → the category ids the user chose, primary first. */
export type CategoryOverrides = Record<string, string[]>;

const category = (id: string, name: string, iconKey: string): CategoryInfo => ({ id, name, iconKey });

/**
 * Pace's categories, mapped from Plaid's personal_finance_category.primary values.
 * BUSINESS RULES: which Plaid categories count as everyday spending (transfers, card payments and
 * income don't, so money moving between your own accounts isn't counted twice).
 */
export const BankCategories = {
  food: category('food', 'Food & drink', 'food'),
  shopping: category('shopping', 'Shopping', 'shopping_bag'),
  transport: category('transport', 'Transportation', 'transit'),
  travel: category('travel', 'Travel', 'car'),
  utilities: category('utilities', 'Rent & utilities', 'utilities'),
  personal: category('personal', 'Personal care', 'fitness'),
  entertainment: category('entertainment', 'Entertainment', 'play'),
  services: category('services', 'Services', 'work'),
  medical: category('medical', 'Medical', 'shield'),
  home: category('home', 'Home', 'home'),
  fees: category('fees', 'Bank fees', 'bank'),
  loans: category('loans', 'Loan & card payments', 'bills'),
  transfers: category('transfers', 'Transfers', 'bank'),
  income: category('income', 'Income', 'payroll'),
  other: category('other', 'Other', 'store'),
};

const C = BankCategories;

export const ALL_CATEGORIES: CategoryInfo[] = [
  C.food, C.shopping, C.transport, C.travel, C.utilities, C.personal, C.entertainment,
  C.services, C.medical, C.home, C.fees, C.loans, C.transfers, C.income, C.other,
];

const BY_PLAID: Record<string, CategoryInfo> = {
  FOOD_AND_DRINK: C.food,
  GENERAL_MERCHANDISE: C.shopping,
  TRANSPORTATION: C.transport,
  TRAVEL: C.travel,
  RENT_AND_UTILITIES: C.utilities,
  PERSONAL_CARE: C.personal,
  ENTERTAINMENT: C.entertainment,
  GENERAL_SERVICES: C.services,
  GOVERNMENT_AND_NON_PROFIT: C.services,
  MEDICAL: C.medical,
  HOME_IMPROVEMENT: C.home,
  BANK_FEES: C.fees,
  LOAN_PAYMENTS: C.loans,
  TRANSFER_OUT: C.transfers,
  TRANSFER_IN: C.income,
  INCOME: C.income,
};

/** Categories that aren't everyday spending. */
const NOT_SPENDING = new Set(['loans', 'transfers', 'income']);

/** Categories a budget can be set for (everyday spending). */
export const SPENDING_CATEGORIES = ALL_CATEGORIES.filter((c) => !NOT_SPENDING.has(c.id));

export const categoryForPlaid = (primary?: string | null) => (primary && BY_PLAID[primary]) || C.other;

export const categoryById = (id: string) => ALL_CATEGORIES.find((c) => c.id === id) ?? C.other;

/** Every category on [t], primary first: the user's choices if they picked any, else Plaid's. */
export function categoriesOf(t: BankTransaction, overrides: CategoryOverrides): CategoryInfo[] {
  const ids = overrides[t.transactionId];
  return ids && ids.length > 0 ? ids.map(categoryById) : [categoryForPlaid(t.categoryPrimary)];
}

/**
 * [t]'s primary category: the one its full amount counts toward in spending, budgets and trends.
 * Any other categories are labels for display and filtering only.
 */
export const primaryCategory = (t: BankTransaction, overrides: CategoryOverrides) => categoriesOf(t, overrides)[0];

/** Whether [t] carries [categoryId] at all (primary or extra), for filtering. */
export const hasCategory = (t: BankTransaction, overrides: CategoryOverrides, categoryId: string) =>
  categoriesOf(t, overrides).some((c) => c.id === categoryId);

/** Money out on everyday spending, judged by the primary category. */
export const isSpending = (t: BankTransaction, overrides: CategoryOverrides) =>
  t.amount > 0 && !NOT_SPENDING.has(primaryCategory(t, overrides).id);
