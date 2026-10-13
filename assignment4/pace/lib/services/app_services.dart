import 'account_service.dart' show AccountService;
import 'auth_service.dart' show AuthService;
import 'bank_link_service.dart' show BankLinkService;
import 'bill_service.dart' show BillService;
import 'budget_service.dart' show BudgetService;
import 'cash_flow_service.dart' show CashFlowService;
import 'dashboard_service.dart' show DashboardService;
import 'goal_service.dart' show GoalService;
import 'notification_service.dart' show NotificationService;
import 'onboarding_service.dart' show OnboardingService;
import 'profile_service.dart' show ProfileService;
import 'settings_service.dart' show SettingsService;
import 'spending_service.dart' show SpendingService;
import 'statement_service.dart' show StatementService;
import 'transaction_service.dart' show TransactionService;
import 'trend_service.dart' show TrendService;

/// The concrete service implementations you provide (REST, Plaid, Firebase, fakes for tests…).
class AppServices {
  final AuthService auth;
  final OnboardingService onboarding;
  final BankLinkService bankLink;
  final AccountService accounts;
  final DashboardService dashboard;
  final TransactionService transactions;
  final BudgetService budgets;
  final SpendingService spending;
  final BillService bills;
  final GoalService goals;
  final NotificationService notifications;
  final SettingsService settings;
  final ProfileService profile;
  final CashFlowService cashFlow;
  final TrendService trends;
  final StatementService statements;

  const AppServices({
    required this.auth,
    required this.onboarding,
    required this.bankLink,
    required this.accounts,
    required this.dashboard,
    required this.transactions,
    required this.budgets,
    required this.spending,
    required this.bills,
    required this.goals,
    required this.notifications,
    required this.settings,
    required this.profile,
    required this.cashFlow,
    required this.trends,
    required this.statements,
  });
}
