// Bill reminders: push notifications scheduled from the user's bills and reminder setting, the
// Settings test button, and the in-app notifications following the same setting.
import 'package:flutter_test/flutter_test.dart' show expect, group, isEmpty, setUp, test;
import 'package:pace_app/models/bill.dart' show BillItem;
import 'package:pace_app/models/budget.dart' show BudgetOverview, BudgetStatus, BudgetSummary;
import 'package:pace_app/models/notification.dart' show NotificationKind;
import 'package:pace_app/models/user_preferences.dart' show BillReminder, UserPreferences;
import 'package:pace_app/repositories/device_notifications.dart' show InMemoryDeviceNotifications;
import 'package:pace_app/services/bill_reminder_service.dart' show BillReminderService, TestReminderResult;
import 'package:pace_app/services/bill_service.dart' show BillService;
import 'package:pace_app/services/budget_service.dart' show BudgetService;
import 'package:pace_app/services/plaid_notification_service.dart' show PlaidNotificationService;

/// Bills due on fixed dates (the only part of BillService reminders use).
class _Bills implements BillService {
  List<({BillItem bill, DateTime due})> upcoming = const [];
  @override
  Future<List<({BillItem bill, DateTime due})>> upcomingWithDates() async => upcoming;
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class _NoBudgets implements BudgetService {
  @override
  Future<BudgetOverview> getOverview(String periodId) async => const BudgetOverview(
      summary: BudgetSummary(periodLabel: '', spent: 0, limit: 0, status: BudgetStatus.onTrack), categories: []);
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

({BillItem bill, DateTime due}) _bill(String name, DateTime due, {bool overdue = false}) =>
    (bill: BillItem(id: name, title: name, subtitle: 'Monthly', amount: 50, iconKey: 'bills', isOverdue: overdue), due: due);

void main() {
  final now = DateTime(2026, 10, 12, 10); // Monday 10 AM
  late _Bills bills;
  late InMemoryDeviceNotifications device;
  var prefs = const UserPreferences();
  var signedIn = true;
  late BillReminderService reminders;

  setUp(() {
    bills = _Bills()
      ..upcoming = [
        _bill('Late fee', DateTime(2026, 10, 1), overdue: true),
        _bill('Phone', DateTime(2026, 10, 14)), // 3 days before is Oct 11: already passed
        _bill('Rent', DateTime(2026, 10, 20)),
        _bill('Gym', DateTime(2026, 11, 3)),
      ];
    device = InMemoryDeviceNotifications();
    prefs = const UserPreferences();
    signedIn = true;
    reminders = BillReminderService(
        bills: bills, preferences: () async => prefs, isSignedIn: () => signedIn, device: device, now: () => now);
  });

  group('scheduling', () {
    test('one reminder per upcoming bill, at 9 AM the chosen number of days before', () async {
      await reminders.reschedule();
      expect([for (final n in device.scheduled) (n.title, n.at)], [
        ('Rent is due in 3 days', DateTime(2026, 10, 17, 9)),
        ('Gym is due in 3 days', DateTime(2026, 10, 31, 9)),
      ]); // not the overdue fee, nor Phone (its reminder time has passed)
      expect(device.scheduled.first.body, r'$50.00 · due Oct 20');
    });

    test('follows the setting: on the due date, a week before, or off', () async {
      prefs = const UserPreferences(billReminder: BillReminder.onDueDate);
      await reminders.reschedule();
      expect([for (final n in device.scheduled) n.title], ['Phone is due today', 'Rent is due today', 'Gym is due today']);

      prefs = const UserPreferences(billReminder: BillReminder.oneWeek);
      await reminders.reschedule();
      expect([for (final n in device.scheduled) n.at], [DateTime(2026, 10, 13, 9), DateTime(2026, 10, 27, 9)]);

      prefs = const UserPreferences(billReminder: BillReminder.off);
      await reminders.reschedule();
      expect(device.scheduled, isEmpty);
    });

    test('rescheduling replaces the old reminders; signing out clears them', () async {
      await reminders.reschedule();
      bills.upcoming = [_bill('Rent', DateTime(2026, 10, 20))];
      await reminders.reschedule();
      expect(device.scheduled.length, 1);
      signedIn = false;
      await reminders.reschedule();
      expect(device.scheduled, isEmpty);
    });
  });

  group('test reminder', () {
    test('shows the next bill right away', () async {
      expect(await reminders.sendTest(), TestReminderResult.sent);
      expect(device.shown.single.title, 'Test: Phone is due in 2 days');
      expect(device.shown.single.body, r'$50.00 · due Oct 14');
    });

    test('with no bills it still shows one', () async {
      bills.upcoming = const [];
      await reminders.sendTest();
      expect(device.shown.single.title, 'Bill reminders are working');
    });

    test('when notifications are blocked it says so and shows nothing', () async {
      device.permitted = false;
      expect(await reminders.sendTest(), TestReminderResult.blocked);
      expect(device.shown, isEmpty);
      expect(await reminders.enable(BillReminder.threeDays), false);
      expect(await reminders.enable(BillReminder.off), true); // turning off needs no permission
    });
  });

  test('in-app notifications use the same reminder window', () async {
    Future<List<String>> reminderTitles() async => [
          for (final n in (await PlaidNotificationService(bills, _NoBudgets(), preferences: () async => prefs, now: () => now)
                  .getNotifications(filterIndex: 0))
              .items)
            if (n.kind == NotificationKind.reminder) n.title,
        ];
    bills.upcoming = [_bill('Phone', DateTime(2026, 10, 14)), _bill('Water', DateTime(2026, 10, 17))];
    expect(await reminderTitles(), ['Phone is due in 2 days']); // 3 days before (default)
    prefs = const UserPreferences(billReminder: BillReminder.oneWeek);
    expect(await reminderTitles(), ['Phone is due in 2 days', 'Water is due in 5 days']);
    prefs = const UserPreferences(billReminder: BillReminder.off);
    expect(await reminderTitles(), isEmpty);
  });
}
