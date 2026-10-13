/// The signed-in user's profile, as shown and edited on the Profile screen.
library;

class ProfileData {
  final String name;
  final String username;
  /// e.g. "AL" for Ada Lovelace.
  final String initials;
  /// How the user signs in, e.g. "Username & password" or "Google".
  final String signInMethod;
  /// The Plaid sandbox client ID stored with the account ('' if none yet).
  final String plaidClientId;
  /// Whether a Plaid sandbox secret is stored. The secret itself is never shown.
  final bool hasPlaidSecret;
  const ProfileData({
    required this.name,
    required this.username,
    required this.initials,
    required this.signInMethod,
    this.plaidClientId = '',
    this.hasPlaidSecret = false,
  });

  /// Bank linking needs both keys.
  bool get hasPlaidKeys => plaidClientId.isNotEmpty && hasPlaidSecret;
}
