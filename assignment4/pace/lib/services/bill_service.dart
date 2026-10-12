import '../models/bill.dart' show BillsUpcomingData, RecurringData;

abstract class BillService {
  Future<BillsUpcomingData> getUpcoming();
  Future<RecurringData> getRecurring();
  Future<void> markPaid(String billId);
  Future<void> setSubscriptionPaused({required String id, required bool paused});
}
