import '../models/bill.dart' show BillItem, BillsUpcomingData, RecurringData, RecurringItem;
import '../services/app_navigator.dart' show AppNavigator;
import '../services/bill_service.dart' show BillService;
import 'base_controller.dart' show ScreenController;

/// Serves both the Upcoming and Recurring bills views.
class BillsController extends ScreenController {
  final BillService _service;
  BillsController({required BillService service, required AppNavigator navigator})
      : _service = service,
        super(navigator);

  BillsUpcomingData? upcoming;
  RecurringData? recurring;

  @override
  Future<void> fetch() async {
    final results = await Future.wait([_service.getUpcoming(), _service.getRecurring()]);
    upcoming = results[0] as BillsUpcomingData;
    recurring = results[1] as RecurringData;
  }

  /// 0 = Upcoming, 1 = Recurring
  void selectTab(int index) => navigator.openBills(tab: index);
  void openBill(BillItem b) => navigator.openBill(b.id);

  Future<void> addBill() async {
    if (await navigator.openAddBill()) await refresh();
  }

  Future<void> openSubscriptionMenu(RecurringItem item) async {
    if (await navigator.openSubscriptionMenu(item.id)) await refresh();
  }

  Future<void> setPaused(RecurringItem item, bool paused) async {
    if (await perform(() => _service.setSubscriptionPaused(id: item.id, paused: paused))) await refresh();
  }

  void openSubscription(RecurringItem item) => navigator.openBill(item.id);
}
