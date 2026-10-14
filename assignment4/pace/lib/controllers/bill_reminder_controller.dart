import '../services/bank_link_service.dart' show BankLinkService;
import '../services/bill_reminder_service.dart' show BillReminderService;
import '../services/bill_service.dart' show BillService;
import '../services/settings_service.dart' show SettingsService;
import 'base_controller.dart' show BaseController;

/// App-wide: keeps the phone's scheduled bill reminders up to date. Reschedules on start and
/// whenever something they depend on changes: the reminder setting or the signed-in user (both
/// arrive as preference changes), new bank data, or a bill being added, paid or paused.
class BillReminderController extends BaseController {
  final BillReminderService _reminders;
  BillReminderController({
    required BillReminderService reminders,
    required SettingsService settings,
    required BankLinkService bankLink,
    required BillService bills,
  }) : _reminders = reminders {
    for (final events in [settings.preferenceChanges, bankLink.dataUpdates, bills.changes]) {
      listen(events, (_) => refresh());
    }
  }

  @override
  Future<void> fetch() => _reminders.reschedule();
}
