import '../models/money.dart' show Money;
import '../models/user_preferences.dart' show BillReminder, UserPreferences;
import '../repositories/device_notifications.dart' show DeviceNotifications;
import 'bill_service.dart' show BillService;
import 'calendar.dart' show Calendar;
import 'date_labels.dart' show DateLabels;

/// What happened when the user asked for a test reminder.
enum TestReminderResult {
  sent,
  /// Notifications are turned off for Pace (or the user declined the permission).
  blocked,
}

/// Bill reminders as push notifications.
/// BUSINESS RULES: one reminder per upcoming (not overdue) bill, at 9 AM on the day the user's
/// reminder setting says (the due date, or 1, 3 or 7 days before); none when reminders are off or
/// nobody is signed in; a reminder whose time has already passed isn't sent (the in-app
/// notifications cover it).
class BillReminderService {
  static const reminderHour = 9;
  static const _testId = 0;

  final BillService _bills;
  final Future<UserPreferences> Function() _preferences;
  final bool Function() _isSignedIn;
  final DeviceNotifications _device;
  final DateTime Function() _now;

  BillReminderService({
    required BillService bills,
    required Future<UserPreferences> Function() preferences,
    required bool Function() isSignedIn,
    required DeviceNotifications device,
    DateTime Function()? now,
  })  : _bills = bills,
        _preferences = preferences,
        _isSignedIn = isSignedIn,
        _device = device,
        _now = now ?? DateTime.now;

  /// "Rent is due in 3 days" / "…due tomorrow" / "…due today".
  static String titleFor(String bill, int daysBefore) => switch (daysBefore) {
        0 => '$bill is due today',
        1 => '$bill is due tomorrow',
        _ => '$bill is due in $daysBefore days',
      };

  /// Replaces the scheduled reminders with ones for the bills coming up now. Call when the
  /// bills, the reminder setting or the signed-in user may have changed.
  Future<void> reschedule() async {
    await _device.cancelAll();
    if (!_isSignedIn()) return;
    final days = (await _preferences()).billReminder.days;
    if (days == null) return;
    final now = _now();
    var id = 1; // 0 is the test reminder
    for (final (:bill, :due) in await _bills.upcomingWithDates()) {
      if (bill.isOverdue) continue;
      final day = Calendar.addDays(Calendar.dateOnly(due), -days);
      final at = DateTime(day.year, day.month, day.day, reminderHour);
      if (!at.isAfter(now)) continue;
      await _device.schedule(
        id: id++,
        title: titleFor(bill.title, days),
        body: '${Money.format(bill.amount)} · due ${DateLabels.short(due)}',
        at: at,
      );
    }
  }

  /// Asks for permission if needed, then shows a sample reminder right away (for the next bill
  /// when there is one).
  Future<TestReminderResult> sendTest() async {
    if (!await _device.requestPermission()) return TestReminderResult.blocked;
    final next = (await _bills.upcomingWithDates()).where((u) => !u.bill.isOverdue).firstOrNull;
    final today = Calendar.dateOnly(_now());
    await _device.show(
      id: _testId,
      title: next == null
          ? 'Bill reminders are working'
          : 'Test: ${titleFor(next.bill.title, Calendar.daysBetween(today, Calendar.dateOnly(next.due)))}',
      body: next == null
          ? "You'll be reminded before your bills are due."
          : '${Money.format(next.bill.amount)} · due ${DateLabels.short(next.due)}',
    );
    return TestReminderResult.sent;
  }

  /// Turning reminders on: asks for notification permission. False when it's blocked, so the
  /// user can be told reminders will only show inside Pace.
  Future<bool> enable(BillReminder reminder) async => reminder == BillReminder.off || await _device.requestPermission();
}
