import '../models/profile.dart' show ProfileData;

/// The signed-in user's profile.
/// BUSINESS RULES: name validation, initials and sign-in labels, and the Plaid sandbox keys'
/// format. The username is the account's sign-in identity and can't be changed from the profile.
abstract class ProfileService {
  /// Throws AppException when nobody is signed in.
  Future<ProfileData> load();

  /// Saves a new name and the Plaid sandbox keys (the username can't be changed). An empty
  /// [plaidSecret] keeps the stored secret. Throws FieldValidationException ('name',
  /// 'plaidClientId', 'plaidSecret').
  Future<ProfileData> update({required String name, required String plaidClientId, required String plaidSecret});

  /// Emits after every successful [update], so other screens (e.g. Settings) can refresh.
  Stream<void> get changes;
}
