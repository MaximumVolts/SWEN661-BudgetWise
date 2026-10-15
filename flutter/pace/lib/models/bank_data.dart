/// Bank data read from Plaid (sandbox only in this prototype) for the signed-in user.
library;

import 'linked_bank.dart' show LinkedBankAccount;

/// One transaction from Plaid's /transactions/sync.
class BankTransaction {
  final String transactionId;
  final String accountId;
  /// Plaid's sign convention: positive = money out of the account, negative = money in.
  final double amount;
  final DateTime date;
  /// Raw bank descriptor, e.g. "Uber 063015 SF**POOL**".
  final String name;
  final String? merchantName;
  final bool pending;
  /// Plaid personal_finance_category.primary, e.g. "FOOD_AND_DRINK".
  final String? categoryPrimary;
  const BankTransaction({
    required this.transactionId,
    required this.accountId,
    required this.amount,
    required this.date,
    required this.name,
    this.merchantName,
    this.pending = false,
    this.categoryPrimary,
  });

  /// The app's sign convention (TransactionItem): negative = money out, positive = money in.
  double get signedAmount => -amount;
  String get displayName => (merchantName == null || merchantName!.isEmpty) ? name : merchantName!;
}

/// A recurring stream from Plaid's /transactions/recurring/get (a bill, subscription or paycheck).
class RecurringStream {
  final String streamId;
  final String accountId;
  final String description;
  final String? merchantName;
  /// WEEKLY, BIWEEKLY, SEMI_MONTHLY, MONTHLY, ANNUALLY or UNKNOWN.
  final String frequency;
  /// Always positive; [isInflow] says which direction.
  final double averageAmount;
  final double lastAmount;
  final DateTime? lastDate;
  final DateTime? nextDate;
  final bool isActive;
  final bool isInflow;
  final String? categoryPrimary;
  /// Transactions Plaid grouped into this stream.
  final List<String> transactionIds;
  const RecurringStream({
    required this.streamId,
    required this.accountId,
    required this.description,
    required this.frequency,
    required this.averageAmount,
    required this.lastAmount,
    required this.isActive,
    required this.isInflow,
    this.merchantName,
    this.lastDate,
    this.nextDate,
    this.categoryPrimary,
    this.transactionIds = const [],
  });

  String get displayName => (merchantName == null || merchantName!.isEmpty) ? description : merchantName!;
}

/// Everything Plaid returned for the signed-in user's linked banks, fetched together.
class BankSnapshot {
  /// itemId -> institution name, for every linked bank.
  final Map<String, String> institutions;
  final List<LinkedBankAccount> accounts;
  final List<BankTransaction> transactions;
  final List<RecurringStream> recurring;
  /// False while Plaid is still preparing transactions after a new link (a few seconds).
  final bool transactionsReady;
  final DateTime fetchedAt;
  const BankSnapshot({
    required this.institutions,
    required this.accounts,
    required this.transactions,
    required this.recurring,
    required this.transactionsReady,
    required this.fetchedAt,
  });

  static BankSnapshot empty(DateTime now) => BankSnapshot(
        institutions: const {},
        accounts: const [],
        transactions: const [],
        recurring: const [],
        transactionsReady: true,
        fetchedAt: now,
      );

  bool get isLinked => institutions.isNotEmpty;

  LinkedBankAccount? account(String accountId) {
    for (final a in accounts) {
      if (a.accountId == accountId) return a;
    }
    return null;
  }
}
