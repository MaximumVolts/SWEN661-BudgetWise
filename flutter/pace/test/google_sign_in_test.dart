import 'package:flutter_test/flutter_test.dart'
    show expect, group, isA, isFalse, isNull, isTrue, pumpEventQueue, setUp, tearDown, test, throwsA;
import 'package:pace_app/models/google_account.dart' show GoogleAccount;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/services/demo/demo_services.dart' show demoServices;
import 'package:pace_app/repositories/google_account_repository.dart' show GoogleAccountRepository;
import 'package:pace_app/repositories/google_sign_in_account_repository.dart' show GoogleSignInAccountRepository;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:pace_app/views/navigation/app_route.dart' show AppRoute;
import 'package:pace_app/views/navigation/app_router.dart' show AppRouter;

/// Stands in for Google: returns [next] (null = user cancelled the chooser).
class FakeGoogle implements GoogleAccountRepository {
  GoogleAccount? next;
  int signOuts = 0;
  FakeGoogle([this.next]);
  @override
  Future<GoogleAccount?> signIn() async => next;
  @override
  Future<void> signOut() async => signOuts++;
}

const ada = GoogleAccount(id: 'g-1', email: 'ada@gmail.com', displayName: 'Ada Lovelace');

void main() {
  group('RepositoryAuthService.signInWithGoogle', () {
    late InMemoryUserAccountRepository accounts;
    late FakeGoogle google;
    late RepositoryAuthService auth;
    setUp(() {
      accounts = InMemoryUserAccountRepository();
      google = FakeGoogle(ada);
      auth = RepositoryAuthService(accounts: accounts, google: google);
    });

    test('first sign-in creates the Pace account and starts onboarding', () async {
      expect(await auth.signInWithGoogle(), FlowStep.onboarding);
      expect(auth.isSignedIn, isTrue);
      final created = (await accounts.fetchByGoogleId('g-1'))!;
      expect(created.username, 'ada@gmail.com');
      expect(created.displayName, 'Ada Lovelace');
    });

    test('returning Google user goes home without a second account', () async {
      await auth.signInWithGoogle();
      await auth.signOut();
      expect(await auth.signInWithGoogle(), FlowStep.home);
      expect((await accounts.fetchByUsername('ada@gmail.com'))!.id, auth.currentAccount!.id);
      expect(google.signOuts, 1);
    });

    test('links Google to an existing account with the same email', () async {
      final existing = await accounts.create(username: 'ADA@gmail.com');
      expect(await auth.signInWithGoogle(), FlowStep.home);
      expect(auth.currentAccount!.id, existing.id);
      expect((await accounts.fetchById(existing.id))!.googleId, 'g-1');
    });

    test('cancelling the chooser signs nobody in', () async {
      google.next = null;
      expect(await auth.signInWithGoogle(), isNull);
      expect(auth.isSignedIn, isFalse);
    });

    test('deleting the account removes it and signs out of Google', () async {
      await auth.signInWithGoogle();
      await auth.deleteAccount();
      expect(await accounts.fetchByGoogleId('g-1'), isNull);
      expect(auth.isSignedIn, isFalse);
      expect(google.signOuts, 1);
    });
  });

  group('sign-in screen flow', () {
    late FakeGoogle google;
    late AppRouter router;
    setUp(() {
      google = FakeGoogle(ada);
      router = AppRouter.create(
        services: demoServices(accounts: InMemoryUserAccountRepository(), google: google),
        initialStack: const [AppRoute.signIn],
      );
    });
    tearDown(() => router.dispose());

    test('new Google user lands on onboarding', () async {
      await router.dependencies.signIn().signInWithGoogle();
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.onboarding]);
    });

    test('cancelled Google sign-in stays on sign-in', () async {
      google.next = null;
      await router.dependencies.signIn().signInWithGoogle();
      await pumpEventQueue();
      expect(router.delegate.stack, [AppRoute.signIn]);
    });
  });

  test('plugin service refuses to start without client IDs', () {
    expect(
      GoogleSignInAccountRepository(serverClientId: '', iosClientId: '').signIn(),
      throwsA(isA<AppException>()),
    );
  });
}
