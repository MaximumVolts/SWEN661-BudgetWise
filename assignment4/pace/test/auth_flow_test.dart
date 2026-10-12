import 'package:flutter/material.dart' show SnackBar;
import 'package:flutter_test/flutter_test.dart'
    show expect, find, findsOneWidget, group, pumpEventQueue, setUp, tearDown, test, testWidgets;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;

void main() {
  group('flow', () {
    late AppRouter router;
    setUp(() => router = AppRouter.create(services: demoServices(), initialStack: const [AppRoute.signIn]));
    tearDown(() => router.dispose());

    test('signing in goes straight to Home', () async {
      await router.dependencies.signIn().signIn('a@b.co', 'pw');
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.home]);
    });

    test('Create account starts onboarding', () async {
      await router.dependencies.signIn().createAccount();
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.onboarding]);
    });
  });

  test('social sign-in route round-trips through Uri', () {
    expect(AppRoute.tryParse(Uri.parse('/sign-in/apple')), AppRoute.socialSignIn('apple'));
    expect(AppRoute.tryParse(Uri.parse('/sign-in')), AppRoute.signIn);
  });

  for (final (button, message) in [
    // Tests run without client IDs, so the real Google service reports that it isn't configured.
    ('Continue with Google', 'Google sign-in needs OAuth client IDs: add them to config/google_sign_in.json '
        'and run with --dart-define-from-file=config/google_sign_in.json (see README).'),
    ('Continue with Apple', 'Sign in with Apple is not implemented yet.'),
    ('Forgot password?', 'Password reset is not implemented yet.'),
  ]) {
    testWidgets('"$button" shows "$message" and stays on sign-in', (tester) async {
      final router = AppRouter.create(services: demoServices());
      await tester.pumpWidget(PaceApp(router: router));
      await tester.pumpAndSettle();
      final target = find.textContaining(button.replaceAll('?', ''));
      await tester.ensureVisible(target);
      await tester.pumpAndSettle();
      await tester.tap(target);
      await tester.pump();
      expect(find.widgetWithText(SnackBar, message), findsOneWidget);
      expect(router.delegate.stack, [AppRoute.signIn]);
      router.dispose();
    });
  }
}
