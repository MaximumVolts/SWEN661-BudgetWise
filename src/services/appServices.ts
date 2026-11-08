import { NO_PLAID_KEYS } from '../models/plaidKeys';
import { type AnnotationRepository, SqliteAnnotationRepository } from '../repositories/annotationRepository';
import { type BankDataRepository, PlaidBankDataRepository } from '../repositories/bankDataRepository';
import { type BudgetRepository, SqliteBudgetRepository } from '../repositories/budgetRepository';
import type { PaceDatabase } from '../repositories/database';
import type { DeviceNotifications } from '../repositories/deviceNotifications';
import { type ExpectedIncomeRepository, SqliteExpectedIncomeRepository } from '../repositories/expectedIncomeRepository';
import { type GoalRepository, SqliteGoalRepository } from '../repositories/goalRepository';
import { type LinkedBankRepository, SqliteLinkedBankRepository } from '../repositories/linkedBankRepository';
import type { PlaidApi } from '../repositories/plaidApi';
import { type PlaidKeyRepository, SqlitePlaidKeyRepository } from '../repositories/plaidKeyRepository';
import { type PreferencesRepository, SqlitePreferencesRepository } from '../repositories/preferencesRepository';
import { type ReportPreferencesRepository, SqliteReportPreferencesRepository } from '../repositories/reportPreferencesRepository';
import { type RecurringExpenseRepository, SqliteRecurringExpenseRepository } from '../repositories/recurringExpenseRepository';
import { type Fetch, SandboxPlaidApi } from '../repositories/sandboxPlaidApi';
import type { SecretVault } from '../repositories/secretVault';
import type { StatementSaver } from '../repositories/statementSaver';
import { SqliteUserAccountRepository, type UserAccountRepository } from '../repositories/userAccountRepository';
import { merge } from '../utils/events';
import { type AccountService, PlaidAccountService } from './accountService';
import { type AuthService, RepositoryAuthService } from './authService';
import { type BankLinkService, PlaidSandboxBankLinkService } from './bankLinkService';
import { BillReminderService } from './billReminderService';
import { type BillService, PlaidBillService } from './billService';
import { type BudgetService, PlaidBudgetService } from './budgetService';
import { type CashFlowService, PlaidCashFlowService } from './cashFlowService';
import { type DashboardService, PlaidDashboardService } from './dashboardService';
import { type GoalService, RepositoryGoalService } from './goalService';
import { type NotificationService, PlaidNotificationService } from './notificationService';
import { DemoOnboardingService, type OnboardingService } from './onboardingService';
import type { PasswordHasher } from './passwordHasher';
import { type ProfileService, RepositoryProfileService } from './profileService';
import { RepositorySettingsService, type SettingsService } from './settingsService';
import { PlaidSpendingService, type SpendingService } from './spendingService';
import { PlaidStatementService, type StatementService } from './statementService';
import { type ComparisonService, PlaidComparisonService } from './comparisonService';
import { PlaidTransactionService, type TransactionService } from './transactionService';
import { PlaidTrendService, type TrendService } from './trendService';

/**
 * Every service the controllers use (the "S" in MVCS). Controllers get them through
 * ServicesContext and only ever see these interfaces, never a repository.
 */
export interface AppServices {
  auth: AuthService;
  onboarding: OnboardingService;
  bankLink: BankLinkService;
  accounts: AccountService;
  dashboard: DashboardService;
  transactions: TransactionService;
  budgets: BudgetService;
  spending: SpendingService;
  bills: BillService;
  goals: GoalService;
  notifications: NotificationService;
  settings: SettingsService;
  profile: ProfileService;
  cashFlow: CashFlowService;
  trends: TrendService;
  statements: StatementService;
  comparison: ComparisonService;
  reminders: BillReminderService;
  /** Stops background work (bank data re-checks) when the app goes away. */
  stop(): void;
}

/**
 * Every data source, by interface (the repository pattern): services depend on these interfaces
 * and this file is the only place that picks the implementations (SQLite, secure store, Plaid sandbox…).
 */
export interface AppRepositories {
  users: UserAccountRepository;
  plaidKeys: PlaidKeyRepository;
  plaid: PlaidApi;
  banks: LinkedBankRepository;
  bankData: BankDataRepository;
  annotations: AnnotationRepository;
  budgets: BudgetRepository;
  recurring: RecurringExpenseRepository;
  incomes: ExpectedIncomeRepository;
  goals: GoalRepository;
  preferences: PreferencesRepository;
  reportPreferences: ReportPreferencesRepository;
  deviceNotifications: DeviceNotifications;
  statementSaver: StatementSaver;
}

export interface AppServicesOptions {
  /** The app's database (expo-sqlite on a phone, SQLite in Electron on desktop); tests pass an in-process one. */
  database: PaceDatabase;
  /** Defaults to Plaid's sandbox with the signed-in user's own keys. Tests pass a fake. */
  plaid?: PlaidApi;
  /** How the sandbox client reaches Plaid (tests replay recorded responses; desktop goes through Electron). */
  fetch?: Fetch;
  /** Where Plaid access tokens are kept (the platform's secure store; see deviceServices). */
  vault: SecretVault;
  hasher?: PasswordHasher;
  deviceNotifications: DeviceNotifications;
  statementSaver: StatementSaver;
  /** Bank data timing (tests shorten the retries). */
  bankDataTiming?: { maxAgeMs?: number; retryEveryMs?: number; maxRetries?: number };
  now?: () => Date;
}

/**
 * The app's repositories. [currentUserId] says who is signed in (it comes from AuthService, which
 * is built from these repositories, so it's read lazily).
 */
export function createRepositories(options: AppServicesOptions, currentUserId: () => string | undefined): AppRepositories {
  const { database, now } = options;
  // Each user's Plaid sandbox keys, entered at sign-up (or on Profile).
  const plaidKeys = new SqlitePlaidKeyRepository(database);
  // One Plaid sandbox client, using the signed-in user's own sandbox keys.
  const plaid =
    options.plaid ??
    new SandboxPlaidApi({
      fetch: options.fetch,
      keys: async () => {
        const userId = currentUserId();
        return (userId === undefined ? undefined : await plaidKeys.load(userId)) ?? NO_PLAID_KEYS;
      },
    });
  const banks = new SqliteLinkedBankRepository(database, options.vault);
  return {
    users: new SqliteUserAccountRepository(database),
    plaidKeys,
    plaid,
    banks,
    // One cached data source shared by every bank feature.
    bankData: new PlaidBankDataRepository({ plaid, banks, currentUserId, now, ...options.bankDataTiming }),
    annotations: new SqliteAnnotationRepository(database),
    budgets: new SqliteBudgetRepository(database),
    recurring: new SqliteRecurringExpenseRepository(database),
    incomes: new SqliteExpectedIncomeRepository(database),
    goals: new SqliteGoalRepository(database),
    preferences: new SqlitePreferencesRepository(database),
    reportPreferences: new SqliteReportPreferencesRepository(database),
    deviceNotifications: options.deviceNotifications,
    statementSaver: options.statementSaver,
  };
}

/**
 * Builds the app's services on its repositories. Everything bank-related reads the user's linked
 * banks live from Plaid's **sandbox**; accounts, budgets, goals and the rest are in the on-device
 * SQLite database; Plaid access tokens are in the secure store. Onboarding options are still demo data.
 */
export function createApp(options: AppServicesOptions): { services: AppServices; repositories: AppRepositories } {
  const { now } = options;
  const currentUserId = () => auth.currentUserId;
  const repos = createRepositories(options, currentUserId);
  const auth = new RepositoryAuthService({ accounts: repos.users, plaidKeys: repos.plaidKeys, hasher: options.hasher, now });
  const profile = new RepositoryProfileService({ accounts: repos.users, plaidKeys: repos.plaidKeys, currentUserId });

  const deps = { bankData: repos.bankData, annotations: repos.annotations, currentUserId, now };
  const bills = new PlaidBillService({ ...deps, recurring: repos.recurring });
  const budgets = new PlaidBudgetService({ ...deps, budgets: repos.budgets });
  const trends = new PlaidTrendService(deps);
  const cashFlow = new PlaidCashFlowService({ ...deps, incomes: repos.incomes });
  const settings = new RepositorySettingsService({
    profile,
    store: repos.preferences,
    banks: repos.banks,
    currentUserId,
    signedInChanges: auth.signedInChanges,
  });

  const bankLink = new PlaidSandboxBankLinkService({ plaid: repos.plaid, banks: repos.banks, currentUserId, now, dataUpdates: repos.bankData.updates });

  const services: AppServices = {
    auth,
    profile,
    onboarding: new DemoOnboardingService(),
    bankLink,
    accounts: new PlaidAccountService(deps),
    dashboard: new PlaidDashboardService({ ...deps, budgets, bills, trends, cashFlow }),
    transactions: new PlaidTransactionService(deps),
    budgets,
    spending: new PlaidSpendingService(deps),
    bills,
    goals: new RepositoryGoalService(repos.goals, currentUserId, { now }),
    notifications: new PlaidNotificationService(bills, budgets, { preferences: () => settings.preferences(), now }),
    settings,
    cashFlow,
    trends,
    statements: new PlaidStatementService({ ...deps, saver: repos.statementSaver }),
    comparison: new PlaidComparisonService({ ...deps, saver: repos.statementSaver, preferences: repos.reportPreferences }),
    // Bill reminders as push notifications: the phone's own on device; recorded in tests.
    reminders: new BillReminderService({
      bills,
      preferences: () => settings.preferences(),
      savePreference: (reminder) => settings.setBillReminder(reminder),
      isSignedIn: () => auth.isSignedIn,
      device: repos.deviceNotifications,
      changes: merge<unknown>(settings.preferenceChanges, bankLink.dataUpdates, bills.changes, auth.signedInChanges),
      now,
    }),
    stop: () => repos.bankData.stopRetrying(),
  };
  return { services, repositories: repos };
}

/** The app's services (see [createApp]). */
export const createAppServices = (options: AppServicesOptions): AppServices => createApp(options).services;

// The platform's own implementations are picked in deviceServices.ts (phone/tablet) and
// deviceServices.web.ts (the Electron desktop app).
