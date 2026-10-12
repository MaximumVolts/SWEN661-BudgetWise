/// The user's own Pace account (not a linked bank account).
library;

class UserAccount {
  final String id;
  final String? email;
  final String? displayName;
  /// Google's stable user id when the account was created with / linked to Google.
  final String? googleId;
  const UserAccount({required this.id, this.email, this.displayName, this.googleId});

  UserAccount copyWith({String? email, String? displayName, String? googleId}) => UserAccount(
        id: id,
        email: email ?? this.email,
        displayName: displayName ?? this.displayName,
        googleId: googleId ?? this.googleId,
      );
}
