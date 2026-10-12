/// Pure validation helpers for services to use when enforcing business rules.
class Validators {
  static final _email = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  static String? email(String value) => _email.hasMatch(value.trim()) ? null : 'Enter a valid email address';
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
  static String? positiveAmount(double value, [String message = 'Enter an amount greater than zero']) =>
      value > 0 ? null : message;
}
