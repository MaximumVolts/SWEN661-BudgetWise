import '../models/recurring.dart' show BillDetailData, BillPayment, RecurringAction;
import '../services/bill_service.dart' show BillService;
import 'app_navigator.dart' show AppNavigator;
import 'base_controller.dart' show ScreenController;
import 'recurring_actions.dart' show RecurringActions;

/// One bill or subscription: its details, payment history and actions.
class BillDetailController extends ScreenController with RecurringActions {
  final BillService _service;
  final String billId;
  BillDetailController({required this.billId, required BillService service, required AppNavigator navigator})
      : _service = service,
        super(navigator) {
    refreshOn(_service.changes);
  }

  @override
  BillService get billService => _service;

  BillDetailData? data;

  @override
  Future<void> fetch() async => data = await _service.getDetail(billId);

  Future<void> _run(RecurringAction action) async {
    final d = data;
    if (d != null) await runRecurringAction(action, id: d.id, name: d.name);
  }

  Future<void> markPaid() => _run(RecurringAction.markPaid);
  Future<void> togglePaused() => _run(data?.isPaused == true ? RecurringAction.resume : RecurringAction.pause);
  Future<void> edit() => _run(RecurringAction.edit);
  Future<void> delete() => _run(RecurringAction.delete);

  void openPayment(BillPayment p) => navigator.openTransaction(p.transactionId);

  @override
  void onRecurringDeleted() => navigator.back();
}
