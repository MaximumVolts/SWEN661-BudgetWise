import 'dart:async' show StreamController, Timer;
import '../models/bank_data.dart' show BankSnapshot, BankTransaction, RecurringStream;
import '../models/linked_bank.dart' show LinkedBankAccount;
import 'plaid_api.dart' show PlaidApi;
import 'linked_bank_repository.dart' show LinkedBankRepository;

/// Bank data (balances, transactions, recurring streams) for the signed-in user's linked banks.
/// Every screen that shows bank information reads it from here.
abstract class BankDataRepository {
  /// The latest data. Cached briefly so several screens opening together share one fetch;
  /// [refresh] forces a new fetch from the bank.
  Future<BankSnapshot> load({bool refresh = false});

  /// Emits when newer data arrives on its own, e.g. when a just-linked bank's transactions
  /// finish loading. Screens showing bank data reload on it.
  Stream<void> get updates;
}

/// [BankDataRepository] that reads everything live from Plaid (**sandbox only**: the [PlaidApi]
/// implementation is SandboxPlaidApi) using the access tokens of the user's linked Items.
///
/// Right after a bank is linked, Plaid prepares the data in stages: recent transactions first (about
/// a month), then the full history, then recurring streams. An incomplete snapshot is never cached
/// as fresh: while it's incomplete this re-checks Plaid every [retryEvery] (up to [maxRetries]
/// times), and emits on [updates] each time a fetch brings different data (each stage as it
/// arrives), so screens such as Home's spending chart fill in without waiting for the last stage.
class PlaidBankDataRepository implements BankDataRepository {
  final PlaidApi _plaid;
  final LinkedBankRepository _banks;
  final String? Function() _currentUserId;
  final DateTime Function() _now;
  final Duration _maxAge;
  final Duration _retryEvery;
  final int _maxRetries;
  final _updates = StreamController<void>.broadcast();

  PlaidBankDataRepository({
    required PlaidApi plaid,
    required LinkedBankRepository banks,
    required String? Function() currentUserId,
    DateTime Function()? now,
    Duration maxAge = const Duration(minutes: 2),
    Duration retryEvery = const Duration(seconds: 3),
    int maxRetries = 40,
  })  : _plaid = plaid,
        _banks = banks,
        _currentUserId = currentUserId,
        _now = now ?? DateTime.now,
        _maxAge = maxAge,
        _retryEvery = retryEvery,
        _maxRetries = maxRetries;

  @override
  Stream<void> get updates => _updates.stream;

  /// Which user + linked Items the cached snapshot belongs to; linking or removing a bank
  /// (or signing in as someone else) changes it, so stale data is never shown.
  String? _cacheKey;
  Future<_Fetched>? _cached;
  DateTime? _cachedAt;
  /// Whether the cached snapshot had everything (full transaction history and recurring streams).
  bool _cachedComplete = false;
  /// What the last fetch for [_cacheKey] returned, to tell when new data has arrived.
  String? _lastShape;

  Timer? _retry;
  int _retries = 0;

  @override
  Future<BankSnapshot> load({bool refresh = false}) async {
    final userId = _currentUserId();
    if (userId == null) return BankSnapshot.empty(_now());
    final items = await _banks.itemsFor(userId);
    if (items.isEmpty) return BankSnapshot.empty(_now());

    final key = '$userId|${[for (final i in items) i.itemId].join(',')}';
    final sameItems = key == _cacheKey && _cached != null;
    final fresh = _cachedAt != null && _now().difference(_cachedAt!) < _maxAge;
    // An incomplete snapshot is only reused while its fetch is still in flight.
    if (!refresh && sameItems && (_cachedAt == null || (fresh && _cachedComplete))) return (await _cached!).snapshot;
    if (key != _cacheKey) {
      _retry?.cancel();
      _retries = 0;
      _lastShape = null;
    }

    _cacheKey = key;
    _cachedAt = null; // in flight
    final pending = _fetch({for (final i in items) i.itemId: (token: i.accessToken, name: i.institutionName)});
    _cached = pending;
    try {
      final fetched = await pending;
      if (identical(_cached, pending)) {
        _cachedAt = _now();
        _cachedComplete = fetched.complete;
        _announceIfChanged(fetched);
        _scheduleRetry(key, fetched.complete);
      }
      return fetched.snapshot;
    } on Object {
      // Don't cache failures: the next load tries the bank again.
      if (identical(_cached, pending)) {
        _cached = null;
        _cachedAt = null;
      }
      rethrow;
    }
  }

  /// Tells screens to reload when this fetch brought different data than the previous one for the
  /// same user and banks (a new stage from Plaid). The first fetch isn't announced: whoever asked
  /// for it gets the data directly.
  void _announceIfChanged(_Fetched fetched) {
    final s = fetched.snapshot;
    final shape = [
      s.accounts.length,
      s.transactions.length,
      s.recurring.length,
      s.transactionsReady,
      fetched.complete,
    ].join('|');
    final changed = _lastShape != null && shape != _lastShape;
    _lastShape = shape;
    if (changed) _updates.add(null);
  }

  /// While Plaid is still preparing data, fetch again shortly.
  void _scheduleRetry(String key, bool complete) {
    _retry?.cancel();
    if (complete) {
      _retries = 0;
      return;
    }
    if (_retries >= _maxRetries) return;
    _retries++;
    _retry = Timer(_retryEvery, () async {
      if (key != _cacheKey) return; // signed out, or banks changed: a new load takes over
      try {
        await load(refresh: true);
      } on Object {
        // Keep trying on the same schedule; screens show their own error if they load meanwhile.
        if (key == _cacheKey) _scheduleRetry(key, false);
      }
    });
  }

  Future<_Fetched> _fetch(Map<String, ({String token, String name})> items) async {
    final accounts = <LinkedBankAccount>[];
    final transactions = <BankTransaction>[];
    final recurring = <RecurringStream>[];
    var transactionsReady = true;
    var historyComplete = true;
    var recurringReady = true;
    for (final entry in items.entries) {
      final token = entry.value.token;
      final results = await Future.wait<Object>([
        _plaid.getBalances(accessToken: token, itemId: entry.key),
        _plaid.syncTransactions(token),
        _plaid.getRecurringStreams(token),
      ]);
      accounts.addAll(results[0] as List<LinkedBankAccount>);
      final tx = results[1] as ({List<BankTransaction> transactions, bool ready, bool complete});
      final rec = results[2] as ({List<RecurringStream> streams, bool ready});
      transactions.addAll(tx.transactions);
      recurring.addAll(rec.streams);
      transactionsReady = transactionsReady && tx.ready;
      historyComplete = historyComplete && tx.complete;
      recurringReady = recurringReady && rec.ready;
    }
    transactions.sort((a, b) => b.date.compareTo(a.date)); // newest first
    return _Fetched(
      BankSnapshot(
        institutions: {for (final e in items.entries) e.key: e.value.name},
        accounts: accounts,
        transactions: transactions,
        recurring: recurring,
        transactionsReady: transactionsReady,
        fetchedAt: _now(),
      ),
      complete: transactionsReady && historyComplete && recurringReady,
    );
  }
}

class _Fetched {
  final BankSnapshot snapshot;
  final bool complete;
  const _Fetched(this.snapshot, {required this.complete});
}
