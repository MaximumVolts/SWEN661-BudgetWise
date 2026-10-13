import '../models/plaid_keys.dart' show PlaidKeys;

/// Data-access layer for each user's Plaid sandbox keys. No business rules (the format checks
/// live in the services that accept keys).
abstract class PlaidKeyRepository {
  /// [userId]'s keys, or null if they haven't entered any.
  Future<PlaidKeys?> load(String userId);

  /// Stores [keys] for [userId], replacing any they had.
  Future<void> save(String userId, PlaidKeys keys);
}

/// Session-only storage, used by tests and when accounts aren't stored on device.
class InMemoryPlaidKeyRepository implements PlaidKeyRepository {
  final _byUser = <String, PlaidKeys>{};

  @override
  Future<PlaidKeys?> load(String userId) async => _byUser[userId];

  @override
  Future<void> save(String userId, PlaidKeys keys) async => _byUser[userId] = keys;
}
