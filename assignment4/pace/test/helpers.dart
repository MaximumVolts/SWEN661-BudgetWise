// Shared test helpers (not a test file: no main()).
import 'package:flutter_test/flutter_test.dart' show fail;
import 'package:pace_app/models/app_exception.dart' show FieldValidationException;
import 'package:pace_app/models/google_account.dart' show GoogleAccount;
import 'package:pace_app/models/navigation.dart' show FlowStep;
import 'package:pace_app/repositories/google_account_repository.dart' show GoogleAccountRepository;
import 'package:pace_app/services/auth_service.dart' show AuthService;

/// A Google account source where nobody ever signs in.
class NoGoogle implements GoogleAccountRepository {
  @override
  Future<GoogleAccount?> signIn() async => null;
  @override
  Future<void> signOut() async {}
}

/// Creates (and signs in) the test user Ada, password "secret123", security answer "Rex".
Future<FlowStep> createAda(AuthService auth, {String email = 'ada@example.com'}) => auth.createAccount(
      name: 'Ada',
      email: email,
      password: 'secret123',
      confirmPassword: 'secret123',
      securityQuestion: 'What was the name of your first pet?',
      securityAnswer: 'Rex',
    );

/// The field errors [body] fails with (it must throw a FieldValidationException).
Future<Map<String, String>> fieldErrors(Future<Object?> Function() body) async {
  try {
    await body();
  } on FieldValidationException catch (e) {
    return e.fieldErrors;
  }
  fail('Expected a FieldValidationException');
}
