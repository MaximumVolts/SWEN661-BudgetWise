/// Bank data linked through Plaid (sandbox only in this prototype), as stored on the device.
library;

/// One of Plaid's *published* sandbox test users
/// (https://plaid.com/docs/sandbox/test-credentials/). Public documentation values that only
/// work against Plaid's sandbox; never real bank credentials. Mirrors a row of the
/// plaid_sandbox_test_credentials table in database/schema.sql.
class SandboxTestCredentials {
  /// Matches plaid_sandbox_test_credentials.label.
  final String label;
  final String username;
  final String password;
  const SandboxTestCredentials({required this.label, required this.username, required this.password});

  /// "Sandbox simple test credentials": basic account access to most Plaid products.
  static const simple = SandboxTestCredentials(label: 'simple', username: 'user_good', password: 'pass_good');
}

/// One bank login linked through Plaid (a Plaid "Item").
class LinkedItem {
  final String itemId;
  /// The Pace account that linked it.
  final String userId;
  final String? institutionId;
  final String institutionName;
  /// Plaid access token (sandbox: `access-sandbox-…`). Secret: never shown in the UI.
  final String accessToken;
  /// Label of the [SandboxTestCredentials] that created the Item (bank_connections.sandbox_test_credentials_id).
  final String sandboxCredentialsLabel;
  final DateTime linkedAt;
  const LinkedItem({
    required this.itemId,
    required this.userId,
    required this.institutionName,
    required this.accessToken,
    required this.sandboxCredentialsLabel,
    required this.linkedAt,
    this.institutionId,
  });
}

/// One account inside a [LinkedItem] (checking, savings, credit card…).
class LinkedBankAccount {
  final String accountId;
  final String itemId;
  final String name;
  /// Last digits of the account number, e.g. "0000".
  final String? mask;
  final String type; // depository, credit, loan, investment, other
  final String? subtype; // checking, savings, credit card…
  final double? currentBalance;
  final double? availableBalance;
  final String? currency;
  const LinkedBankAccount({
    required this.accountId,
    required this.itemId,
    required this.name,
    required this.type,
    this.mask,
    this.subtype,
    this.currentBalance,
    this.availableBalance,
    this.currency,
  });
}

/// A linked bank as shown to the user (e.g. on Profile). No tokens or account numbers.
class BankConnection {
  final String itemId;
  final String institutionName;
  final int accountCount;
  /// e.g. "Oct 12".
  final String linkedOnLabel;
  /// Always true in this prototype: only Plaid Sandbox test banks can be linked.
  final bool isSandbox;
  const BankConnection({
    required this.itemId,
    required this.institutionName,
    required this.accountCount,
    required this.linkedOnLabel,
    this.isSandbox = true,
  });
}

/// One of Plaid's sandbox test banks that can be linked (Accounts → Add an account).
class SandboxInstitution {
  /// Plaid's institution id, e.g. "ins_109508".
  final String id;
  final String name;
  /// Already connected for the signed-in user (each test bank can be linked once).
  final bool isLinked;
  const SandboxInstitution({required this.id, required this.name, this.isLinked = false});
}
