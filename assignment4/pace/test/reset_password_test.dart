import 'package:flutter/material.dart' show TextField;
import 'package:flutter_test/flutter_test.dart'
    show expect, expectLater, find, findsOneWidget, group, isA, isFalse, isTrue, setUp, test, testWidgets, throwsA;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/models/app_exception.dart' show AppException, FieldValidationException;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;


import 'helpers.dart' show fieldErrors, NoGoogle, testPlaidClientId, testPlaidSecret;
const fastHasher = PasswordHasher(iterations: 1000);
const petQuestion = 'What was the name of your first pet?';


Future<void> createAda(RepositoryAuthService auth) async {
  await auth.createAccount(
    name: 'Ada',
    username: 'ada',
    password: 'secret123',
    confirmPassword: 'secret123',
    securityQuestion: petQuestion,
    securityAnswer: '  New   York ',
    plaidClientId: testPlaidClientId,
    plaidSecret: testPlaidSecret,
  );
  await auth.signOut();
}

void main() {
  group('RepositoryAuthService password reset', () {
    late InMemoryUserAccountRepository accounts;
    late RepositoryAuthService auth;
    late DateTime now;
    setUp(() async {
      accounts = InMemoryUserAccountRepository();
      now = DateTime(2026, 10, 12, 9);
      auth = RepositoryAuthService(accounts: accounts, google: NoGoogle(), hasher: fastHasher, now: () => now);
      await createAda(auth);
    });

    Future<FlowStep> reset({String answer = 'new york', String pw = 'fresh456', String? confirm}) => auth.resetPassword(
          username: 'ada',
          securityAnswer: answer,
          newPassword: pw,
          confirmPassword: confirm ?? pw,
        );

    test('shows the account’s question; the answer is stored hashed', () async {
      expect(await auth.securityQuestionFor('ADA'), petQuestion);
      final stored = (await accounts.fetchByUsername('ada'))!;
      expect(stored.securityAnswerHash!.contains('york'), isFalse);
    });

    test('right answer (any case / spacing) sets the new password and signs in', () async {
      expect(await reset(answer: 'NEW YORK'), FlowStep.home);
      expect(auth.isSignedIn, isTrue);
      await auth.signOut();
      expect(await auth.signIn(username: 'ada', password: 'fresh456'), FlowStep.home);
      expect(() => auth.signIn(username: 'ada', password: 'secret123'), throwsA(isA<FieldValidationException>()));
    });

    test('wrong answer keeps the old password', () async {
      expect(await fieldErrors(() => reset(answer: 'Boston')), {'securityAnswer': "That answer doesn't match"});
      expect(auth.isSignedIn, isFalse);
      expect(await auth.signIn(username: 'ada', password: 'secret123'), FlowStep.home);
    });

    test('new password must follow the rules and match', () async {
      final errors = await fieldErrors(() => reset(pw: 'short', confirm: 'other'));
      expect(errors.keys.toSet(), {'password', 'confirmPassword'});
    });

    test('5 wrong answers lock resets for 5 minutes', () async {
      for (var i = 0; i < 4; i++) {
        await fieldErrors(() => reset(answer: 'wrong'));
      }
      await expectLater(reset(answer: 'wrong'), throwsA(isA<AppException>()));
      // Even the right answer is refused while locked…
      await expectLater(reset(), throwsA(isA<AppException>()));
      // …and accepted once the lock expires.
      now = now.add(const Duration(minutes: 5, seconds: 1));
      expect(await reset(), FlowStep.home);
    });

    test('unknown username, Google-only and question-less accounts can’t be reset', () async {
      expect((await fieldErrors(() => auth.securityQuestionFor('bob')))['username'],
          'No account on this device uses that username');
      await accounts.create(username: 'g', googleId: 'g-1');
      expect((await fieldErrors(() => auth.securityQuestionFor('g')))['username'],
          'This account signs in with Google, so it has no password to reset');
      await accounts.create(username: 'old', passwordHash: 'x');
      expect((await fieldErrors(() => auth.securityQuestionFor('old')))['username'],
          'This account has no security question, so its password can’t be reset');
    });

    test('sign-up requires a question from the list and an answer', () async {
      final errors = await fieldErrors(() => auth.createAccount(
            name: 'Bo',
            username: 'bo.lee',
            password: 'secret123',
            confirmPassword: 'secret123',
            securityQuestion: 'Made-up question?',
            securityAnswer: ' ',
            plaidClientId: testPlaidClientId,
            plaidSecret: testPlaidSecret,
          ));
      expect(errors.keys.toSet(), {'securityQuestion', 'securityAnswer'});
    });
  });

  testWidgets('reset page: username → question → new password → Home', (tester) async {
    final accounts = InMemoryUserAccountRepository();
    final router = AppRouter.create(
      services: demoServices(
        accounts: accounts,
        google: NoGoogle(),
        hasher: fastHasher,
        banks: InMemoryLinkedBankRepository(),
      ),
      initialStack: const [AppRoute.signIn, AppRoute.forgotPassword],
    );
    await tester.runAsync(() => createAda(RepositoryAuthService(accounts: accounts, google: NoGoogle(), hasher: fastHasher)));
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextField, 'Username'), 'ada');
    await tester.tap(find.text('Continue'));
    await tester.pumpAndSettle();
    expect(find.text(petQuestion), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextField, 'Answer'), 'new york');
    await tester.enterText(find.widgetWithText(TextField, 'New password'), 'fresh456');
    await tester.enterText(find.widgetWithText(TextField, 'Confirm new password'), 'fresh456');
    await tester.ensureVisible(find.text('Reset password').last);
    // Hashing runs on a real background isolate, outside the test's fake clock.
    await tester.runAsync(() async {
      await tester.tap(find.text('Reset password').last);
      for (var i = 0; i < 50 && router.delegate.current != AppRoute.home; i++) {
        await Future<void>.delayed(const Duration(milliseconds: 20));
      }
    });
    await tester.pumpAndSettle();
    expect(router.delegate.stack, [AppRoute.home]);
    router.dispose();
  });
}
