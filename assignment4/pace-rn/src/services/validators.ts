import { formatMoney } from '../models/money';

/** Pure validation helpers for services to use when enforcing business rules. */
export const Validators = {
  minUsernameLength: 3,
  maxUsernameLength: 30,

  /**
   * New usernames: 3–30 letters, numbers, dots, dashes or underscores, starting with a letter or
   * number. Matching ignores case.
   */
  newUsername(value: string): string | undefined {
    const v = value.trim();
    if (!v) return 'Choose a username';
    if (v.length < Validators.minUsernameLength || v.length > Validators.maxUsernameLength) {
      return `Use ${Validators.minUsernameLength}–${Validators.maxUsernameLength} characters`;
    }
    return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(v)
      ? undefined
      : 'Use letters, numbers, dots, dashes or underscores, starting with a letter or number';
  },

  requiredText: (value: string, message: string) => (value.trim() ? undefined : message),

  minPasswordLength: 8,

  /** New passwords: at least 8 characters, including a letter and a number. */
  newPassword(value: string): string | undefined {
    if (value.length < Validators.minPasswordLength) return `Use at least ${Validators.minPasswordLength} characters`;
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Include at least one letter and one number';
    return undefined;
  },

  passwordsMatch: (password: string, confirm: string) => (password === confirm ? undefined : "Passwords don't match"),

  /** Security answers: at least 2 characters after trimming. */
  securityAnswer: (value: string) =>
    value.trim().length >= 2 ? undefined : 'Enter an answer you’ll remember (at least 2 characters)',

  /**
   * Parses a money amount as typed ("400", "$1,250.50"): at most 2 decimals, between [min] and
   * [max]. [what] names it in the messages ("limit" → "Enter a limit", "The limit must be…").
   */
  money(text: string, opts: { what: string; min?: number; max?: number }): { value?: number; error?: string } {
    const { what, min = 1, max = 1_000_000 } = opts;
    const whole = (v: number) => formatMoney(v, v === Math.round(v) ? 0 : 2);
    const cleaned = text.trim().replace(/[$,\s]/g, '');
    if (!cleaned) return { error: `Enter ${/^[aeiou]/.test(what) ? 'an' : 'a'} ${what}` };
    // Anchored, with no nested repetition: linear time (the rule's check is overly cautious).
  // eslint-disable-next-line security/detect-unsafe-regex
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return { error: 'Enter an amount like 400 or 400.50' };
    const value = Number(cleaned);
    if (value < min) return { error: `The ${what} must be at least ${whole(min)}` };
    if (value > max) return { error: `The ${what} can be at most ${whole(max)}` };
    return { value };
  },

  /** Plaid client IDs are 24 hexadecimal characters (dashboard.plaid.com → Developers → Keys). */
  plaidClientId(value: string): string | undefined {
    const v = value.trim();
    if (!v) return 'Enter your Plaid client ID';
    return /^[0-9a-fA-F]{24}$/.test(v) ? undefined : 'A Plaid client ID is 24 letters and numbers (0–9, a–f)';
  },

  /** Plaid secrets are 30 hexadecimal characters. Use the **Sandbox** secret. */
  plaidSandboxSecret(value: string): string | undefined {
    const v = value.trim();
    if (!v) return 'Enter your Plaid sandbox secret';
    return /^[0-9a-fA-F]{30}$/.test(v) ? undefined : 'A Plaid secret is 30 letters and numbers (0–9, a–f)';
  },
};

/** Field errors without the empty ones (what a FieldValidationException carries). */
export function compactErrors(errors: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter((e): e is [string, string] => e[1] !== undefined));
}
