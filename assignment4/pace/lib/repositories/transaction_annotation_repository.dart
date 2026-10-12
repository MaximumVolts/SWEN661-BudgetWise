/// The user's own edits on top of bank transactions: chosen categories, a note, bills marked paid
/// and subscriptions marked paused. Banks never see these; they're Pace's annotations.
abstract class TransactionAnnotationRepository {
  /// The categories the user chose for a transaction, in order; the first is the primary one.
  Future<List<String>?> categoryOverride(String transactionId);
  Future<Map<String, List<String>>> categoryOverrides();
  Future<void> setCategoryOverride(String transactionId, List<String> categoryIds);
  Future<String?> note(String transactionId);
  /// Every note, by transaction id (for searching).
  Future<Map<String, String>> notes();
  Future<void> setNote(String transactionId, String note);
  /// Recurring stream ids → the due date the user marked as paid.
  Future<Map<String, DateTime>> paidBills();
  Future<void> markBillPaid(String streamId, DateTime dueDate);
  Future<Set<String>> pausedSubscriptions();
  Future<void> setSubscriptionPaused(String streamId, bool paused);
}

/// Session-only storage for annotations (lost when the app restarts).
class InMemoryTransactionAnnotationRepository implements TransactionAnnotationRepository {
  final _categories = <String, List<String>>{};
  final _notes = <String, String>{};
  final _paid = <String, DateTime>{};
  final _paused = <String>{};

  @override
  Future<List<String>?> categoryOverride(String transactionId) async => _categories[transactionId];
  @override
  Future<Map<String, List<String>>> categoryOverrides() async => Map.unmodifiable(_categories);
  @override
  Future<void> setCategoryOverride(String transactionId, List<String> categoryIds) async =>
      _categories[transactionId] = List.unmodifiable(categoryIds);
  @override
  Future<String?> note(String transactionId) async => _notes[transactionId];
  @override
  Future<Map<String, String>> notes() async => Map.unmodifiable(_notes);
  @override
  Future<void> setNote(String transactionId, String note) async => _notes[transactionId] = note;
  @override
  Future<Map<String, DateTime>> paidBills() async => Map.unmodifiable(_paid);
  @override
  Future<void> markBillPaid(String streamId, DateTime dueDate) async => _paid[streamId] = dueDate;
  @override
  Future<Set<String>> pausedSubscriptions() async => Set.unmodifiable(_paused);
  @override
  Future<void> setSubscriptionPaused(String streamId, bool paused) async =>
      paused ? _paused.add(streamId) : _paused.remove(streamId);
}
