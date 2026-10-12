/// Throw this from services for failures whose message is safe to show to the user.
/// Controllers surface [message]; any other exception becomes a generic message.
class AppException implements Exception {
  final String message;
  final Object? cause;
  const AppException(this.message, {this.cause});
  @override
  String toString() => message;
}

/// Thrown by services when user input breaks a business rule. Carries per-field messages
/// (keys are field names such as 'email' / 'password') so controllers can show them inline.
class FieldValidationException extends AppException {
  final Map<String, String> fieldErrors;
  const FieldValidationException(this.fieldErrors, [String message = 'Please fix the highlighted fields.']) : super(message);
  String? errorFor(String field) => fieldErrors[field];
}
