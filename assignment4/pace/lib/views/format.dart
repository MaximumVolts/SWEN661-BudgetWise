/// Display formatting helpers. Screens receive raw numbers (double) and format them here,
/// so you can swap in `intl` / locale-aware formatting in one place later.
class Fmt {
  /// Shown in place of a value the repository didn't provide.
  static const missing = '--';

  /// [money], or [missing] when [v] is null.
  static String moneyOrMissing(double? v, {int decimals = 2}) => v == null ? missing : money(v, decimals: decimals);

  static String _group(String digits) {
    final b = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) b.write(',');
      b.write(digits[i]);
    }
    return b.toString();
  }

  /// 1234.5 -> $1,234.50   (negative values get a leading minus)
  static String money(double v, {int decimals = 2}) {
    final parts = v.abs().toStringAsFixed(decimals).split('.');
    final frac = decimals > 0 ? '.${parts[1]}' : '';
    return '${v < 0 ? '−' : ''}\$${_group(parts[0])}$frac';
  }

  /// Always shows a sign: +$2,145.00 / −$40.00
  static String signed(double v, {int decimals = 2}) =>
      '${v < 0 ? '−' : '+'}${money(v.abs(), decimals: decimals)}';

  static String percent(double v, {int decimals = 1}) => '${v.toStringAsFixed(decimals)}%';

  /// 4000 -> $4k, 2500 -> $2.5k
  static String compact(double v) {
    if (v.abs() >= 1000) {
      final k = v / 1000;
      return '\$${k == k.roundToDouble() ? k.round() : k.toStringAsFixed(1)}k';
    }
    return '\$${v.round()}';
  }
}
