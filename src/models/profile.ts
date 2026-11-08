/** The signed-in user's profile, as shown and edited on the Profile screen. */
export interface ProfileData {
  name: string;
  username: string;
  /** e.g. "AL" for Ada Lovelace. */
  initials: string;
  /** How the user signs in, e.g. "Username & password". */
  signInMethod: string;
  /** The Plaid sandbox client ID stored with the account ('' if none yet). */
  plaidClientId: string;
  /** Whether a Plaid sandbox secret is stored. The secret itself is never shown. */
  hasPlaidSecret: boolean;
}

/** Bank linking needs both keys. */
export const hasPlaidKeys = (p: ProfileData) => p.plaidClientId.length > 0 && p.hasPlaidSecret;
