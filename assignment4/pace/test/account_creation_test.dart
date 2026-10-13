import 'package:flutter/material.dart' show DropdownButtonFormField, TextField;
import 'package:flutter_test/flutter_test.dart'
    show
        contains,
        expect,
        find,
        findsOneWidget,
        group,
        isFalse,
        isNot,
        isNotNull,
        isNull,
        isTrue,
        setUp,
        test,
        testWidgets;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/create_account_screen.dart' show CreateAccountScreen;


import 'helpers.dart' show fieldErrors, NoGoogle, testPlaidClientId, testPlaidSecret;
const fastHasher = PasswordHasher(iterations: 1000);
const petQuestion = 'What was the name of your first pet?';

/// Runs [body] and returns the field errors it throws.

void main() {
  group('PasswordHasher', () {
    test('verifies the right password only, and never stores it', () async {
      final stored = await fastHasher.hash('secret123');
      expect(stored, isNot(contains('secret123')));
      expect(await fastHasher.verify('secret123', stored), isTrue);
      expect(await fastHasher.verify('secret124', stored), isFalse);
      expect(await fastHasher.verify('secret123', 'garbage'), isFalse);
    });

    test('salts every hash', () async {
      expect(await fastHasher.hash('secret123'), isNot(await fastHasher.hash('secret123')));
    });
  });

  group('RepositoryAuthService.createAccount', () {
    late InMemoryUserAccountRepository accounts;
    late RepositoryAuthService auth;
    setUp(() {
      accounts = InMemoryUserAccountRepository();
      auth = RepositoryAuthService(accounts: accounts, google: NoGoogle(), hasher: fastHasher);
    });

    Future<FlowStep> create({String name = 'Ada', String username = 'ada', String pw = 'secret123', String? confirm}) =>
        auth.createAccount(
          name: name,
          username: username,
          password: pw,
          confirmPassword: confirm ?? pw,
          securityQuestion: petQuestion,
          securityAnswer: 'Rex',
          plaidClientId: testPlaidClientId,
          plaidSecret: testPlaidSecret,
        );

    test('creates a hashed account, signs in and starts onboarding', () async {
      expect(await create(), FlowStep.onboarding);
      expect(auth.isSignedIn, isTrue);
      final stored = (await accounts.fetchByUsername('ada'))!;
      expect(stored.displayName, 'Ada');
      expect(stored.passwordHash, isNotNull);
      expect(stored.passwordHash, isNot(contains('secret123')));
    });

    test('reports every invalid field at once', () async {
      final errors = await fieldErrors(() => create(name: ' ', username: 'no', pw: 'short', confirm: 'other'));
      expect(errors.keys.toSet(), {'name', 'username', 'password', 'confirmPassword'});
      expect(auth.isSignedIn, isFalse);
    });

    test('requires a letter and a number in the password', () async {
      expect((await fieldErrors(() => create(pw: 'abcdefgh')))['password'], 'Include at least one letter and one number');
      expect((await fieldErrors(() => create(pw: '12345678')))['password'], 'Include at least one letter and one number');
    });

    test('usernames: 3–30 letters, numbers, dots, dashes or underscores', () async {
      for (final ok in ['ada', 'Ada.Lovelace', 'ada_1815', 'a-b']) {
        expect((await fieldErrors(() => create(username: ok, pw: 'short')))['username'], isNull, reason: ok);
      }
      expect((await fieldErrors(() => create(username: '  ')))['username'], 'Choose a username');
      expect((await fieldErrors(() => create(username: 'ab')))['username'], 'Use 3–30 characters');
      expect((await fieldErrors(() => create(username: 'a' * 31)))['username'], 'Use 3–30 characters');
      for (final bad in ['ada@example.com', 'ada lovelace', '.ada', '_ada']) {
        expect((await fieldErrors(() => create(username: bad)))['username'],
            'Use letters, numbers, dots, dashes or underscores, starting with a letter or number',
            reason: bad);
      }
    });

    test('rejects a username that is already taken (any case)', () async {
      await create();
      await auth.signOut();
      expect((await fieldErrors(() => create(username: 'ADA')))['username'], 'An account with this username already exists');
    });
  });

  group('RepositoryAuthService.signIn', () {
    late RepositoryAuthService auth;
    setUp(() async {
      auth = RepositoryAuthService(accounts: InMemoryUserAccountRepository(), google: NoGoogle(), hasher: fastHasher);
      await auth.createAccount(
        name: 'Ada',
        username: 'ada',
        password: 'secret123',
        confirmPassword: 'secret123',
        securityQuestion: petQuestion,
        securityAnswer: 'Rex',
        plaidClientId: testPlaidClientId,
        plaidSecret: testPlaidSecret,
      );
      await auth.signOut();
    });

    test('correct password goes home', () async {
      expect(await auth.signIn(username: 'Ada', password: 'secret123'), FlowStep.home);
      expect(auth.isSignedIn, isTrue);
    });

    test('wrong password and unknown username fail the same way', () async {
      final wrong = await fieldErrors(() => auth.signIn(username: 'ada', password: 'nope'));
      final unknown = await fieldErrors(() => auth.signIn(username: 'bob', password: 'secret123'));
      expect(wrong, {'password': 'Username or password is incorrect'});
      expect(unknown, wrong);
      expect(auth.isSignedIn, isFalse);
    });
  });

  group('Create account screen', () {
    AppRouter appRouter() => AppRouter.create(
          services: demoServices(accounts: InMemoryUserAccountRepository(), google: NoGoogle(), hasher: fastHasher),
        );

    testWidgets('sign-in → Create account → shows field errors from the service', (tester) async {
      final router = appRouter();
      await tester.pumpWidget(PaceApp(router: router));
      await tester.pumpAndSettle();

      await tester.tap(find.text('Create account'));
      await tester.pumpAndSettle();
      expect(find.byType(CreateAccountScreen), findsOneWidget);

      await tester.tap(find.widgetWithText(TextField, 'Username'));
      await tester.enterText(find.widgetWithText(TextField, 'Username'), 'not a username!');
      await tester.ensureVisible(find.text('Create account').last);
      await tester.tap(find.text('Create account').last);
      await tester.pumpAndSettle();

      expect(find.text('Enter your name'), findsOneWidget);
      expect(find.text('Use letters, numbers, dots, dashes or underscores, starting with a letter or number'), findsOneWidget);
      expect(router.delegate.current, AppRoute.createAccount);
      router.dispose();
    });

    testWidgets('a valid form creates the account and opens onboarding', (tester) async {
      final router = appRouter();
      await tester.pumpWidget(PaceApp(router: router));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Create account'));
      await tester.pumpAndSettle();

      await tester.enterText(find.widgetWithText(TextField, 'Name'), 'Ada');
      await tester.enterText(find.widgetWithText(TextField, 'Username'), 'ada');
      await tester.enterText(find.widgetWithText(TextField, 'Password'), 'secret123');
      await tester.enterText(find.widgetWithText(TextField, 'Confirm password'), 'secret123');
      final picker = find.byType(DropdownButtonFormField<String>);
      await tester.ensureVisible(picker);
      await tester.tap(picker);
      await tester.pumpAndSettle();
      await tester.tap(find.text(petQuestion).last);
      await tester.pumpAndSettle();
      await tester.enterText(find.widgetWithText(TextField, 'Answer'), 'Rex');
      await tester.ensureVisible(find.widgetWithText(TextField, 'Sandbox secret'));
      await tester.enterText(find.widgetWithText(TextField, 'Client ID'), testPlaidClientId);
      await tester.enterText(find.widgetWithText(TextField, 'Sandbox secret'), testPlaidSecret);
      await tester.ensureVisible(find.text('Create account').last);
      await tester.pumpAndSettle();
      // Password hashing runs on a real background isolate, outside the test's fake clock.
      await tester.runAsync(() async {
        await tester.tap(find.text('Create account').last);
        for (var i = 0; i < 50 && router.delegate.current != AppRoute.onboarding; i++) {
          await Future<void>.delayed(const Duration(milliseconds: 20));
        }
      });
      await tester.pumpAndSettle();

      expect(router.delegate.stack, [AppRoute.onboarding]);
      router.dispose();
    });
  });
}
