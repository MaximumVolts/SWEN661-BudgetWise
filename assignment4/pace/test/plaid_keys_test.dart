// Each user's Plaid sandbox keys: entered at sign-up (or on Profile), stored with their account,
// and used for every Plaid request.
import 'dart:convert' show jsonDecode, jsonEncode;
import 'dart:io' show Directory, File;
import 'package:flutter_test/flutter_test.dart'
    show contains, expect, expectLater, group, isA, isFalse, isNull, isTrue, setUp, setUpAll, tearDown, test, throwsA;
import 'package:http/http.dart' as http show Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/models/linked_bank.dart' show SandboxTestCredentials;
import 'package:pace_app/models/plaid_keys.dart' show PlaidKeys;
import 'package:pace_app/repositories/pace_database.dart' show PaceDatabase;
import 'package:pace_app/repositories/plaid_key_repository.dart' show InMemoryPlaidKeyRepository;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/repositories/sqlite_plaid_key_repository.dart' show SqlitePlaidKeyRepository;
import 'package:pace_app/repositories/sqlite_user_account_repository.dart' show SqliteUserAccountRepository;
import 'package:pace_app/repositories/user_account_repository.dart' show InMemoryUserAccountRepository;
import 'package:pace_app/services/password_hasher.dart' show PasswordHasher;
import 'package:pace_app/services/repository_auth_service.dart' show RepositoryAuthService;
import 'package:pace_app/services/repository_profile_service.dart' show RepositoryProfileService;
import 'package:sqflite_common_ffi/sqflite_ffi.dart' show databaseFactoryFfi, sqfliteFfiInit;

import 'helpers.dart' show fieldErrors, NoGoogle, testPlaidClientId, testPlaidSecret;

const _otherClientId = 'abcdefabcdefabcdefabcdef';
const _otherSecret = 'fedcbafedcbafedcbafedcbafedcba';

void main() {
  group('sign-up', () {
    late InMemoryUserAccountRepository accounts;
    late InMemoryPlaidKeyRepository keys;
    late RepositoryAuthService auth;
    setUp(() {
      accounts = InMemoryUserAccountRepository();
      keys = InMemoryPlaidKeyRepository();
      auth = RepositoryAuthService(
          accounts: accounts, google: NoGoogle(), hasher: const PasswordHasher(iterations: 1000), plaidKeys: keys);
    });

    Future<void> create(String clientId, String secret) => auth.createAccount(
          name: 'Ada',
          username: 'ada',
          password: 'secret123',
          confirmPassword: 'secret123',
          securityQuestion: 'What was the name of your first pet?',
          securityAnswer: 'Rex',
          plaidClientId: clientId,
          plaidSecret: secret,
        );

    test('stores the keys (trimmed) with the new account', () async {
      await create('  $testPlaidClientId ', ' $testPlaidSecret');
      final ada = (await accounts.fetchByUsername('ada'))!;
      final stored = (await keys.load(ada.id))!;
      expect((stored.clientId, stored.sandboxSecret), (testPlaidClientId, testPlaidSecret));
    });

    test('requires both keys, in Plaid\'s format', () async {
      expect(await fieldErrors(() => create('', '')), {
        'plaidClientId': 'Enter your Plaid client ID',
        'plaidSecret': 'Enter your Plaid sandbox secret',
      });
      final wrong = await fieldErrors(() => create('not-a-client-id', '${testPlaidSecret}0'));
      expect(wrong.keys.toSet(), {'plaidClientId', 'plaidSecret'});
      expect(await accounts.fetchByUsername('ada'), isNull); // nothing created
    });
  });

  group('Profile', () {
    late InMemoryUserAccountRepository accounts;
    late InMemoryPlaidKeyRepository keys;
    late RepositoryProfileService profile;
    late String adaId;
    setUp(() async {
      accounts = InMemoryUserAccountRepository();
      keys = InMemoryPlaidKeyRepository();
      adaId = (await accounts.create(username: 'ada', displayName: 'Ada', passwordHash: 'h')).id;
      profile = RepositoryProfileService(accounts: accounts, plaidKeys: keys, currentUserId: () => adaId);
    });

    test('shows the client ID but never the secret', () async {
      await keys.save(adaId, const PlaidKeys(clientId: testPlaidClientId, sandboxSecret: testPlaidSecret));
      final data = await profile.load();
      expect(data.plaidClientId, testPlaidClientId);
      expect(data.hasPlaidSecret, isTrue);
      expect(data.hasPlaidKeys, isTrue);
    });

    test('a blank secret keeps the saved one; a new one replaces it', () async {
      await keys.save(adaId, const PlaidKeys(clientId: testPlaidClientId, sandboxSecret: testPlaidSecret));
      await profile.update(name: 'Ada', plaidClientId: _otherClientId, plaidSecret: '');
      expect((await keys.load(adaId))!.sandboxSecret, testPlaidSecret);
      expect((await keys.load(adaId))!.clientId, _otherClientId);
      await profile.update(name: 'Ada', plaidClientId: _otherClientId, plaidSecret: _otherSecret);
      expect((await keys.load(adaId))!.sandboxSecret, _otherSecret);
    });

    test('without keys, renaming works; entering only part of the keys is an error', () async {
      final data = await profile.update(name: 'Ada King', plaidClientId: '', plaidSecret: '');
      expect(data.name, 'Ada King');
      expect(data.hasPlaidKeys, isFalse);
      expect(await keys.load(adaId), isNull);
      expect(await fieldErrors(() => profile.update(name: 'Ada', plaidClientId: testPlaidClientId, plaidSecret: '')),
          {'plaidSecret': 'Enter your Plaid sandbox secret'});
    });
  });

  group('SandboxPlaidApi', () {
    Future<void> link(SandboxPlaidApi api) => api.createSandboxPublicToken(
        institutionId: 'ins_109508', products: const ['transactions'], credentials: SandboxTestCredentials.simple);

    test('sends the keys it is given for each request', () async {
      final sent = <Map<String, dynamic>>[];
      var current = const PlaidKeys(clientId: testPlaidClientId, sandboxSecret: testPlaidSecret);
      final api = SandboxPlaidApi(
        keys: () async => current,
        client: MockClient((request) async {
          sent.add(jsonDecode(request.body) as Map<String, dynamic>);
          return http.Response(jsonEncode({'public_token': 'public-sandbox-123'}), 200);
        }),
      );
      await link(api);
      current = const PlaidKeys(clientId: _otherClientId, sandboxSecret: _otherSecret); // e.g. another user signs in
      await link(api);
      expect([for (final b in sent) (b['client_id'], b['secret'])],
          [(testPlaidClientId, testPlaidSecret), (_otherClientId, _otherSecret)]);
    });

    test('without keys, asks for them in Profile and sends nothing', () async {
      var calls = 0;
      final api = SandboxPlaidApi(
        keys: () async => PlaidKeys.none,
        client: MockClient((_) async {
          calls++;
          return http.Response('{}', 200);
        }),
      );
      await expectLater(
          link(api),
          throwsA(isA<AppException>()
              .having((e) => e.message, 'message', 'Add your Plaid sandbox keys in Profile to connect a bank.')));
      expect(calls, 0);
    });

    test('keys Plaid rejects point the user to Profile', () async {
      final api = SandboxPlaidApi(
        keys: () async => const PlaidKeys(clientId: testPlaidClientId, sandboxSecret: testPlaidSecret),
        client: MockClient((_) async => http.Response(
            jsonEncode({'error_code': 'INVALID_API_KEYS', 'error_message': 'invalid client_id or secret provided'}), 400)),
      );
      await expectLater(
          link(api), throwsA(isA<AppException>().having((e) => e.message, 'message', contains('Check the client ID'))));
    });
  });

  group('SqlitePlaidKeyRepository', () {
    late Directory dir;
    late PaceDatabase pace;
    setUpAll(sqfliteFfiInit);
    setUp(() {
      dir = Directory.systemTemp.createTempSync('pace_keys_test');
      pace = PaceDatabase(
          factory: databaseFactoryFfi, path: '${dir.path}/pace.db', loadAsset: (asset) => File(asset).readAsString());
    });
    tearDown(() async {
      await pace.close();
      dir.deleteSync(recursive: true);
    });

    test('saves, replaces, and deletes the keys with the account', () async {
      final users = SqliteUserAccountRepository(pace);
      final repo = SqlitePlaidKeyRepository(pace);
      final ada = await users.create(username: 'ada', passwordHash: 'h');
      expect(await repo.load(ada.id), isNull);
      await repo.save(ada.id, const PlaidKeys(clientId: testPlaidClientId, sandboxSecret: testPlaidSecret));
      await repo.save(ada.id, const PlaidKeys(clientId: _otherClientId, sandboxSecret: _otherSecret));
      final stored = (await repo.load(ada.id))!;
      expect((stored.clientId, stored.sandboxSecret), (_otherClientId, _otherSecret));
      expect((await (await pace.database).query('plaid_sandbox_keys')).length, 1);

      await users.delete(ada.id);
      expect((await (await pace.database).query('plaid_sandbox_keys')).length, 0);
    });
  });
}
