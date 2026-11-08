import { type AppSection, TOOL_SECTIONS } from '../models/navigation';
import { type Destination, matchDestinations } from '../models/shortcuts';
import { useAppNavigator, useCurrentPage, useCurrentSection } from '../navigation/appNavigator';
import { useServices } from '../state/ServicesContext';
import { useShortcutsHelp } from '../state/ShortcutsContext';
import { useAsyncData } from './base/useAsyncData';

/** Each page's name in the top bar's breadcrumb, by its path's first segment. */
const PAGE_TITLES: Record<string, string> = {
  '': 'Home',
  accounts: 'Accounts',
  'add-account': 'Add account',
  transactions: 'Transactions',
  transaction: 'Transaction',
  spending: 'Spending',
  budgets: 'Budgets',
  'budget-form': 'Budget',
  'manage-budgets': 'Budget categories',
  bills: 'Bills',
  bill: 'Bill',
  'bill-form': 'Bill',
  comparison: 'Monthly Comparison',
  goals: 'Savings Goals',
  'goal-form': 'New goal',
  'cash-flow': 'Cash Flow Projection',
  'expected-income-form': 'Expected income',
  trends: 'Plaid TrendScore',
  notifications: 'Notifications',
  settings: 'Settings',
  profile: 'Profile',
  statements: 'Statements',
};

/** Pages named after the category in their path. */
const CATEGORY_PAGES = new Set(['budget-category', 'spending-category']);

/**
 * The desktop app's frame around every signed-in page: the sidebar (sections, unread
 * notifications, who is signed in) and the top bar (breadcrumb, search, notifications).
 */
export function useShellController() {
  const s = useServices();
  const nav = useAppNavigator();
  const section = useCurrentSection();
  const { page, id } = useCurrentPage();
  const [, setHelpOpen] = useShortcutsHelp();
  const profile = useAsyncData(() => s.profile.load(), [s], [s.profile.changes]);
  const categories = useAsyncData(() => s.transactions.getCategories(), [s]);
  // Re-counted on every page change too, so it drops after visiting Notifications.
  const unread = useAsyncData(
    async () => (await s.notifications.getNotifications(0)).items.filter((n) => n.isNew).length,
    [s, page],
    [s.bankLink.dataUpdates, s.bills.changes, s.budgets.changes],
  );

  const title = CATEGORY_PAGES.has(page)
    ? (categories.state.data?.find((c) => c.id === id)?.name ?? (page === 'budget-category' ? 'Budget' : 'Spending'))
    : (PAGE_TITLES[page] ?? '');

  return {
    section,
    /** Breadcrumb: the group ("Overview" or "Tools") and the page. */
    crumbs: { group: TOOL_SECTIONS.includes(section) ? 'Tools' : 'Overview', title },
    profile: profile.state.data,
    unreadCount: unread.state.data ?? 0,
    open: (target: AppSection) => nav.openSection(target),
    openHome: () => nav.openSection('home'),
    openProfile: nav.openProfile,
    openNotifications: nav.openNotifications,
    openShortcuts: () => setHelpOpen(true),
    /** Searches transactions (merchant, category, account, note or amount). */
    search: (text: string) => {
      const query = text.trim();
      if (query) nav.openTransactions({ search: query });
    },
    /** Pages to offer under the search box for [text] (quick destinations). */
    destinations: (text: string) => matchDestinations(text),
    openDestination: (d: Destination) => {
      switch (d) {
        case 'accounts':
          return nav.openAccounts();
        case 'profile':
          return nav.openProfile();
        case 'statements':
          return nav.openStatements();
        default:
          return nav.openSection(d);
      }
    },
  };
}

export type ShellController = ReturnType<typeof useShellController>;
