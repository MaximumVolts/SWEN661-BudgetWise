import 'dart:convert' show jsonDecode, jsonEncode;
import 'package:flutter/material.dart' show MaterialApp, TextField;
import 'package:flutter_test/flutter_test.dart'
    show expect, expectLater, find, findsNothing, findsOneWidget, group, isA, isEmpty, setUp, test, testWidgets, throwsA;
import 'package:http/http.dart' as http show Request, Response;
import 'package:http/testing.dart' show MockClient;
import 'package:pace_app/models/linked_bank.dart' show LinkedBankAccount, LinkedItem;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/device_linked_bank_repository.dart' show DeviceLinkedBankRepository;
import 'package:pace_app/repositories/linked_bank_repository.dart' show InMemoryLinkedBankRepository;
import 'package:pace_app/models/app_exception.dart' show AppException;
import 'package:pace_app/services/plaid_sandbox_bank_link_service.dart' show PlaidSandboxBankLinkService;
import 'package:pace_app/repositories/sandbox_plaid_api.dart' show SandboxPlaidApi;
import 'package:pace_app/views/screens/connect_bank_screen.dart' show ConnectBankScreen;
import 'package:shared_preferences_platform_interface/in_memory_shared_preferences_async.dart'
    show InMemorySharedPreferencesAsync;
import 'package:shared_preferences_platform_interface/shared_preferences_async_platform_interface.dart'
    show SharedPreferencesAsyncPlatform;

/// Fake Plaid sandbox: answers the three calls like the real one and records every request.
class FakePlaid {
  final requests = <http.Request>[];
  String publicToken = 'public-sandbox-b0e2c4ee-a763-4df5-bfe9-46a46bce993d';
  String accessToken = 'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6';
  http.Response? failWith;
  /// Overrides the /item/remove reply (e.g. a Plaid error).
  http.Response? removeResponse;

  late final client = MockClient((req) async {
    requests.add(req);
    if (failWith case final f?) return f;
    return switch (req.url.path) {
      '/sandbox/public_token/create' => _json({'public_token': publicToken, 'request_id': 'r1'}),
      '/item/public_token/exchange' => _json({'access_token': accessToken, 'item_id': 'item-1', 'request_id': 'r2'}),
      '/accounts/get' => _json({
          'accounts': [
            {
              'account_id': 'acc-chk',
              'balances': {'available': 100, 'current': 110, 'iso_currency_code': 'USD'},
              'mask': '0000',
              'name': 'Plaid Checking',
              'type': 'depository',
              'subtype': 'checking',
            },
            {
              'account_id': 'acc-sav',
              'balances': {'available': 200.5, 'current': 210.25, 'iso_currency_code': 'USD'},
              'mask': '1111',
              'name': 'Plaid Saving',
              'type': 'depository',
              'subtype': 'savings',
            },
          ],
          'item': {'item_id': 'item-1', 'institution_id': 'ins_109508', 'institution_name': 'First Platypus Bank'},
          'request_id': 'r3',
        }),
      '/item/remove' => removeResponse ?? _json({'request_id': 'r4'}),
      _ => http.Response('not found', 404),
    };
  });

  static http.Response _json(Object body, [int status = 200]) => http.Response(jsonEncode(body), status);
}

void main() {
  group('Plaid sandbox linking', () {
    late FakePlaid plaid;
    late InMemoryLinkedBankRepository banks;
    String? userId;
    PlaidSandboxBankLinkService service({String clientId = 'cid', String secret = 'sandbox-secret'}) =>
        PlaidSandboxBankLinkService(
          plaid: SandboxPlaidApi(client: plaid.client, clientId: clientId, secret: secret),
          banks: banks,
          currentUserId: () => userId,
        );

    setUp(() {
      plaid = FakePlaid();
      banks = InMemoryLinkedBankRepository();
      userId = 'u1';
    });

    test('links the sandbox test bank through sandbox.plaid.com only and stores it for the user', () async {
      final outcome = await service().startLink();
      expect(outcome.linked, true);
      expect(outcome.next, FlowStep.home);

      expect([for (final r in plaid.requests) r.url.toString()], [
        'https://sandbox.plaid.com/sandbox/public_token/create',
        'https://sandbox.plaid.com/item/public_token/exchange',
        'https://sandbox.plaid.com/accounts/get',
      ]);
      final create = jsonDecode(plaid.requests.first.body) as Map<String, dynamic>;
      expect(create['institution_id'], 'ins_109508');
      expect(create['initial_products'], ['transactions']);
      expect(create['client_id'], 'cid');
      // Plaid's published "simple" sandbox test user, never anything typed by the user.
      expect(create['options'], {'override_username': 'user_good', 'override_password': 'pass_good'});

      final items = await banks.itemsFor('u1');
      expect(items.single.institutionName, 'First Platypus Bank');
      expect(items.single.sandboxCredentialsLabel, 'simple');
      expect(items.single.accessToken.startsWith('access-sandbox-'), true);
      final accounts = await banks.accountsFor('u1');
      expect([for (final a in accounts) a.name], ['Plaid Checking', 'Plaid Saving']);
      expect(accounts.last.currentBalance, 210.25);
      expect(await banks.itemsFor('someone-else'), isEmpty);
    });

    test('a non-sandbox token from the API is refused and nothing is stored', () async {
      plaid.publicToken = 'public-production-123';
      await expectLater(service().startLink(), throwsA(isA<AppException>()));
      expect(plaid.requests.length, 1); // stopped before the exchange
      expect(await banks.itemsFor('u1'), isEmpty);

      plaid
        ..requests.clear()
        ..publicToken = 'public-sandbox-ok'
        ..accessToken = 'access-development-123';
      await expectLater(service().startLink(), throwsA(isA<AppException>()));
      expect(await banks.itemsFor('u1'), isEmpty);
    });

    test('Plaid errors become a friendly message', () async {
      plaid.failWith = http.Response(
        jsonEncode({
          'error_type': 'INSTITUTION_ERROR',
          'error_code': 'INSTITUTION_DOWN',
          'error_message': 'this institution is not currently responding',
          'display_message': 'The test bank is not responding. Try again later.',
        }),
        400,
      );
      await expectLater(
        service().startLink(),
        throwsA(isA<AppException>().having((e) => e.message, 'message', 'The test bank is not responding. Try again later.')),
      );
    });

    test('missing sandbox keys fail before any request is made', () async {
      await expectLater(service(clientId: '', secret: '').startLink(), throwsA(isA<AppException>()));
      expect(plaid.requests, isEmpty);
    });

    test('lists the user’s connections without tokens', () async {
      expect(await service().connections(), isEmpty);
      await service().startLink();
      final c = (await service().connections()).single;
      expect(c.itemId, 'item-1');
      expect(c.institutionName, 'First Platypus Bank');
      expect(c.accountCount, 2);
      expect(c.isSandbox, true);
      userId = 'someone-else';
      expect(await service().connections(), isEmpty);
    });

    test('removing revokes the Item at the sandbox, then deletes it from the device', () async {
      await service().startLink();
      plaid.requests.clear();
      await service().removeConnection('item-1');
      expect(plaid.requests.single.url.toString(), 'https://sandbox.plaid.com/item/remove');
      expect((jsonDecode(plaid.requests.single.body) as Map<String, dynamic>)['access_token'],
          'access-sandbox-de3ce8ef-33f8-452c-a685-8671031fc0f6');
      expect(await banks.itemsFor('u1'), isEmpty);
      expect(await banks.accountsFor('u1'), isEmpty);
      expect(await service().connections(), isEmpty);
    });

    test('an Item Plaid no longer knows still counts as removed', () async {
      await service().startLink();
      plaid.removeResponse = http.Response(jsonEncode({'error_type': 'ITEM_ERROR', 'error_code': 'ITEM_NOT_FOUND'}), 400);
      await service().removeConnection('item-1');
      expect(await banks.itemsFor('u1'), isEmpty);
    });

    test('if Plaid can’t remove it, the connection is kept so the user can retry', () async {
      await service().startLink();
      plaid.removeResponse = http.Response(jsonEncode({'error_type': 'API_ERROR', 'error_code': 'INTERNAL_SERVER_ERROR'}), 500);
      await expectLater(service().removeConnection('item-1'), throwsA(isA<AppException>()));
      expect((await banks.itemsFor('u1')).length, 1);
    });

    test('cannot remove another user’s connection', () async {
      await service().startLink();
      userId = 'u2';
      await expectLater(service().removeConnection('item-1'), throwsA(isA<AppException>()));
      expect((await banks.itemsFor('u1')).length, 1);
    });

    test('must be signed in', () async {
      userId = null;
      await expectLater(service().startLink(), throwsA(isA<AppException>()));
      expect(plaid.requests, isEmpty);
    });
  });

  test('DeviceLinkedBankRepository keeps linked banks across restarts', () async {
    SharedPreferencesAsyncPlatform.instance = InMemorySharedPreferencesAsync.empty();
    await DeviceLinkedBankRepository().saveItem(
      LinkedItem(
        itemId: 'item-1',
        userId: 'u1',
        institutionName: 'First Platypus Bank',
        accessToken: 'access-sandbox-x',
        sandboxCredentialsLabel: 'simple',
        linkedAt: DateTime.utc(2026, 10, 12),
      ),
      const [LinkedBankAccount(accountId: 'a1', itemId: 'item-1', name: 'Plaid Checking', type: 'depository', currentBalance: 110)],
    );
    final reopened = DeviceLinkedBankRepository();
    expect((await reopened.itemsFor('u1')).single.linkedAt, DateTime.utc(2026, 10, 12));
    expect((await reopened.accountsFor('u1')).single.currentBalance, 110);
    await reopened.deleteItem('item-1');
    expect(await DeviceLinkedBankRepository().accountsFor('u1'), isEmpty);
  });

  group('Connect bank screen', () {
    testWidgets('always shows that it is a test environment', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: ConnectBankScreen()));
      expect(find.text('Test mode · Plaid Sandbox · no real bank accounts'), findsOneWidget);
      expect(find.byType(TextField), findsNothing);
    });

    testWidgets('while connecting: test-endpoint notice, and no way to enter account details', (tester) async {
      await tester.pumpWidget(const MaterialApp(home: ConnectBankScreen(isLoading: true)));
      expect(find.text('Connecting to a test endpoint…'), findsOneWidget);
      expect(find.textContaining('sandbox.plaid.com'), findsOneWidget);
      expect(find.byType(TextField), findsNothing);
    });
  });
}
