import '../models/bank_data.dart' show BankTransaction, RecurringStream;
import '../models/linked_bank.dart' show LinkedBankAccount, SandboxTestCredentials;

/// The Plaid API calls Pace needs. The only implementation is SandboxPlaidApi: this prototype
/// never talks to Plaid's development or production environments.
abstract class PlaidApi {
  /// Sandbox-only shortcut that skips Plaid Link: creates a public token for a test institution,
  /// signed in as one of Plaid's published sandbox test users ([credentials]).
  Future<String> createSandboxPublicToken({
    required String institutionId,
    required List<String> products,
    required SandboxTestCredentials credentials,
  });

  /// Swaps a public token for a long-lived access token.
  Future<({String accessToken, String itemId})> exchangePublicToken(String publicToken);

  /// The Item's accounts (with [LinkedBankAccount.itemId] set to [itemId]) and institution name.
  Future<({String? institutionName, List<LinkedBankAccount> accounts})> getAccounts({
    required String accessToken,
    required String itemId,
  });

  /// Live balances for every account in the Item (`/accounts/balance/get`).
  Future<List<LinkedBankAccount>> getBalances({required String accessToken, required String itemId});

  /// All of the Item's transactions (`/transactions/sync`, following every page). After a new link
  /// Plaid delivers them in two steps: `ready` is false until the first (recent ~30 days) batch is
  /// available, and `complete` is false until the full history has arrived as well.
  Future<({List<BankTransaction> transactions, bool ready, bool complete})> syncTransactions(String accessToken);

  /// The Item's recurring income and expense streams (`/transactions/recurring/get`). `ready` is
  /// false while Plaid is still preparing them after a new link.
  Future<({List<RecurringStream> streams, bool ready})> getRecurringStreams(String accessToken);

  /// Disconnects the Item at Plaid (`/item/remove`): its access token stops working.
  /// Succeeds if Plaid no longer knows the Item / token.
  Future<void> removeItem(String accessToken);
}
