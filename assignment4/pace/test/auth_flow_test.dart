import 'package:flutter/material.dart' show MaterialApp;
import 'package:flutter_test/flutter_test.dart'
    show expect, find, findsNothing, findsOneWidget, group, pumpEventQueue, setUp, tearDown, test, testWidgets;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/screens/reset_password_screen.dart' show ResetPasswordScreen;
import 'package:pace_app/views/screens/sign_in_screen.dart' show SignInScreen;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;

import 'helpers.dart' show testPlaidClientId, testPlaidSecret;

void main() {
  group('flow', () {
    late AppRouter router;
    setUp(() => router = AppRouter.create(
          services: demoServices(accounts: InMemoryUserAccountRepository(), hasher: const PasswordHasher(iterations: 1000)),
          initialStack: const [AppRoute.signIn],
        ));
    tearDown(() => router.dispose());

    test('"Create account" opens the create-account form', () {
      router.dependencies.signIn().createAccount();
      expect(router.delegate.stack, [AppRoute.signIn, AppRoute.createAccount]);
    });

    test('creating an account starts onboarding; signing in later goes straight to Home', () async {
      await router.dependencies
          .createAccount()
          .submitAccount(
            name: 'Ada',
            username: 'ada',
            password: 'secret123',
            confirmPassword: 'secret123',
            securityQuestion: 'What was the name of your first pet?',
            securityAnswer: 'Rex',
            plaidClientId: testPlaidClientId,
            plaidSecret: testPlaidSecret,
          );
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.onboarding]);

      await router.dependencies.settingsScreen().signOut();
      await pumpEventQueue();
      await router.dependencies.signIn().signIn('ada', 'secret123');
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.home]);
    });
  });

  test('social sign-in route round-trips through Uri', () {
    expect(AppRoute.tryParse(Uri.parse('/sign-in/apple')), AppRoute.socialSignIn('apple'));
    expect(AppRoute.tryParse(Uri.parse('/sign-in')), AppRoute.signIn);
  });

  testWidgets('Google / Apple buttons are hidden on the sign-in screen', (tester) async {
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(find.text('Continue with Google'), findsNothing);
    expect(find.text('Continue with Apple'), findsNothing);
    expect(find.text('or'), findsNothing);
    router.dispose();
  });

  testWidgets('showSocialSignIn brings the Google / Apple buttons back', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SignInScreen(showSocialSignIn: true)));
    expect(find.text('Continue with Google'), findsOneWidget);
    expect(find.text('Continue with Apple'), findsOneWidget);
  });

  testWidgets('"Forgot password?" opens the reset password page', (tester) async {
    final router = AppRouter.create(services: demoServices());
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    final target = find.text('Forgot password?');
    await tester.ensureVisible(target);
    await tester.pumpAndSettle();
    await tester.tap(target);
    await tester.pumpAndSettle();
    expect(find.byType(ResetPasswordScreen), findsOneWidget);
    expect(router.delegate.stack, [AppRoute.signIn, AppRoute.forgotPassword]);
    router.dispose();
  });
}
