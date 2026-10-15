import 'package:flutter/foundation.dart' show protected;
import '../models/recurring.dart' show RecurringAction;
import '../services/bill_service.dart' show BillService;
import 'base_controller.dart' show ScreenController;

/// Carries out what the user picks for a bill or subscription (from its menu on the Bills screen,
/// or on its details page). The service decides what's allowed; this only dispatches.
mixin RecurringActions on ScreenController {
  BillService get billService;

  /// Called after the expense was deleted (e.g. to leave its details page).
  @protected
  void onRecurringDeleted() {}

  Future<void> runRecurringAction(RecurringAction action, {required String id, required String name}) async {
    switch (action) {
      case RecurringAction.details:
        navigator.openBill(id);
      case RecurringAction.markPaid:
        await perform(() => billService.markPaid(id));
      case RecurringAction.pause:
      case RecurringAction.resume:
        await perform(() => billService.setSubscriptionPaused(id: id, paused: action == RecurringAction.pause));
      case RecurringAction.edit:
        navigator.openEditBill(id);
      case RecurringAction.delete:
        if (!await navigator.confirmDeleteRecurring(name)) return;
        if (await perform(() => billService.deleteRecurring(id))) onRecurringDeleted();
    }
  }
}
