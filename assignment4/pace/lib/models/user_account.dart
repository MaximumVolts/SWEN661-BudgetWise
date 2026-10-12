/// The user's own Pace account (not a linked bank account).
library;

class UserAccount {
  final String id;
  final String? email;
  final String? displayName;
  /// Google's stable user id when the account was created with / linked to Google.
  final String? googleId;
  /// Salted password hash (see PasswordHasher). null for accounts without a password,
  /// e.g. Google-only. Never the password itself, and never shown in the UI.
  final String? passwordHash;
  /// Question asked before a password reset (shown to the user).
  final String? securityQuestion;
  /// Salted hash of the normalised answer. Never the answer itself.
  final String? securityAnswerHash;
  const UserAccount({
    required this.id,
    this.email,
    this.displayName,
    this.googleId,
    this.passwordHash,
    this.securityQuestion,
    this.securityAnswerHash,
  });

  UserAccount copyWith({
    String? email,
    String? displayName,
    String? googleId,
    String? passwordHash,
    String? securityQuestion,
    String? securityAnswerHash,
  }) =>
      UserAccount(
        id: id,
        email: email ?? this.email,
        displayName: displayName ?? this.displayName,
        googleId: googleId ?? this.googleId,
        passwordHash: passwordHash ?? this.passwordHash,
        securityQuestion: securityQuestion ?? this.securityQuestion,
        securityAnswerHash: securityAnswerHash ?? this.securityAnswerHash,
      );
}
