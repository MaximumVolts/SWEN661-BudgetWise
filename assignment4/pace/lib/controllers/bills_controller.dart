import '../models/bill.dart' show BillItem, BillsUpcomingData, RecurringData, RecurringItem;
import '../services/bill_service.dart' show BillService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;
import 'recurring_actions.dart' show RecurringActions;

/// Bills: upcoming payments and the recurring list (bills and subscriptions). One controller
/// powers both tabs; it reloads whenever a bill or subscription changes anywhere.
class BillsController extends ScreenController with RecurringActions {
  final BillService _service;
  BillsController({required BillService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    refreshOn(_service.changes);
  }

  @override
  BillService get billService => _service;

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
  void openSubscription(RecurringItem item) => navigator.openBill(item.id);
  void addBill() => navigator.openAddBill();

  /// The item's menu: the service decides which actions it offers.
  Future<void> openSubscriptionMenu(RecurringItem item) async {
    final action = await navigator.openRecurringMenu(item.name, _service.actionsFor(item));
    if (action != null) await runRecurringAction(action, id: item.id, name: item.name);
  }

  Future<void> setPaused(RecurringItem item, bool paused) =>
      perform(() => _service.setSubscriptionPaused(id: item.id, paused: paused));
}
