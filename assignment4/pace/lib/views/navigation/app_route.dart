import 'package:flutter/foundation.dart' show immutable;

/// Every destination in the app. [pattern] is the URL path (":x" = path parameter).
/// Order matters for matching: static paths must come before parameterised siblings.
enum AppRouteName {
  // auth / onboarding
  signIn('/sign-in'),
  createAccount('/create-account'),
  forgotPassword('/forgot-password'),
  socialSignIn('/sign-in/:provider'),
  onboarding('/onboarding'),
  connectBank('/connect-bank'),
  // tab roots
  home('/home'),
  transactions('/transactions'),
  spending('/spending'),
  budgets('/budgets'),
  billsRecurring('/bills/recurring'),
  bills('/bills'),
  // details
  transactionDetail('/transactions/:id'),
  spendingCategory('/spending/category/:id'),
  budgetCategory('/budgets/category/:id'),
  billDetail('/bills/:id'),
  accounts('/accounts'),
  accountDetail('/accounts/:id'),
  notifications('/notifications'),
  goals('/goals'),
  cashFlow('/cash-flow'),
  trends('/trends'),
  trendDetail('/trends/:id'),
  tool('/tools/:id'),
  // settings
  settings('/settings'),
  profile('/settings/profile'),
  budgetCategoriesSettings('/settings/budget-categories'),
  statementExport('/settings/statements'),
  passwordSecurity('/settings/security');

  final String pattern;
  const AppRouteName(this.pattern);

  List<String> get segments => pattern.split('/').where((s) => s.isNotEmpty).toList();
}

/// A location in the app: a [name] plus path [params] and [query] parameters.
/// Round-trips to/from a [Uri], so it works for deep links and the web URL bar.
@immutable
class AppRoute {
  final AppRouteName name;
  final Map<String, String> params;
  final Map<String, String> query;
  const AppRoute(this.name, {this.params = const {}, this.query = const {}});

  // Parameterless routes
  static const signIn = AppRoute(AppRouteName.signIn);
  static const createAccount = AppRoute(AppRouteName.createAccount);
  static const forgotPassword = AppRoute(AppRouteName.forgotPassword);
  static const onboarding = AppRoute(AppRouteName.onboarding);
  static const connectBank = AppRoute(AppRouteName.connectBank);
  static const home = AppRoute(AppRouteName.home);
  static const transactions = AppRoute(AppRouteName.transactions);
  static const spending = AppRoute(AppRouteName.spending);
  static const budgets = AppRoute(AppRouteName.budgets);
  static const bills = AppRoute(AppRouteName.bills);
  static const billsRecurring = AppRoute(AppRouteName.billsRecurring);
  static const accounts = AppRoute(AppRouteName.accounts);
  static const notifications = AppRoute(AppRouteName.notifications);
  static const goals = AppRoute(AppRouteName.goals);
  static const cashFlow = AppRoute(AppRouteName.cashFlow);
  static const trends = AppRoute(AppRouteName.trends);
  static const settings = AppRoute(AppRouteName.settings);
  static const profile = AppRoute(AppRouteName.profile);
  static const budgetCategoriesSettings = AppRoute(AppRouteName.budgetCategoriesSettings);
  static const statementExport = AppRoute(AppRouteName.statementExport);
  static const passwordSecurity = AppRoute(AppRouteName.passwordSecurity);

  // Parameterised routes
  factory AppRoute.transactionDetail(String id) => AppRoute(AppRouteName.transactionDetail, params: {'id': id});
  factory AppRoute.spendingCategory(String id) => AppRoute(AppRouteName.spendingCategory, params: {'id': id});
  factory AppRoute.budgetCategory(String id, {String? periodId}) =>
      AppRoute(AppRouteName.budgetCategory, params: {'id': id}, query: {if (periodId != null) 'period': periodId});
  factory AppRoute.billDetail(String id) => AppRoute(AppRouteName.billDetail, params: {'id': id});
  factory AppRoute.accountDetail(String id) => AppRoute(AppRouteName.accountDetail, params: {'id': id});
  factory AppRoute.trendDetail(String id) => AppRoute(AppRouteName.trendDetail, params: {'id': id});
  factory AppRoute.tool(String id) => AppRoute(AppRouteName.tool, params: {'id': id});
  /// [provider]: 'google' or 'apple'.
  factory AppRoute.socialSignIn(String provider) => AppRoute(AppRouteName.socialSignIn, params: {'provider': provider});

  /// Bottom-nav order: Home, Transactions, Spending, Budgets, Bills.
  static const tabs = <AppRoute>[home, transactions, spending, budgets, bills];
  static AppRoute forTab(int index) => tabs[index];

  /// Index in the bottom navigation, or null if this isn't a tab root.
  int? get tabIndex => switch (name) {
        AppRouteName.home => 0,
        AppRouteName.transactions => 1,
        AppRouteName.spending => 2,
        AppRouteName.budgets => 3,
        AppRouteName.bills || AppRouteName.billsRecurring => 4,
        _ => null,
      };
  bool get isTabRoot => tabIndex != null;

  /// Routes reachable while signed out.
  bool get isPublic =>
      name == AppRouteName.signIn ||
      name == AppRouteName.createAccount ||
      name == AppRouteName.forgotPassword ||
      name == AppRouteName.socialSignIn;

  Uri get uri {
    final segs = [
      for (final s in name.segments) s.startsWith(':') ? (params[s.substring(1)] ?? '') : s,
    ];
    return Uri(pathSegments: segs, queryParameters: query.isEmpty ? null : query);
  }

  /// Matches a URI against the route table. Returns null if nothing matches.
  static AppRoute? tryParse(Uri uri) {
    final segs = uri.pathSegments.where((s) => s.isNotEmpty).toList();
    for (final name in AppRouteName.values) {
      final pat = name.segments;
      if (pat.length != segs.length) continue;
      final params = <String, String>{};
      var ok = true;
      for (var i = 0; i < pat.length && ok; i++) {
        if (pat[i].startsWith(':')) {
          params[pat[i].substring(1)] = segs[i];
        } else {
          ok = pat[i] == segs[i];
        }
      }
      if (ok) return AppRoute(name, params: params, query: uri.queryParameters);
    }
    return null;
  }

  /// Back stack to build when the app is opened directly at [route] (deep link / web URL):
  /// detail screens get Home underneath so "back" has somewhere to go.
  static List<AppRoute> stackFor(AppRoute route) =>
      (route.isTabRoot || route.isPublic || route.name == AppRouteName.onboarding || route.name == AppRouteName.connectBank)
          ? [route]
          : [home, route];

  @override
  bool operator ==(Object other) => other is AppRoute && other.uri == uri;
  @override
  int get hashCode => uri.hashCode;
  @override
  String toString() => 'AppRoute($uri)';
}
