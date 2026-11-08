import * as SecureStore from 'expo-secure-store';

/** Small secrets (Plaid access tokens) kept outside the database. */
export interface SecretVault {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

/** The device's secure storage (Android Keystore / iOS Keychain). Keys: letters, digits, ".", "-", "_". */
export class SecureStoreVault implements SecretVault {
  private static key = (k: string) => `pace.${k.replace(/[^A-Za-z0-9._-]/g, '_')}`;
  async get(key: string) {
    return (await SecureStore.getItemAsync(SecureStoreVault.key(key))) ?? undefined;
  }
  async set(key: string, value: string) {
    await SecureStore.setItemAsync(SecureStoreVault.key(key), value);
  }
  async delete(key: string) {
    await SecureStore.deleteItemAsync(SecureStoreVault.key(key));
  }
}

/** Secrets in memory (tests). */
export class InMemoryVault implements SecretVault {
  readonly values = new Map<string, string>();
  async get(key: string) {
    return this.values.get(key);
  }
  async set(key: string, value: string) {
    this.values.set(key, value);
  }
  async delete(key: string) {
    this.values.delete(key);
  }
}
