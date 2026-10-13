import '../models/bill.dart' show BillItem, BillsUpcomingData, RecurringData, RecurringItem;
import '../models/recurring.dart'
    show BillDetailData, RecurringAction, RecurringFormOptions, RecurringFrequency, RecurringKind;

/// Bills and subscriptions: the recurring payments the bank detects plus the ones the user adds.
///
/// BUSINESS RULES: what counts as a bill vs a subscription, upcoming / overdue / paid, monthly and
/// yearly costs, price changes, which actions an item allows, and validating what the user adds.
abstract class BillService {
  Future<BillsUpcomingData> getUpcoming();
  Future<RecurringData> getRecurring();
  Future<BillDetailData> getDetail(String id);

  /// What the user can do with [item] (its menu).
  List<RecurringAction> actionsFor(RecurringItem item);

  Future<void> markPaid(String billId);
  Future<void> setSubscriptionPaused({required String id, required bool paused});

  /// The add / edit form's choices; [editingId] pre-fills one the user added.
  Future<RecurringFormOptions> formOptions({String? editingId});

  /// Adds a recurring expense ([editingId] null) or updates one the user added. [amount] is the
  /// text as typed. Throws FieldValidationException ('name', 'amount', 'frequency', 'firstDue',
  /// 'category', 'kind').
  Future<void> saveRecurring({
    String? editingId,
    required String name,
    required String amount,
    required RecurringFrequency? frequency,
    required DateTime? firstDue,
    required String? categoryId,
    required RecurringKind? kind,
  });

  /// Deletes a recurring expense the user added.
  Future<void> deleteRecurring(String id);

  /// Upcoming (and overdue) bills with their due dates, soonest first: for other services
  /// (dashboard, notifications) that need the dates, not just the screen labels.
  Future<List<({BillItem bill, DateTime due})>> upcomingWithDates();

  /// Emits after anything changes (added, edited, deleted, paid, paused), so open screens refresh.
  Stream<void> get changes;
}
