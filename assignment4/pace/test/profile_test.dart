import 'dart:convert' show jsonEncode;
import 'package:flutter/material.dart' show TextField;
import 'package:flutter_test/flutter_test.dart'
    show expect, expectLater, fail, find, findsNothing, findsOneWidget, group, isA, isEmpty, setUp, test, testWidgets, throwsA;
import 'package:http/http.dart' as http show Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/user_account.dart' show UserAccount;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/models/app_exception.dart' show AppException, FieldValidationException;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_profile_service.dart' show RepositoryProfileService;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;
import 'package:pace_app/views/pace_app.dart' show PaceApp;
import 'package:pace_app/views/screens/profile_screen.dart' show ProfileScreen;


import 'helpers.dart' show NoGoogle;
void main() {
  group('RepositoryProfileService', () {
    late InMemoryUserAccountRepository accounts;
    late UserAccount ada;
    String? current;
    late RepositoryProfileService profile;
    setUp(() async {
      accounts = InMemoryUserAccountRepository();
      ada = await accounts.create(email: 'ada@example.com', displayName: 'Ada Lovelace', passwordHash: 'h');
      current = ada.id;
      profile = RepositoryProfileService(accounts: accounts, currentUserId: () => current);
    });

    test('loads the signed-in account', () async {
      final data = await profile.load();
      expect(data.name, 'Ada Lovelace');
      expect(data.email, 'ada@example.com');
      expect(data.initials, 'AL');
      expect(data.signInMethod, 'Email & password');
    });

    test('saves a new name (never the email) and announces the change', () async {
      var announced = 0;
      final sub = profile.changes.listen((_) => announced++);
      final saved = await profile.update(name: '  Ada King ');
      await Future<void>.delayed(Duration.zero);
      expect(saved.name, 'Ada King');
      expect(saved.initials, 'AK');
      expect(saved.email, 'ada@example.com');
      final stored = (await accounts.fetchById(ada.id))!;
      expect(stored.displayName, 'Ada King');
      expect(stored.email, 'ada@example.com'); // unchanged
      expect(stored.passwordHash, 'h'); // credentials untouched
      expect(announced, 1);
      await sub.cancel();
    });

    test('requires a name', () async {
      try {
        await profile.update(name: ' ');
        fail('Expected a FieldValidationException');
      } on FieldValidationException catch (e) {
        expect(e.fieldErrors, {'name': 'Enter your name'});
      }
      expect((await accounts.fetchById(ada.id))!.displayName, 'Ada Lovelace');
    });

    test('needs someone signed in', () async {
      current = null;
      await expectLater(profile.load(), throwsA(isA<AppException>()));
    });

    test('initials fall back to the email, then "?"', () {
      expect(RepositoryProfileService.initialsFor('Cher', null), 'C');
      expect(RepositoryProfileService.initialsFor(null, 'zed@example.com'), 'Z');
      expect(RepositoryProfileService.initialsFor(' ', ''), '?');
    });
  });

  testWidgets('Settings → Profile: edit and save; Settings header updates', (tester) async {
    final accounts = InMemoryUserAccountRepository();
    final services = demoServices(
      accounts: accounts,
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
      banks: InMemoryLinkedBankRepository(),
    );
    // Sign up first (hashing runs on a real isolate), then open the app already on Settings.
    await tester.runAsync(() => services.auth.createAccount(
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'secret123',
          confirmPassword: 'secret123',
          securityQuestion: 'What was the name of your first pet?',
          securityAnswer: 'Rex',
        ));
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.settings]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();
    expect(find.text('Ada Lovelace'), findsOneWidget);

    await tester.tap(find.text('Ada Lovelace'));
    await tester.pumpAndSettle();
    expect(find.byType(ProfileScreen), findsOneWidget);
    expect(find.text('AL'), findsOneWidget);

    // The email is shown but can't be edited.
    final email = tester.widget<TextField>(find.widgetWithText(TextField, 'Email'));
    expect(email.enabled, false);
    expect(email.readOnly, true);
    expect(email.controller!.text, 'ada@example.com');

    await tester.enterText(find.widgetWithText(TextField, 'Name'), 'Ada King');
    await tester.tap(find.text('Save changes'));
    await tester.pumpAndSettle();
    expect(find.text('Profile saved'), findsOneWidget);
    final stored = (await tester.runAsync(() => accounts.fetchByEmail('ada@example.com')))!;
    expect(stored.displayName, 'Ada King');
    expect(stored.email, 'ada@example.com');

    await tester.tap(find.bySemanticsLabel('Back'));
    await tester.pumpAndSettle();
    expect(router.delegate.current, AppRoute.settings);
    expect(find.text('Ada King'), findsOneWidget);
    expect(find.text('AK'), findsOneWidget);
    router.dispose();
  });

  testWidgets('Profile → bank connection: connect the sandbox test bank, then remove it', (tester) async {
    final plaid = MockClient((req) async => http.Response(
          jsonEncode(switch (req.url.path) {
            '/sandbox/public_token/create' => {'public_token': 'public-sandbox-1'},
            '/item/public_token/exchange' => {'access_token': 'access-sandbox-1', 'item_id': 'item-1'},
            '/accounts/get' => {
                'accounts': [
                  {'account_id': 'a1', 'name': 'Plaid Checking', 'type': 'depository', 'balances': {'current': 110}},
                  {'account_id': 'a2', 'name': 'Plaid Saving', 'type': 'depository', 'balances': {'current': 210}},
                ],
                'item': {'institution_name': 'First Platypus Bank'},
              },
            _ => {'request_id': 'ok'}, // /item/remove
          }),
          req.url.host == 'sandbox.plaid.com' ? 200 : 500,
        ));
    final banks = InMemoryLinkedBankRepository();
    final users = InMemoryUserAccountRepository();
    final services = demoServices(
      accounts: users,
      google: NoGoogle(),
      hasher: const PasswordHasher(iterations: 1000),
      plaid: SandboxPlaidApi(client: plaid, clientId: 'cid', secret: 'sandbox-secret'),
      banks: banks,
    );
    await tester.runAsync(() => services.auth.createAccount(
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          password: 'secret123',
          confirmPassword: 'secret123',
          securityQuestion: 'What was the name of your first pet?',
          securityAnswer: 'Rex',
        ));
    final router = AppRouter.create(services: services, initialStack: const [AppRoute.home, AppRoute.profile]);
    await tester.pumpWidget(PaceApp(router: router));
    await tester.pumpAndSettle();

    // Not connected: offers to connect, clearly in test mode.
    expect(find.text('Test mode · Plaid Sandbox · no real bank accounts'), findsOneWidget);
    final connect = find.text('Connect test bank with Plaid');
    await tester.ensureVisible(connect);
    await tester.tap(connect);
    await tester.pumpAndSettle();

    // Connected: shows the bank and offers removal; still on Profile.
    expect(router.delegate.current, AppRoute.profile);
    expect(find.text('First Platypus Bank'), findsOneWidget);
    expect(find.textContaining('2 accounts'), findsOneWidget);
    expect(find.text('Connect test bank with Plaid'), findsNothing);

    final remove = find.text('Remove connection');
    await tester.ensureVisible(remove);
    await tester.tap(remove);
    await tester.pumpAndSettle();
    expect(find.text('Remove First Platypus Bank?'), findsOneWidget);
    await tester.tap(find.text('Remove'));
    await tester.pumpAndSettle();

    expect(find.text('First Platypus Bank'), findsNothing);
    expect(find.text('Connect test bank with Plaid'), findsOneWidget);
    final ada = (await tester.runAsync(() => users.fetchByEmail('ada@example.com')))!;
    expect(await tester.runAsync(() => banks.itemsFor(ada.id)), isEmpty);
    router.dispose();
  });
}
