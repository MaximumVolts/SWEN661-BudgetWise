/// The identity Google Sign-In returns, used to create or find a Pace account.
library;

class GoogleAccount {
  /// Google's stable user id; match accounts on this, not on [email].
  final String id;
  final String email;
  final String? displayName;
  final String? photoUrl;
  /// OpenID Connect ID token. A real backend must verify it before trusting [id] / [email].
  final String? idToken;
  const GoogleAccount({required this.id, required this.email, this.displayName, this.photoUrl, this.idToken});
}
