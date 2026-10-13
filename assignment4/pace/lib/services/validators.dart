import '../models/money.dart' show Money;
/// Pure validation helpers for services to use when enforcing business rules.
class Validators {
  static const minUsernameLength = 3, maxUsernameLength = 30;
  static final _username = RegExp(r'^[A-Za-z0-9][A-Za-z0-9._-]*$');

  /// New usernames: [minUsernameLength]–[maxUsernameLength] letters, numbers, dots, dashes or
  /// underscores, starting with a letter or number. Matching ignores case.
  static String? newUsername(String value) {
    final v = value.trim();
    if (v.isEmpty) return 'Choose a username';
    if (v.length < minUsernameLength || v.length > maxUsernameLength) {
      return 'Use $minUsernameLength–$maxUsernameLength characters';
    }
    return _username.hasMatch(v) ? null : 'Use letters, numbers, dots, dashes or underscores, starting with a letter or number';
  }

  static String? requiredText(String value, String message) => value.trim().isEmpty ? message : null;

  static const minPasswordLength = 8;
  /// New passwords: at least [minPasswordLength] characters, including a letter and a number.
  static String? newPassword(String value) {
    if (value.length < minPasswordLength) return 'Use at least $minPasswordLength characters';
    if (!RegExp(r'[A-Za-z]').hasMatch(value) || !RegExp(r'\d').hasMatch(value)) {
      return 'Include at least one letter and one number';
    }
    return null;
  }

  static String? passwordsMatch(String password, String confirm) =>
      password == confirm ? null : "Passwords don't match";

  /// Security answers: at least 2 characters after trimming.
  static String? securityAnswer(String value) =>
      value.trim().length >= 2 ? null : 'Enter an answer you’ll remember (at least 2 characters)';
  /// Parses a money amount as typed ("400", "$1,250.50"): at most 2 decimals, between [min] and
  /// [max]. [what] names it in the messages ("limit" → "Enter a limit", "The limit must be…").
  static ({double? value, String? error}) money(String text, {required String what, double min = 1, double max = 1000000}) {
    final cleaned = text.trim().replaceAll(RegExp(r'[\$,\s]'), '');
    if (cleaned.isEmpty) return (value: null, error: 'Enter ${_article(what)} $what');
    if (!RegExp(r'^\d+(\.\d{1,2})?$').hasMatch(cleaned)) {
      return (value: null, error: 'Enter an amount like 400 or 400.50');
    }
    final value = double.parse(cleaned);
    if (value < min) return (value: null, error: 'The $what must be at least ${_whole(min)}');
    if (value > max) return (value: null, error: 'The $what can be at most ${_whole(max)}');
    return (value: value, error: null);
  }

  static String _article(String word) => RegExp(r'^[aeiou]').hasMatch(word) ? 'an' : 'a';
  static String _whole(double v) => Money.format(v, decimals: v == v.roundToDouble() ? 0 : 2);

  /// Plaid client IDs are 24 hexadecimal characters (dashboard.plaid.com → Developers → Keys).
  static String? plaidClientId(String value) {
    final v = value.trim();
    if (v.isEmpty) return 'Enter your Plaid client ID';
    return RegExp(r'^[0-9a-fA-F]{24}$').hasMatch(v) ? null : 'A Plaid client ID is 24 letters and numbers (0–9, a–f)';
  }

  /// Plaid secrets are 30 hexadecimal characters. Use the **Sandbox** secret.
  static String? plaidSandboxSecret(String value) {
    final v = value.trim();
    if (v.isEmpty) return 'Enter your Plaid sandbox secret';
    return RegExp(r'^[0-9a-fA-F]{30}$').hasMatch(v) ? null : 'A Plaid secret is 30 letters and numbers (0–9, a–f)';
  }

  static String? positiveAmount(double value, [String message = 'Enter an amount greater than zero']) =>
      value > 0 ? null : message;
}
