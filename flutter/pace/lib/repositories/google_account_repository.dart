import '../models/google_account.dart' show GoogleAccount;

/// Asks Google who the user is. Knows nothing about Pace accounts: AuthService turns the
/// returned [GoogleAccount] into one.
abstract class GoogleAccountRepository {
  /// Shows Google's account chooser. Returns null if the user cancelled.
  /// Throws AppException with a user-facing message on any other failure.
  Future<GoogleAccount?> signIn();
  /// Ends the Google session so the chooser appears again next time.
  Future<void> signOut();
}
