import '../models/navigation.dart' show FlowStep, LinkOutcome;

/// Bank linking (e.g. Plaid Link).
///
/// BUSINESS RULES: token exchange, duplicate-institution handling, initial sync after linking,
/// and what happens next ([LinkOutcome.next]).
abstract class BankLinkService {
  /// Runs the linking flow. `linked == false` means the user cancelled.
  Future<LinkOutcome> startLink();
  /// The user chose "Not now". Records the choice and returns where to go next.
  Future<FlowStep> skipLinking();
}
