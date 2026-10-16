import { getRandomBytes } from 'expo-crypto';
import { jsPbkdf2, type Pbkdf2 } from './pbkdf2';

const SCHEME = 'pbkdf2-sha256';

const toBase64 = (bytes: Uint8Array) => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
};
const fromBase64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/**
 * Hashes and checks passwords with PBKDF2-HMAC-SHA256 and a random per-password salt, so the
 * device never stores a password. On a device the work runs natively ([nativePbkdf2]); the
 * pure-JavaScript default is far too slow on Hermes and is meant for tests.
 *
 * Stored format: `pbkdf2-sha256$<iterations>$<base64 salt>$<base64 hash>`.
 */
export class PasswordHasher {
  /**
   * Work factor: 100,000 rounds (OWASP suggests 600,000 for PBKDF2-HMAC-SHA256). Existing
   * hashes keep working when this changes because each stores its own count. Tests lower it.
   */
  constructor(
    readonly iterations = 100_000,
    private readonly derive: Pbkdf2 = jsPbkdf2,
    private readonly randomBytes: (n: number) => Uint8Array = getRandomBytes,
  ) {}

  async hash(password: string): Promise<string> {
    const salt = this.randomBytes(16);
    const digest = await this.derive(password, salt, this.iterations, 32);
    return `${SCHEME}$${this.iterations}$${toBase64(salt)}$${toBase64(digest)}`;
  }

  /** False for a wrong password or an unrecognised [stored] value. */
  async verify(password: string, stored: string): Promise<boolean> {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== SCHEME) return false;
    const n = Number(parts[1]);
    if (!Number.isInteger(n) || n <= 0) return false;
    let salt: Uint8Array, expected: Uint8Array;
    try {
      salt = fromBase64(parts[2]);
      expected = fromBase64(parts[3]);
    } catch {
      return false;
    }
    const actual = await this.derive(password, salt, n, expected.length || 32);
    return constantTimeEquals(actual, expected);
  }
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
