import 'dart:convert' show jsonDecode, jsonEncode;
import 'package:flutter/foundation.dart' show kDebugMode;
import 'package:http/http.dart' as http show Client, ClientException, Response;
import '../models/bank_data.dart' show BankTransaction, RecurringStream;
import '../models/linked_bank.dart' show LinkedBankAccount, SandboxTestCredentials;
import '../models/app_exception.dart' show AppException;
import 'plaid_api.dart' show PlaidApi;
import 'plaid_config.dart' show PlaidConfig, PlaidKeys;

/// [PlaidApi] against Plaid's **Sandbox** environment only (https://plaid.com/docs/api/sandbox/).
///
/// Sandbox is enforced, not configured: the host is a constant with no way to override it,
/// every request is checked against it before sending, and tokens Plaid returns must be
/// sandbox tokens (`public-sandbox-…`, `access-sandbox-…`) or the call fails.
class SandboxPlaidApi implements PlaidApi {
  static const sandboxHost = 'sandbox.plaid.com';

  static const _unreachable = "Couldn't reach Plaid's test service. Check your internet connection and try again.";
  static const _failed = "Plaid's test service couldn't link the account. Please try again.";
  static const _notConfigured = "Bank linking isn't set up for this build yet.";
  static const _notConfiguredDebug = 'Plaid sandbox keys are missing: add plaid.clientId and plaid.sandboxSecret to '
      'android/local.properties, then stop and re-run the app (Android only).';

  final http.Client _http;
  final Future<PlaidKeys> Function() _keys;

  /// Keys come from Android's BuildConfig ([PlaidConfig.load]) unless [clientId] / [secret] are
  /// given (tests).
  SandboxPlaidApi({http.Client? client, String? clientId, String? secret})
      : _http = client ?? http.Client(),
        _keys = (clientId == null && secret == null)
            ? PlaidConfig.load
            : (() async => PlaidKeys(clientId: clientId ?? '', sandboxSecret: secret ?? ''));

  @override
  Future<String> createSandboxPublicToken({
    required String institutionId,
    required List<String> products,
    required SandboxTestCredentials credentials,
  }) async {
    final j = await _post('/sandbox/public_token/create', {
      'institution_id': institutionId,
      'initial_products': products,
      'options': {
        'override_username': credentials.username,
        'override_password': credentials.password,
      },
    });
    return _sandboxToken(j['public_token'], 'public-sandbox-');
  }

  @override
  Future<({String accessToken, String itemId})> exchangePublicToken(String publicToken) async {
    final j = await _post('/item/public_token/exchange', {'public_token': publicToken});
    return (accessToken: _sandboxToken(j['access_token'], 'access-sandbox-'), itemId: j['item_id'] as String);
  }

  @override
  Future<({String? institutionName, List<LinkedBankAccount> accounts})> getAccounts({
    required String accessToken,
    required String itemId,
  }) async {
    final j = await _post('/accounts/get', {'access_token': _sandboxToken(accessToken, 'access-sandbox-')});
    final item = j['item'] as Map<String, dynamic>?;
    return (
      institutionName: item?['institution_name'] as String?,
      accounts: [
        for (final a in j['accounts'] as List<dynamic>) _account(a as Map<String, dynamic>, itemId),
      ],
    );
  }

  @override
  Future<List<LinkedBankAccount>> getBalances({required String accessToken, required String itemId}) async {
    final j = await _post('/accounts/balance/get', {'access_token': _sandboxToken(accessToken, 'access-sandbox-')});
    return [for (final a in j['accounts'] as List<dynamic>) _account(a as Map<String, dynamic>, itemId)];
  }

  @override
  Future<({List<BankTransaction> transactions, bool ready, bool complete})> syncTransactions(String accessToken) async {
    final token = _sandboxToken(accessToken, 'access-sandbox-');
    final byId = <String, BankTransaction>{};
    var cursor = '';
    String? status;
    // Full sync from the start every time (a few dozen sandbox transactions): follow pages until
    // has_more is false, applying added / modified / removed.
    for (var page = 0; page < 50; page++) {
      final j = await _post('/transactions/sync', {
        'access_token': token,
        'count': 500,
        if (cursor.isNotEmpty) 'cursor': cursor,
      });
      for (final t in [...j['added'] as List<dynamic>, ...j['modified'] as List<dynamic>]) {
        final tx = _transaction(t as Map<String, dynamic>);
        byId[tx.transactionId] = tx;
      }
      for (final r in j['removed'] as List<dynamic>) {
        byId.remove((r as Map<String, dynamic>)['transaction_id']);
      }
      status = j['transactions_update_status'] as String? ?? status;
      cursor = j['next_cursor'] as String? ?? '';
      if (j['has_more'] != true) break;
    }
    // NOT_READY: nothing yet. INITIAL_UPDATE_COMPLETE: only the last ~30 days so far.
    // HISTORICAL_UPDATE_COMPLETE (or no status): everything.
    return (
      transactions: byId.values.toList(),
      ready: status != 'NOT_READY' || byId.isNotEmpty,
      complete: status != 'NOT_READY' && status != 'INITIAL_UPDATE_COMPLETE',
    );
  }

  @override
  Future<({List<RecurringStream> streams, bool ready})> getRecurringStreams(String accessToken) async {
    final j = await _post(
      '/transactions/recurring/get',
      {'access_token': _sandboxToken(accessToken, 'access-sandbox-')},
      alreadyDoneCodes: const {'PRODUCT_NOT_READY'}, // returns {} while Plaid is still preparing them
    );
    if (j.isEmpty) return (streams: const <RecurringStream>[], ready: false);
    return (
      streams: [
        for (final s in j['inflow_streams'] as List<dynamic>? ?? const []) _stream(s as Map<String, dynamic>, inflow: true),
        for (final s in j['outflow_streams'] as List<dynamic>? ?? const []) _stream(s as Map<String, dynamic>, inflow: false),
      ],
      ready: true,
    );
  }

  @override
  Future<void> removeItem(String accessToken) async {
    // Already gone at Plaid (e.g. removed before, or a reset sandbox) counts as removed.
    await _post(
      '/item/remove',
      {'access_token': _sandboxToken(accessToken, 'access-sandbox-')},
      alreadyDoneCodes: const {'ITEM_NOT_FOUND', 'INVALID_ACCESS_TOKEN'},
    );
  }

  /// [alreadyDoneCodes]: Plaid error codes that mean the request's goal is already met; they
  /// return an empty result instead of throwing.
  Future<Map<String, dynamic>> _post(String path, Map<String, Object?> body,
      {Set<String> alreadyDoneCodes = const {}}) async {
    final keys = await _keys();
    if (!keys.isComplete) throw const AppException(kDebugMode ? _notConfiguredDebug : _notConfigured);
    final uri = Uri.https(sandboxHost, path);
    // Defence in depth: nothing may ever leave for a non-sandbox Plaid host.
    if (uri.host != sandboxHost || uri.scheme != 'https') throw StateError('Refusing non-sandbox Plaid request: $uri');

    final http.Response response;
    try {
      response = await _http.post(
        uri,
        headers: const {'Content-Type': 'application/json'},
        body: jsonEncode({'client_id': keys.clientId, 'secret': keys.sandboxSecret, ...body}),
      );
    } on http.ClientException catch (e) {
      throw AppException(_unreachable, cause: e);
    }

    final Map<String, dynamic> json;
    try {
      json = jsonDecode(response.body) as Map<String, dynamic>;
    } on FormatException catch (e) {
      throw AppException(_failed, cause: e);
    }
    if (response.statusCode != 200) {
      // Plaid errors: {error_type, error_code, error_message, display_message, request_id}.
      final display = json['display_message'] as String?;
      final code = json['error_code'] as String?;
      if (alreadyDoneCodes.contains(code)) return const {};
      final message = display ??
          (code == 'INVALID_API_KEYS' ? (kDebugMode ? 'Plaid rejected the sandbox keys (INVALID_API_KEYS).' : _notConfigured) : _failed);
      throw AppException(message, cause: '$path → ${response.statusCode} $code: ${json['error_message']}');
    }
    return json;
  }

  /// Returns [value] if it is a sandbox token with [prefix]; otherwise fails closed.
  static String _sandboxToken(Object? value, String prefix) {
    if (value is String && value.startsWith(prefix)) return value;
    throw const AppException(_failed, cause: 'Plaid returned a non-sandbox token');
  }

  static LinkedBankAccount _account(Map<String, dynamic> a, String itemId) {
    final balances = a['balances'] as Map<String, dynamic>? ?? const {};
    return LinkedBankAccount(
      accountId: a['account_id'] as String,
      itemId: itemId,
      name: a['name'] as String? ?? a['official_name'] as String? ?? 'Account',
      mask: a['mask'] as String?,
      type: a['type'] as String? ?? 'other',
      subtype: a['subtype'] as String?,
      currentBalance: (balances['current'] as num?)?.toDouble(),
      availableBalance: (balances['available'] as num?)?.toDouble(),
      currency: balances['iso_currency_code'] as String?,
    );
  }

  static BankTransaction _transaction(Map<String, dynamic> t) {
    final pfc = t['personal_finance_category'] as Map<String, dynamic>?;
    return BankTransaction(
      transactionId: t['transaction_id'] as String,
      accountId: t['account_id'] as String,
      amount: (t['amount'] as num).toDouble(),
      date: DateTime.parse(t['date'] as String),
      name: t['name'] as String? ?? '',
      merchantName: t['merchant_name'] as String?,
      pending: t['pending'] as bool? ?? false,
      categoryPrimary: pfc?['primary'] as String?,
    );
  }

  static RecurringStream _stream(Map<String, dynamic> s, {required bool inflow}) {
    double amountOf(Object? v) => ((v as Map<String, dynamic>?)?['amount'] as num? ?? 0).toDouble().abs();
    DateTime? dateOf(Object? v) => v is String ? DateTime.tryParse(v) : null;
    final pfc = s['personal_finance_category'] as Map<String, dynamic>?;
    return RecurringStream(
      streamId: s['stream_id'] as String,
      accountId: s['account_id'] as String,
      description: s['description'] as String? ?? '',
      merchantName: s['merchant_name'] as String?,
      frequency: s['frequency'] as String? ?? 'UNKNOWN',
      averageAmount: amountOf(s['average_amount']),
      lastAmount: amountOf(s['last_amount']),
      lastDate: dateOf(s['last_date']),
      nextDate: dateOf(s['predicted_next_date']),
      isActive: s['is_active'] as bool? ?? false,
      isInflow: inflow,
      categoryPrimary: pfc?['primary'] as String?,
      transactionIds: [for (final id in s['transaction_ids'] as List<dynamic>? ?? const []) id as String],
    );
  }
}
