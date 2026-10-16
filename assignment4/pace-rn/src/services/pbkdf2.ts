import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

/** PBKDF2-HMAC-SHA256: derives [length] bytes from [password] and [salt] with [iterations] rounds. */
export type Pbkdf2 = (password: string, salt: Uint8Array, iterations: number, length: number) => Promise<Uint8Array>;

/**
 * Pure JavaScript (@noble/hashes). Runs anywhere, including Jest, but Hermes has no JIT, so on a
 * phone 100,000 rounds take many seconds. Used by tests, which lower the work factor.
 */
export const jsPbkdf2: Pbkdf2 = (password, salt, iterations, length) => pbkdf2Async(sha256, password, salt, { c: iterations, dkLen: length });

/**
 * Native (OpenSSL through react-native-quick-crypto): the same result in milliseconds on a device.
 * The native module is loaded on first use, so importing this file never needs native code.
 */
export const nativePbkdf2: Pbkdf2 = (password, salt, iterations, length) => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pbkdf2 } = require('react-native-quick-crypto') as typeof import('react-native-quick-crypto');
  return new Promise((resolve, reject) =>
    pbkdf2(password, salt, iterations, length, 'sha256', (error, key) =>
      error || !key ? reject(error ?? new Error('PBKDF2 failed')) : resolve(new Uint8Array(key)),
    ),
  );
};
