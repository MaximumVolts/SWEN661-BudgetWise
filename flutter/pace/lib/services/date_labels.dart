/// Pre-formatted date labels that services put into models (models carry labels, not dates,
/// so the UI stays locale/date-library agnostic).
class DateLabels {
  static const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  static const _monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  static const _weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /// 2026-10-09 -> Oct 9
  static String short(DateTime d) => '${_months[d.month - 1]} ${d.day}';

  /// 2026-10-09 -> October 9, 2026
  static String long(DateTime d) => '${_monthNames[d.month - 1]} ${d.day}, ${d.year}';

  /// 2026-10-09 -> Fri, Oct 9
  static String weekdayShort(DateTime d) => '${_weekdays[d.weekday - 1]}, ${short(d)}';

  /// 10 -> October
  static String monthName(int month) => _monthNames[month - 1];

  /// 10 -> Oct
  static String monthAbbr(int month) => _months[month - 1];

  /// How long ago [then] was, relative to [now]: "just now", "5 minutes ago", "2 hours ago", "Oct 9".
  static String ago(DateTime then, DateTime now) {
    final d = now.difference(then);
    if (d.inMinutes < 1) return 'just now';
    if (d.inMinutes < 60) return '${d.inMinutes} minute${d.inMinutes == 1 ? '' : 's'} ago';
    if (d.inHours < 24) return '${d.inHours} hour${d.inHours == 1 ? '' : 's'} ago';
    return short(then);
  }
}
