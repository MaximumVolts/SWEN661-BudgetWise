/// The signed-in user's profile, as shown and edited on the Profile screen.
library;

class ProfileData {
  final String name;
  final String email;
  /// e.g. "AL" for Ada Lovelace.
  final String initials;
  /// How the user signs in, e.g. "Email & password" or "Google".
  final String signInMethod;
  const ProfileData({required this.name, required this.email, required this.initials, required this.signInMethod});
}
