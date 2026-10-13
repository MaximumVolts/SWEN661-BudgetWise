import '../models/linked_bank.dart' show BankConnection;
import '../models/navigation.dart' show LinkOutcome;

/// Bank linking (e.g. Plaid Link).
///
/// BUSINESS RULES: token exchange, duplicate-institution handling, initial sync after linking,
/// what happens next ([LinkOutcome.next]), and removing a connection.
abstract class BankLinkService {
  /// Runs the linking flow. `linked == false` means the user cancelled.
  Future<LinkOutcome> startLink();
  /// The signed-in user's linked banks (empty when none, or when signed out).
  Future<List<BankConnection>> connections();
  /// Disconnects [itemId] at the provider and deletes it (and its accounts) from the device.
  Future<void> removeConnection(String itemId);
  /// Emits when a linked bank's data changes on its own, e.g. when a just-linked bank's
  /// transactions finish loading. Screens that show bank data reload on it.
  Stream<void> get dataUpdates;
}
