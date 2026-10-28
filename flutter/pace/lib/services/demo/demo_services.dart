// Builds the app's services. Bank features use Plaid's *sandbox*; onboarding options are still
// demo data. Nothing in lib/ imports this file except main.dart. Replace
// demoServices() with your own composition (e.g. a real backend) when one exists.
import '../../models/navigation.dart' show FlowStep;
import '../../models/onboarding.dart' show IncomeOption, OnboardingOptions, PriorityOption;
import '../../repositories/bank_data_repository.dart' show PlaidBankDataRepository;
import '../../repositories/budget_repository.dart' show BudgetRepository, InMemoryBudgetRepository;
import '../../repositories/device_linked_bank_repository.dart' show DeviceLinkedBankRepository;
import '../../repositories/goal_repository.dart' show InMemoryGoalRepository;
import '../../repositories/device_notifications.dart' show DeviceNotifications, InMemoryDeviceNotifications, LocalDeviceNotifications;
import '../../repositories/expected_income_repository.dart' show InMemoryExpectedIncomeRepository;
import '../../repositories/sqlite_expected_income_repository.dart' show SqliteExpectedIncomeRepository;
import '../../repositories/sqlite_goal_repository.dart' show SqliteGoalRepository;
import '../../repositories/linked_bank_repository.dart' show LinkedBankRepository;
import '../../repositories/pace_database.dart' show PaceDatabase;
import '../../models/plaid_keys.dart' show PlaidKeys;
import '../../repositories/plaid_key_repository.dart' show InMemoryPlaidKeyRepository, PlaidKeyRepository;
import '../../repositories/sqlite_plaid_key_repository.dart' show SqlitePlaidKeyRepository;
import '../../repositories/preferences_repository.dart' show InMemoryPreferencesRepository, PreferencesRepository;
import '../../repositories/sqlite_budget_repository.dart' show SqliteBudgetRepository;
import '../../repositories/sqlite_preferences_repository.dart' show SqlitePreferencesRepository;
import '../../repositories/sqlite_recurring_expense_repository.dart' show SqliteRecurringExpenseRepository;
import '../../repositories/recurring_expense_repository.dart' show InMemoryRecurringExpenseRepository, RecurringExpenseRepository;
import '../../repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import '../../repositories/statement_saver.dart' show FilePickerStatementSaver, StatementSaver;
import '../../repositories/transaction_annotation_repository.dart' show InMemoryTransactionAnnotationRepository;
import '../../repositories/user_account_repository.dart' show UserAccountRepository;
import '../app_services.dart' show AppServices;
import '../../repositories/google_account_repository.dart' show GoogleAccountRepository;
import '../../repositories/google_sign_in_account_repository.dart' show GoogleSignInAccountRepository;
import '../onboarding_service.dart' show OnboardingService;
import '../password_hasher.dart' show PasswordHasher;
import '../plaid_account_service.dart' show PlaidAccountService;
import '../../repositories/plaid_api.dart' show PlaidApi;
import '../bill_reminder_service.dart' show BillReminderService;
import '../plaid_bill_service.dart' show PlaidBillService;
import '../plaid_budget_service.dart' show PlaidBudgetService;
import '../plaid_cash_flow_service.dart' show PlaidCashFlowService;
import '../plaid_dashboard_service.dart' show PlaidDashboardService;
import '../plaid_notification_service.dart' show PlaidNotificationService;
import '../plaid_sandbox_bank_link_service.dart' show PlaidSandboxBankLinkService;
import '../plaid_spending_service.dart' show PlaidSpendingService;
import '../plaid_statement_service.dart' show PlaidStatementService;
import '../plaid_transaction_service.dart' show PlaidTransactionService;
import '../plaid_trend_service.dart' show PlaidTrendService;
import '../repository_auth_service.dart' show RepositoryAuthService;
import '../repository_goal_service.dart' show RepositoryGoalService;
import '../repository_profile_service.dart' show RepositoryProfileService;
import '../repository_settings_service.dart' show RepositorySettingsService;
import '../../repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;

/// The app's services. Everything bank-related reads the user's linked banks live from Plaid's
/// *sandbox* (balances, transactions, recurring payments); accounts are in the on-device SQLite
/// database; linked banks are stored on this device. Onboarding options and the Settings toggles
/// are still demo data. Tests pass in-memory / fake / faster implementations and a fixed clock.
AppServices demoServices({
  UserAccountRepository? accounts,
  GoogleAccountRepository? google,
  PasswordHasher? hasher,
  PlaidApi? plaid,
  LinkedBankRepository? banks,
  BudgetRepository? budgetStore,
  PreferencesRepository? preferencesStore,
  StatementSaver? statementSaver,
  RecurringExpenseRepository? recurringStore,
  DeviceNotifications? deviceNotifications,
  PlaidKeyRepository? plaidKeyStore,
  DateTime Function()? now,
}) {
  // One repository (the users table) shared by sign-in and the profile.
  // One on-device SQLite database for accounts and budgets.
  final database = PaceDatabase();
  final users = accounts ?? SqliteUserAccountRepository(database);
  // Budgets live with accounts: on device by default; in memory when accounts are (tests).
  final budgetLimits = budgetStore ?? (accounts == null ? SqliteBudgetRepository(database) : InMemoryBudgetRepository());
  final preferences = preferencesStore ?? (accounts == null ? SqlitePreferencesRepository(database) : InMemoryPreferencesRepository());
  final recurring = recurringStore ?? (accounts == null ? SqliteRecurringExpenseRepository(database) : InMemoryRecurringExpenseRepository());
  // Each user's Plaid sandbox keys, entered at sign-up (or on Profile).
  final plaidKeys = plaidKeyStore ?? (accounts == null ? SqlitePlaidKeyRepository(database) : InMemoryPlaidKeyRepository());
  final auth = RepositoryAuthService(
    accounts: users,
    google: google ?? GoogleSignInAccountRepository(),
    hasher: hasher ?? const PasswordHasher(),
    plaidKeys: plaidKeys,
  );
  String? currentUserId() => auth.currentAccount?.id;
  final profile = RepositoryProfileService(accounts: users, plaidKeys: plaidKeys, currentUserId: currentUserId);

  // Bank data: one Plaid sandbox client and one cached data source shared by every bank feature.
  // Plaid calls use the signed-in user's own sandbox keys.
  Future<PlaidKeys> currentPlaidKeys() async {
    final userId = currentUserId();
    return (userId == null ? null : await plaidKeys.load(userId)) ?? PlaidKeys.none;
  }

  final plaidApi = plaid ?? SandboxPlaidApi(keys: currentPlaidKeys);
  final linkedBanks = banks ?? DeviceLinkedBankRepository();
  final bankData = PlaidBankDataRepository(plaid: plaidApi, banks: linkedBanks, currentUserId: currentUserId, now: now);
  final notes = InMemoryTransactionAnnotationRepository();
  final bills = PlaidBillService(bankData, notes, recurring: recurring, currentUserId: currentUserId, now: now);
  final budgets = PlaidBudgetService(bankData, notes, budgets: budgetLimits, currentUserId: currentUserId, now: now);
  final trends = PlaidTrendService(bankData, notes, now: now);
  // One-off income the user expects lives with accounts: on device by default, in memory in tests.
  final incomes = accounts == null ? SqliteExpectedIncomeRepository(database) : InMemoryExpectedIncomeRepository();
  final cashFlow = PlaidCashFlowService(bankData, notes, incomes: incomes, currentUserId: currentUserId, now: now);
  final settings = RepositorySettingsService(
    profile: profile,
    store: preferences,
    banks: linkedBanks,
    currentUserId: currentUserId,
    signedInChanges: auth.signedInChanges,
  );
  // Bill reminders as push notifications: the phone's own on device; recorded in tests.
  final reminders = BillReminderService(
    bills: bills,
    preferences: settings.preferences,
    isSignedIn: () => auth.isSignedIn,
    device: deviceNotifications ?? (accounts == null ? LocalDeviceNotifications() : InMemoryDeviceNotifications()),
    now: now,
  );

  return AppServices(
    profile: profile,
    auth: auth,
    onboarding: _DemoOnboarding(),
    bankLink: PlaidSandboxBankLinkService(
        plaid: plaidApi, banks: linkedBanks, currentUserId: currentUserId, now: now, dataUpdates: bankData.updates),
    accounts: PlaidAccountService(bankData, now: now),
    dashboard: PlaidDashboardService(bankData, notes, budgets: budgets, bills: bills, trends: trends, cashFlow: cashFlow, now: now),
    transactions: PlaidTransactionService(bankData, notes, now: now),
    budgets: budgets,
    spending: PlaidSpendingService(bankData, notes, now: now),
    bills: bills,
    // Goals live with accounts: on device by default; in memory when accounts are (tests).
    goals: RepositoryGoalService(
        accounts == null ? SqliteGoalRepository(database, currentUserId: currentUserId) : InMemoryGoalRepository(),
        now: now),
    notifications: PlaidNotificationService(bills, budgets, preferences: settings.preferences, now: now),
    settings: settings,
    cashFlow: cashFlow,
    trends: trends,
    statements: PlaidStatementService(bankData, notes, saver: statementSaver ?? const FilePickerStatementSaver(), now: now),
    reminders: reminders,
  );
}

class _DemoOnboarding implements OnboardingService {
  @override
  Future<OnboardingOptions> loadOptions() async => const OnboardingOptions(
        priorities: [
          PriorityOption(id: 'spend', label: 'See where my\nmoney goes'),
          PriorityOption(id: 'bills', label: 'Stay on top of bills'),
          PriorityOption(id: 'budget', label: 'Stick to a budget'),
          PriorityOption(id: 'subs', label: 'Track subscriptions'),
          PriorityOption(id: 'goal', label: 'Save for a goal'),
        ],
        incomeOptions: [
          IncomeOption(id: 'steady', title: 'Steady paycheck', subtitle: 'Same amount on a regular schedule'),
          IncomeOption(id: 'variable', title: 'Changes month to month', subtitle: 'Freelance, tips or variable pay'),
        ],
      );
  @override
  Future<FlowStep> savePreferences({required Set<String> priorityIds, required String? incomeId}) async {
    // Onboarding only follows account creation, so the next step is always linking a bank.
    return FlowStep.connectBank;
  }
}


