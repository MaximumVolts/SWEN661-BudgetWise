import '../models/money.dart' show Money;

/// Display formatting for screens: they receive raw numbers (double) and format them here, so
/// locale-aware formatting can be swapped in one place later. Money text itself comes from [Money],
/// shared with the services' pre-formatted labels.
class Fmt {
  Fmt._();

  /// Shown in place of a value the repository didn't provide.
  static const missing = '--';

  /// [money], or [missing] when [v] is null.
  static String moneyOrMissing(double? v, {int decimals = 2}) => v == null ? missing : money(v, decimals: decimals);

  /// 1234.5 -> $1,234.50   (negative values get a leading minus)
  static String money(double v, {int decimals = 2}) => Money.format(v, decimals: decimals);

  /// Always shows a sign: +$2,145.00 / −$40.00
  static String signed(double v, {int decimals = 2}) => Money.signed(v, decimals: decimals);

  /// What's left of a budget: "$40.00 left", or "$12.50 over" when [remaining] is negative.
  static String leftOrOver(double remaining, {int decimals = 2}) => remaining >= 0
      ? '${money(remaining, decimals: decimals)} left'
      : '${money(-remaining, decimals: decimals)} over';

  static String percent(double v, {int decimals = 1}) => '${v.toStringAsFixed(decimals)}%';

  /// 2026-10-12 -> Oct 12, 2026
  static String date(DateTime d) => '${_months[d.month - 1]} ${d.day}, ${d.year}';
  static const _months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /// 4000 -> $4k, 2500 -> $2.5k
  static String compact(double v) => Money.compact(v);
}
