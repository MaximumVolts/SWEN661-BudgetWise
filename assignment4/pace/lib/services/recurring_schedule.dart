import '../models/recurring.dart' show RecurringFrequency;
import 'calendar.dart' show Calendar;

/// Date and cost arithmetic for recurring payments, shared by every service that projects them.
class RecurringSchedule {
  RecurringSchedule._();

  /// How many payments a month, on average.
  static double perMonth(RecurringFrequency f) => switch (f) {
        RecurringFrequency.weekly => 52 / 12,
        RecurringFrequency.biweekly => 26 / 12,
        RecurringFrequency.semiMonthly => 2,
        RecurringFrequency.yearly => 1 / 12,
        RecurringFrequency.monthly || RecurringFrequency.unknown => 1,
      };

  /// Roughly how many days between payments (for projections).
  static int periodDays(RecurringFrequency f) => switch (f) {
        RecurringFrequency.weekly => 7,
        RecurringFrequency.biweekly => 14,
        RecurringFrequency.semiMonthly => 15,
        RecurringFrequency.yearly => 365,
        RecurringFrequency.monthly || RecurringFrequency.unknown => 30,
      };

  /// The [n]th payment (0 = [first]), counted from [first] so monthly dates don't drift
  /// (Jan 31 → Feb 28 → Mar 31).
  static DateTime occurrence(DateTime first, RecurringFrequency f, int n) => switch (f) {
        RecurringFrequency.monthly || RecurringFrequency.unknown => _addMonths(first, n),
        RecurringFrequency.yearly => _addMonths(first, 12 * n),
        _ => Calendar.addDays(Calendar.dateOnly(first), n * periodDays(f)),
      };

  /// The first payment on or after [day], for payments starting on [first].
  static DateTime firstOnOrAfter(DateTime first, RecurringFrequency f, DateTime day) {
    var n = 0;
    var d = occurrence(first, f, 0);
    while (d.isBefore(day) && n < 5000) {
      d = occurrence(first, f, ++n);
    }
    return d;
  }

  static DateTime _addMonths(DateTime d, int months) {
    final target = DateTime(d.year, d.month + months);
    final lastDay = DateTime(target.year, target.month + 1, 0).day;
    return DateTime(target.year, target.month, d.day > lastDay ? lastDay : d.day);
  }
}
