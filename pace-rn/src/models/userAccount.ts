/** The user's own Pace account (not a linked bank account). */
export interface UserAccount {
  id: string;
  username: string;
  displayName?: string;
  /** Salted password hash (see PasswordHasher). Never the password itself, and never shown. */
  passwordHash: string;
  /** Question asked before a password reset (shown to the user). */
  securityQuestion?: string;
  /** Salted hash of the normalised answer. Never the answer itself. */
  securityAnswerHash?: string;
}
