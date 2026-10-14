import '../models/linked_bank.dart' show BankConnection, SandboxInstitution;
import '../models/navigation.dart' show LinkOutcome;

/// Bank linking (e.g. Plaid Link).
///
/// BUSINESS RULES: token exchange, duplicate-institution handling, initial sync after linking,
/// what happens next ([LinkOutcome.next]), and removing a connection.
abstract class BankLinkService {
  /// The banks that can be linked, with the ones the signed-in user already has marked.
  Future<List<SandboxInstitution>> institutions();
  /// Links [institutionId] (one of [institutions]), or the first one not linked yet when null.
  /// Throws AppException when it's already linked. `linked == false` means the user cancelled.
  Future<LinkOutcome> startLink({String? institutionId});
  /// The signed-in user's linked banks (empty when none, or when signed out).
  Future<List<BankConnection>> connections();
  /// Disconnects [itemId] at the provider and deletes it (and its accounts) from the device.
  Future<void> removeConnection(String itemId);
  /// Emits when the linked banks' data changes: a bank was linked or removed, or a just-linked
  /// bank's transactions finished loading. Screens that show bank data reload on it.
  Stream<void> get dataUpdates;
}
