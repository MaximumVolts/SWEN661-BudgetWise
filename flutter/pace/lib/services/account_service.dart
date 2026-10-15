import '../models/account.dart' show AccountsData;

/// BUSINESS RULES: grouping accounts by institution, deciding when a connection is "expired"
/// (reconnect banner), sync freshness labels.
abstract class AccountService {
  Future<AccountsData> getAccounts();
  /// Re-authenticates the expired connection (e.g. Plaid update mode) and re-syncs it.
  Future<void> reconnect();
  Future<void> dismissReconnectBanner();
}
