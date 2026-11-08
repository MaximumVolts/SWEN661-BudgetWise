import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

/** PBKDF2-HMAC-SHA256: derives [length] bytes from [password] and [salt] with [iterations] rounds. */
export type Pbkdf2 = (password: string, salt: Uint8Array, iterations: number, length: number) => Promise<Uint8Array>;

/**
 * Pure JavaScript (@noble/hashes). Runs anywhere, including Jest, but Hermes has no JIT, so on a
 * phone 100,000 rounds take many seconds. Used by tests, which lower the work factor. Phones use
 * nativePbkdf2 (nativePbkdf2.ts); the desktop app uses webCryptoPbkdf2.
 */
export const jsPbkdf2: Pbkdf2 = (password, salt, iterations, length) => pbkdf2Async(sha256, password, salt, { c: iterations, dkLen: length });

/** WebCrypto: the browser's native PBKDF2, used by the desktop (Electron) app. Same result as jsPbkdf2. */
export const webCryptoPbkdf2: Pbkdf2 = async (password, salt, iterations, length) => {
  const { subtle } = globalThis.crypto;
  const key = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations }, key, length * 8);
  return new Uint8Array(bits);
};
