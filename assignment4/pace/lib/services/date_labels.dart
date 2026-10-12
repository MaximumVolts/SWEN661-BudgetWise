/// Pre-formatted date labels that services put into models (models carry labels, not dates,
/// so the UI stays locale/date-library agnostic).
class DateLabels {
  static const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /// 2026-10-09 -> Oct 9
  static String short(DateTime d) => '${_months[d.month - 1]} ${d.day}';
}
