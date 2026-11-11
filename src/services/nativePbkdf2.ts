import type { Pbkdf2 } from './pbkdf2';

/**
 * Native (OpenSSL through react-native-quick-crypto): the same result as jsPbkdf2 in milliseconds
 * on a phone. Kept apart from pbkdf2.ts so the desktop (web) build never bundles the native module.
 * The module is loaded on first use, so importing this file never needs native code.
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
