import '../models/profile.dart' show ProfileData;

/// The signed-in user's profile.
/// BUSINESS RULES: name validation, initials and sign-in labels. The email is the account's
/// sign-in identity and can't be changed from the profile.
abstract class ProfileService {
  /// Throws AppException when nobody is signed in.
  Future<ProfileData> load();

  /// Saves a new name (the email can't be changed). Throws FieldValidationException ('name').
  Future<ProfileData> update({required String name});

  /// Emits after every successful [update], so other screens (e.g. Settings) can refresh.
  Stream<void> get changes;
}
