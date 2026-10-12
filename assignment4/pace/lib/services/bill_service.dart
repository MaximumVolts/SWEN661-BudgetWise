import '../models/bill.dart' show BillItem, BillsUpcomingData, RecurringData;

abstract class BillService {
  Future<BillsUpcomingData> getUpcoming();
  Future<RecurringData> getRecurring();
  Future<void> markPaid(String billId);
  Future<void> setSubscriptionPaused({required String id, required bool paused});

  /// Upcoming (and overdue) bills with their due dates, soonest first: for other services
  /// (dashboard, notifications) that need the dates, not just the screen labels.
  Future<List<({BillItem bill, DateTime due})>> upcomingWithDates();
}
