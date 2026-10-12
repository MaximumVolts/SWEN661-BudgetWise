/// Day arithmetic on calendar dates. Adding a `Duration(days: n)` to a local date is wrong across
/// daylight-saving changes (Oct 12 + 30 days would land on Nov 10 at 23:00), so services use these.
class Calendar {
  /// Midnight (local) of [d]'s date.
  static DateTime dateOnly(DateTime d) => DateTime(d.year, d.month, d.day);

  /// [d]'s date moved by [days] calendar days (midnight, local).
  static DateTime addDays(DateTime d, int days) => DateTime(d.year, d.month, d.day + days);

  /// Whole calendar days from [from] to [to] (negative if [to] is earlier).
  static int daysBetween(DateTime from, DateTime to) =>
      DateTime.utc(to.year, to.month, to.day).difference(DateTime.utc(from.year, from.month, from.day)).inDays;
}
