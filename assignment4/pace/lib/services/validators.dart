/// Pure validation helpers for services to use when enforcing business rules.
class Validators {
  static final _email = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  static String? email(String value) => _email.hasMatch(value.trim()) ? null : 'Enter a valid email address';
  static String? requiredText(String value, String message) => value.trim().isEmpty ? message : null;
  static String? positiveAmount(double value, [String message = 'Enter an amount greater than zero']) =>
      value > 0 ? null : message;
}
