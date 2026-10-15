import '../models/linked_bank.dart' show LinkedBankAccount, LinkedItem;

/// Data-access layer for banks linked through Plaid: only reads and writes records, no business
/// rules (those live in BankLinkService).
abstract class LinkedBankRepository {
  Future<List<LinkedItem>> itemsFor(String userId);
  Future<List<LinkedBankAccount>> accountsFor(String userId);
  /// Inserts or replaces [item] and replaces all of its accounts with [accounts].
  Future<void> saveItem(LinkedItem item, List<LinkedBankAccount> accounts);
  /// Removes the item and its accounts.
  Future<void> deleteItem(String itemId);
}

/// Session-only storage, used by tests.
class InMemoryLinkedBankRepository implements LinkedBankRepository {
  final _items = <LinkedItem>[];
  final _accounts = <LinkedBankAccount>[];

  @override
  Future<List<LinkedItem>> itemsFor(String userId) async => [for (final i in _items) if (i.userId == userId) i];

  @override
  Future<List<LinkedBankAccount>> accountsFor(String userId) async {
    final ids = {for (final i in _items) if (i.userId == userId) i.itemId};
    return [for (final a in _accounts) if (ids.contains(a.itemId)) a];
  }

  @override
  Future<void> saveItem(LinkedItem item, List<LinkedBankAccount> accounts) async {
    await deleteItem(item.itemId);
    _items.add(item);
    _accounts.addAll(accounts);
  }

  @override
  Future<void> deleteItem(String itemId) async {
    _items.removeWhere((i) => i.itemId == itemId);
    _accounts.removeWhere((a) => a.itemId == itemId);
  }
}
