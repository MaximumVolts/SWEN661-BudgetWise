/// Money as text, the one implementation shared by services (pre-formatted labels such as
/// "$15.99 monthly") and views (amounts they render themselves, via Fmt).
class Money {
  Money._();

  /// 1234.5 -> $1,234.50 (negative values get a leading minus).
  static String format(double v, {int decimals = 2}) {
    final parts = v.abs().toStringAsFixed(decimals).split('.');
    final frac = decimals > 0 ? '.${parts[1]}' : '';
    return '${v < 0 ? '−' : ''}\$${_group(parts[0])}$frac';
  }

  /// Always shows a sign: +$2,145.00 / −$40.00
  static String signed(double v, {int decimals = 2}) => '${v < 0 ? '−' : '+'}${format(v.abs(), decimals: decimals)}';

  /// 4000 -> $4k, 2500 -> $2.5k
  static String compact(double v) {
    if (v.abs() >= 1000) {
      final k = v / 1000;
      return '\$${k == k.roundToDouble() ? k.round() : k.toStringAsFixed(1)}k';
    }
    return '\$${v.round()}';
  }

  /// "1234" -> "1,234"
  static String _group(String digits) {
    final b = StringBuffer();
    for (var i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) b.write(',');
      b.write(digits[i]);
    }
    return b.toString();
  }
}
