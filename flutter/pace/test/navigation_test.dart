import 'package:flutter/widgets.dart' show RouteInformation;
import 'package:flutter_test/flutter_test.dart'
    show TestWidgetsFlutterBinding, expect, group, isFalse, isNull, isTrue, setUp, test;
import 'package:pace_app/views/navigation/app_modals.dart' show DefaultAppModals;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute, AppRouteName;
import 'package:pace_app/views/navigation/app_route_parser.dart' show AppRouteParser;
import 'package:pace_app/views/navigation/app_router_delegate.dart' show AppRouterDelegate;
import 'package:pace_app/views/navigation/router_app_navigator.dart' show RouterAppNavigator;
import 'package:pace_app/models/navigation.dart' show DeepLinkTarget, FlowStep, TargetKind;

void main() {
  TestWidgetsFlutterBinding.ensureInitialized(); // navigator reads its (absent) context for toasts
  group('AppRoute', () {
    test('round-trips through Uri', () {
      final routes = [
        AppRoute.home,
        AppRoute.transactionDetail('42'),
        AppRoute.budgetCategory('food', periodId: 'oct'),
        AppRoute.billsRecurring,
        AppRoute.billDetail('9'),
        AppRoute.settings,
      ];
      for (final r in routes) {
        expect(AppRoute.tryParse(r.uri), r, reason: '${r.uri}');
      }
    });

    test('static path wins over parameterised sibling', () {
      expect(AppRoute.tryParse(Uri.parse('/bills/recurring'))!.name, AppRouteName.billsRecurring);
      expect(AppRoute.tryParse(Uri.parse('/bills/9'))!.name, AppRouteName.billDetail);
    });

    test('unknown path does not match', () {
      expect(AppRoute.tryParse(Uri.parse('/nope/at/all')), isNull);
    });

    test('query and params are parsed', () {
      final r = AppRoute.tryParse(Uri.parse('/budgets/category/food?period=oct'))!;
      expect(r.params['id'], 'food');
      expect(r.query['period'], 'oct');
    });

    test('deep links get Home underneath; tabs and public routes stand alone', () {
      expect(AppRoute.stackFor(AppRoute.transactionDetail('1')), [AppRoute.home, AppRoute.transactionDetail('1')]);
      expect(AppRoute.stackFor(AppRoute.spending), [AppRoute.spending]);
      expect(AppRoute.stackFor(AppRoute.signIn), [AppRoute.signIn]);
    });
  });

  group('AppRouteParser', () {
    const parser = AppRouteParser(fallbackStack: [AppRoute.home]);

    test('parses deep link into a stack', () async {
      final stack = await parser.parseRouteInformation(RouteInformation(uri: Uri.parse('/transactions/7')));
      expect(stack, [AppRoute.home, AppRoute.transactionDetail('7')]);
    });

    test('falls back for "/" and unknown URLs', () async {
      expect(await parser.parseRouteInformation(RouteInformation(uri: Uri.parse('/'))), [AppRoute.home]);
      expect(await parser.parseRouteInformation(RouteInformation(uri: Uri.parse('/zzz'))), [AppRoute.home]);
    });

    test('restores URL from stack', () {
      final info = parser.restoreRouteInformation([AppRoute.home, AppRoute.transactionDetail('7')]);
      expect(info!.uri.toString(), '/transactions/7');
    });
  });

  group('AppRouterDelegate', () {
    late AppRouterDelegate d;
    setUp(() => d = AppRouterDelegate(initialStack: [AppRoute.home]));

    test('tabs sit on top of Home and replace each other', () {
      d.openTab(AppRoute.transactions);
      expect(d.stack, [AppRoute.home, AppRoute.transactions]);
      d.openTab(AppRoute.spending);
      expect(d.stack, [AppRoute.home, AppRoute.spending]);
      d.openTab(AppRoute.home);
      expect(d.stack, [AppRoute.home]);
    });

    test('push / pop and double-tap protection', () {
      d.openTab(AppRoute.transactions);
      d.push(AppRoute.transactionDetail('1'));
      d.push(AppRoute.transactionDetail('1')); // ignored
      expect(d.stack.length, 3);
      expect(d.pop(), isTrue);
      expect(d.current, AppRoute.transactions);
    });

    test('cannot pop the last route', () {
      expect(d.pop(), isFalse);
      expect(d.stack, [AppRoute.home]);
    });

    test('guard redirects signed-out users to sign-in', () {
      final guarded = AppRouterDelegate(
        initialStack: [AppRoute.home],
        guard: (t) => t.isPublic ? null : AppRoute.signIn,
      );
      expect(guarded.stack, [AppRoute.signIn]);
      guarded.push(AppRoute.settings);
      expect(guarded.current, AppRoute.signIn);
    });

    test('revalidate kicks the user out when the session ends', () {
      var signedIn = true;
      final g = AppRouterDelegate(
        initialStack: [AppRoute.home],
        guard: (t) => !signedIn && !t.isPublic ? AppRoute.signIn : null,
      );
      g.push(AppRoute.settings);
      signedIn = false;
      g.revalidate();
      expect(g.stack, [AppRoute.signIn]);
    });

    test('setNewRoutePath applies a deep link', () async {
      await d.setNewRoutePath(AppRoute.stackFor(AppRoute.budgetCategory('food')));
      expect(d.stack, [AppRoute.home, AppRoute.budgetCategory('food')]);
    });
  });

  group('RouterAppNavigator', () {
    late AppRouterDelegate d;
    late RouterAppNavigator nav;
    setUp(() {
      d = AppRouterDelegate(initialStack: [AppRoute.home]);
      nav = RouterAppNavigator(d, const DefaultAppModals());
    });

    test('bottom nav indices map to tabs', () {
      nav.openTab(1);
      expect(d.current, AppRoute.transactions);
      nav.openTab(4);
      expect(d.current, AppRoute.bills);
      nav.openTab(0);
      expect(d.stack, [AppRoute.home]);
    });

    test('Bills tab switch swaps between Upcoming and Recurring', () {
      nav.openBills(tab: 1);
      expect(d.current, AppRoute.billsRecurring);
      nav.openBills(tab: 0);
      expect(d.current, AppRoute.bills);
      expect(d.stack.length, 2);
    });

    test('dashboard tools resolve to their screens', () {
      nav.openTool('recurring');
      expect(d.current, AppRoute.billsRecurring);
      nav.openTool('savings-goals');
      expect(d.current, AppRoute.goals);
      nav.openTool('cash-flow');
      expect(d.current, AppRoute.cashFlow);
      final before = d.stack;
      nav.openTool('mystery'); // no designed page: shows a toast instead of navigating
      expect(d.stack, before);
    });

    test('service-provided targets resolve to routes', () {
      nav.openTarget(const DeepLinkTarget(TargetKind.bill, 'b1'));
      expect(d.current, AppRoute.billDetail('b1'));
      nav.openTarget(const DeepLinkTarget(TargetKind.budgetCategory, 'food'));
      expect(d.current, AppRoute.budgetCategory('food'));
      nav.openTarget(const DeepLinkTarget(TargetKind.budgets));
      expect(d.current, AppRoute.budgets);
    });

    test('flow steps: connect-bank is pushed from onboarding, otherwise stack resets', () {
      nav.openFlowStep(FlowStep.onboarding);
      expect(d.stack, [AppRoute.onboarding]);
      nav.openFlowStep(FlowStep.connectBank);
      expect(d.stack, [AppRoute.onboarding, AppRoute.connectBank]);
      nav.openFlowStep(FlowStep.home);
      expect(d.stack, [AppRoute.home]);
    });

    test('sign-out resets to sign-in', () {
      nav.openSettings();
      nav.openSignIn();
      expect(d.stack, [AppRoute.signIn]);
    });
  });
}
