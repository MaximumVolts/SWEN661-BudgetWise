import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import type { DeepLinkTarget } from '../models/navigation';

/**
 * Navigation as a service, so controllers say *where to go* without knowing routes (like Flutter's
 * AppNavigator). Only this file knows the paths in src/app; views never navigate themselves.
 */
export interface AppNavigator {
  /** Back to the previous screen, or Home when there's nothing behind this one (e.g. opened from a link). */
  back(): void;

  // Auth / onboarding
  openCreateAccount(): void;
  openForgotPassword(): void;
  /** Pushed on top of onboarding, so Back returns there. */
  openConnectBank(): void;

  // Tabs
  openTransactions(filter?: { category?: string }): void;
  openBudgets(): void;
  /** Bills, on the Upcoming or Recurring tab. */
  openBills(view?: 'upcoming' | 'recurring'): void;
  /** Switches the tab Bills shows, without adding to the back stack. */
  showBillsView(view: 'upcoming' | 'recurring'): void;

  // Details & forms
  openTransaction(id: string): void;
  openSpendingCategory(id: string, rangeIndex: number): void;
  openBudgetCategory(id: string, periodId?: string): void;
  /** The budget form: a new budget, or the one for [categoryId]. */
  openBudgetForm(categoryId?: string): void;
  openManageBudgets(): void;
  openBill(id: string): void;
  /** The bill form: a new bill or subscription, or edit [id]. */
  openBillForm(id?: string): void;
  openAccounts(): void;
  openAddAccount(): void;
  openNotifications(): void;
  openGoals(): void;
  openGoalForm(): void;
  openCashFlow(): void;
  openExpectedIncomeForm(): void;
  openTrends(): void;
  openSettings(): void;
  openProfile(): void;
  openStatements(): void;
  /** A dashboard "more tools" entry. */
  openTool(toolId: string): void;
  /** Whatever a service-provided target points at. The decision lives in services; this maps it to a route. */
  openTarget(target: DeepLinkTarget): void;
}

/** The app's navigator, on Expo Router. */
export function useAppNavigator(): AppNavigator {
  const router = useRouter();
  return useMemo<AppNavigator>(() => {
    const nav: AppNavigator = {
      back: () => (router.canGoBack() ? router.back() : router.replace('/')),

      openCreateAccount: () => router.push('/create-account'),
      openForgotPassword: () => router.push('/forgot-password'),
      openConnectBank: () => router.push('/connect-bank'),

      openTransactions: (filter) =>
        router.navigate(filter?.category ? { pathname: '/transactions', params: { category: filter.category } } : '/transactions'),
      openBudgets: () => router.navigate('/budgets'),
      openBills: (view) => router.navigate(view ? { pathname: '/bills', params: { view } } : '/bills'),
      showBillsView: (view) => router.setParams({ view }),

      openTransaction: (id) => router.push({ pathname: '/transaction/[id]', params: { id } }),
      openSpendingCategory: (id, rangeIndex) => router.push({ pathname: '/spending-category/[id]', params: { id, range: String(rangeIndex) } }),
      openBudgetCategory: (id, periodId) =>
        router.push({ pathname: '/budget-category/[id]', params: periodId ? { id, period: periodId } : { id } }),
      openBudgetForm: (categoryId) => router.push(categoryId ? { pathname: '/budget-form', params: { id: categoryId } } : '/budget-form'),
      openManageBudgets: () => router.push('/manage-budgets'),
      openBill: (id) => router.push({ pathname: '/bill/[id]', params: { id } }),
      openBillForm: (id) => router.push(id ? { pathname: '/bill-form', params: { id } } : '/bill-form'),
      openAccounts: () => router.push('/accounts'),
      openAddAccount: () => router.push('/add-account'),
      openNotifications: () => router.push('/notifications'),
      openGoals: () => router.push('/goals'),
      openGoalForm: () => router.push('/goal-form'),
      openCashFlow: () => router.push('/cash-flow'),
      openExpectedIncomeForm: () => router.push('/expected-income-form'),
      openTrends: () => router.push('/trends'),
      openSettings: () => router.push('/settings'),
      openProfile: () => router.push('/profile'),
      openStatements: () => router.push('/statements'),

      openTool: (toolId) => {
        switch (toolId) {
          case 'recurring':
          case 'subscriptions':
            return nav.openBills('recurring');
          case 'savings-goals':
            return nav.openGoals();
          case 'cash-flow':
            return nav.openCashFlow();
        }
      },
      openTarget: (t) => {
        switch (t.kind) {
          case 'bill':
            return nav.openBill(t.id!);
          case 'budgetCategory':
            return nav.openBudgetCategory(t.id!);
          case 'goal':
            return nav.openGoals();
          case 'transaction':
            return nav.openTransaction(t.id!);
          case 'trend':
            return nav.openTrends();
          case 'account':
            return nav.openAccounts();
          case 'budgets':
            return nav.openBudgets();
          case 'bills':
            return nav.openBills();
        }
      },
    };
    return nav;
  }, [router]);
}
