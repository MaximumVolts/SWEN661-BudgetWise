import { AppException, FieldValidationException } from '@/models/appException';
import { SIMPLE_SANDBOX_CREDENTIALS } from '@/models/linkedBank';
import { NO_PLAID_KEYS, type PlaidKeys } from '@/models/plaidKeys';
import { hasPlaidKeys } from '@/models/profile';
import { InMemoryPlaidKeyRepository } from '@/repositories/plaidKeyRepository';
import { type Fetch, SandboxPlaidApi } from '@/repositories/sandboxPlaidApi';
import { InMemoryUserAccountRepository } from '@/repositories/userAccountRepository';
import { RepositoryAuthService, SECURITY_QUESTIONS } from '@/services/authService';
import { PasswordHasher } from '@/services/passwordHasher';
import { jsPbkdf2, type Pbkdf2 } from '@/services/pbkdf2';
import { initialsFor, RepositoryProfileService } from '@/services/profileService';
import { createAda, fieldErrors, sandboxServices, TEST_PLAID_CLIENT_ID, TEST_PLAID_SECRET } from './support/sandbox';
jest.setTimeout(30000);
const fastHasher = new PasswordHasher(1000);
const PET = SECURITY_QUESTIONS[0];
const OTHER_CLIENT_ID = 'fedcba9876543210fedcba98';
const OTHER_SECRET = 'fedcba9876543210fedcba98765432';

describe('PasswordHasher', () => {
  test('verifies the right password only, and never stores it', async () => {
    const stored = await fastHasher.hash('secret123');
    expect(stored).not.toContain('secret123');
    expect(await fastHasher.verify('secret123', stored)).toBe(true);
    expect(await fastHasher.verify('secret124', stored)).toBe(false);
    expect(await fastHasher.verify('secret123', 'garbage')).toBe(false);
  });

  test('PBKDF2-HMAC-SHA256 matches the published test vector', async () => {
    const key = await jsPbkdf2('password', new TextEncoder().encode('salt'), 1, 32);
    expect(Buffer.from(key).toString('hex')).toBe('120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b');
  });

  test('hashes with the PBKDF2 it is given (native on a device), keeping the stored format', async () => {
    const calls: number[] = [];
    const counting: Pbkdf2 = (p, s, n, len) => (calls.push(n), jsPbkdf2(p, s, n, len));
    const hasher = new PasswordHasher(1000, counting);
    const stored = await hasher.hash('secret123');
    expect(stored).toMatch(/^pbkdf2-sha256\$1000\$/);
    expect(await hasher.verify('secret123', stored)).toBe(true);
    expect(await fastHasher.verify('secret123', stored)).toBe(true); // same result as the JS version
    expect(calls).toEqual([1000, 1000]);
  });

  test('salts every hash', async () => {
    expect(await fastHasher.hash('secret123')).not.toBe(await fastHasher.hash('secret123'));
  });
});

describe('creating an account', () => {
  let accounts: InMemoryUserAccountRepository;
  let keys: InMemoryPlaidKeyRepository;
  let auth: RepositoryAuthService;
  beforeEach(() => {
    accounts = new InMemoryUserAccountRepository();
    keys = new InMemoryPlaidKeyRepository();
    auth = new RepositoryAuthService({ accounts, plaidKeys: keys, hasher: fastHasher });
  });

  const create = (o: { name?: string; username?: string; pw?: string; confirm?: string; clientId?: string; secret?: string } = {}) =>
    auth.createAccount({
      name: o.name ?? 'Ada',
      username: o.username ?? 'ada',
      password: o.pw ?? 'secret123',
      confirmPassword: o.confirm ?? o.pw ?? 'secret123',
      securityQuestion: PET,
      securityAnswer: 'Rex',
      plaidClientId: o.clientId ?? TEST_PLAID_CLIENT_ID,
      plaidSecret: o.secret ?? TEST_PLAID_SECRET,
    });

  test('creates a hashed account, signs in and starts onboarding', async () => {
    expect(await create()).toBe('onboarding');
    expect(auth.isSignedIn).toBe(true);
    const stored = (await accounts.fetchByUsername('ada'))!;
    expect(stored.displayName).toBe('Ada');
    expect(stored.passwordHash).not.toContain('secret123');
    expect(auth.currentUserId).toBe(stored.id);
  });

  test('reports every invalid field at once', async () => {
    const errors = await fieldErrors(() => create({ name: ' ', username: 'no', pw: 'short', confirm: 'other' }));
    expect(Object.keys(errors).sort()).toEqual(['confirmPassword', 'name', 'password', 'username']);
    expect(auth.isSignedIn).toBe(false);
  });

  test('requires a letter and a number in the password', async () => {
    expect((await fieldErrors(() => create({ pw: 'abcdefgh' }))).password).toBe('Include at least one letter and one number');
    expect((await fieldErrors(() => create({ pw: '12345678' }))).password).toBe('Include at least one letter and one number');
  });

  test('usernames: 3–30 letters, numbers, dots, dashes or underscores', async () => {
    for (const ok of ['ada', 'Ada.Lovelace', 'ada_1815', 'a-b']) {
      expect((await fieldErrors(() => create({ username: ok, pw: 'short' }))).username).toBeUndefined();
    }
    expect((await fieldErrors(() => create({ username: '  ' }))).username).toBe('Choose a username');
    expect((await fieldErrors(() => create({ username: 'ab' }))).username).toBe('Use 3–30 characters');
    expect((await fieldErrors(() => create({ username: 'a'.repeat(31) }))).username).toBe('Use 3–30 characters');
    for (const bad of ['ada@example.com', 'ada lovelace', '.ada', '_ada']) {
      expect((await fieldErrors(() => create({ username: bad }))).username).toBe(
        'Use letters, numbers, dots, dashes or underscores, starting with a letter or number',
      );
    }
  });

  test('rejects a username that is already taken (any case)', async () => {
    await create();
    await auth.signOut();
    expect((await fieldErrors(() => create({ username: 'ADA' }))).username).toBe('An account with this username already exists');
  });

  test('stores the Plaid sandbox keys (trimmed) with the new account', async () => {
    await create({ clientId: `  ${TEST_PLAID_CLIENT_ID} `, secret: ` ${TEST_PLAID_SECRET}` });
    const ada = (await accounts.fetchByUsername('ada'))!;
    expect(await keys.load(ada.id)).toEqual({ clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET });
  });

  test("requires both keys, in Plaid's format", async () => {
    expect(await fieldErrors(() => create({ clientId: '', secret: '' }))).toEqual({
      plaidClientId: 'Enter your Plaid client ID',
      plaidSecret: 'Enter your Plaid sandbox secret',
    });
    const wrong = await fieldErrors(() => create({ clientId: 'not-a-client-id', secret: `${TEST_PLAID_SECRET}0` }));
    expect(Object.keys(wrong).sort()).toEqual(['plaidClientId', 'plaidSecret']);
    expect(await accounts.fetchByUsername('ada')).toBeUndefined(); // nothing created
  });

  test('sign-up requires a question from the list and an answer', async () => {
    const errors = await fieldErrors(() =>
      auth.createAccount({
        name: 'Bo', username: 'bo.lee', password: 'secret123', confirmPassword: 'secret123',
        securityQuestion: 'Made-up question?', securityAnswer: ' ',
        plaidClientId: TEST_PLAID_CLIENT_ID, plaidSecret: TEST_PLAID_SECRET,
      }),
    );
    expect(Object.keys(errors).sort()).toEqual(['securityAnswer', 'securityQuestion']);
  });
});

describe('signing in', () => {
  let auth: RepositoryAuthService;
  beforeEach(async () => {
    auth = new RepositoryAuthService({ accounts: new InMemoryUserAccountRepository(), plaidKeys: new InMemoryPlaidKeyRepository(), hasher: fastHasher });
    await createAda(auth);
    await auth.signOut();
  });

  test('correct password goes home, and the session change is announced', async () => {
    const changes: boolean[] = [];
    auth.signedInChanges.subscribe((v) => changes.push(v));
    expect(await auth.signIn('Ada', 'secret123')).toBe('home');
    expect(auth.isSignedIn).toBe(true);
    await auth.signOut();
    expect(changes).toEqual([true, false]);
  });

  test('wrong password and unknown username fail the same way', async () => {
    const wrong = await fieldErrors(() => auth.signIn('ada', 'nope'));
    const unknown = await fieldErrors(() => auth.signIn('bob', 'secret123'));
    expect(wrong).toEqual({ password: 'Username or password is incorrect' });
    expect(unknown).toEqual(wrong);
    expect(auth.isSignedIn).toBe(false);
  });

  test('empty fields are reported', async () => {
    expect(await fieldErrors(() => auth.signIn(' ', ''))).toEqual({ username: 'Enter your username', password: 'Enter your password' });
  });
});

describe('password reset', () => {
  let accounts: InMemoryUserAccountRepository;
  let auth: RepositoryAuthService;
  let now: Date;
  beforeEach(async () => {
    accounts = new InMemoryUserAccountRepository();
    now = new Date(2026, 9, 12, 9);
    auth = new RepositoryAuthService({ accounts, plaidKeys: new InMemoryPlaidKeyRepository(), hasher: fastHasher, now: () => now });
    await auth.createAccount({
      name: 'Ada', username: 'ada', password: 'secret123', confirmPassword: 'secret123',
      securityQuestion: PET, securityAnswer: 'New York',
      plaidClientId: TEST_PLAID_CLIENT_ID, plaidSecret: TEST_PLAID_SECRET,
    });
    await auth.signOut();
  });

  const reset = (answer = 'new york', pw = 'fresh456', confirm?: string) =>
    auth.resetPassword({ username: 'ada', securityAnswer: answer, newPassword: pw, confirmPassword: confirm ?? pw });

  test("shows the account's question; the answer is stored hashed", async () => {
    expect(await auth.securityQuestionFor('ADA')).toBe(PET);
    expect((await accounts.fetchByUsername('ada'))!.securityAnswerHash).not.toContain('york');
  });

  test('right answer (any case / spacing) sets the new password and signs in', async () => {
    expect(await reset('  NEW   YORK ')).toBe('home');
    expect(auth.isSignedIn).toBe(true);
    await auth.signOut();
    expect(await auth.signIn('ada', 'fresh456')).toBe('home');
    await expect(auth.signIn('ada', 'secret123')).rejects.toBeInstanceOf(FieldValidationException);
  });

  test('wrong answer keeps the old password', async () => {
    expect(await fieldErrors(() => reset('Boston'))).toEqual({ securityAnswer: "That answer doesn't match" });
    expect(auth.isSignedIn).toBe(false);
    expect(await auth.signIn('ada', 'secret123')).toBe('home');
  });

  test('new password must follow the rules and match', async () => {
    expect(Object.keys(await fieldErrors(() => reset('new york', 'short', 'other'))).sort()).toEqual(['confirmPassword', 'password']);
  });

  test('5 wrong answers lock resets for 5 minutes', async () => {
    for (let i = 0; i < 4; i++) await fieldErrors(() => reset('wrong'));
    await expect(reset('wrong')).rejects.toBeInstanceOf(AppException);
    // Even the right answer is refused while locked…
    await expect(reset()).rejects.toThrow('Too many incorrect answers');
    // …and accepted once the lock expires.
    now = new Date(now.getTime() + 5 * 60_000 + 1000);
    expect(await reset()).toBe('home');
  });

  test("unknown usernames and accounts without a question can't be reset", async () => {
    expect((await fieldErrors(() => auth.securityQuestionFor('bob'))).username).toBe('No account on this device uses that username');
    await accounts.create({ username: 'old', passwordHash: 'x' });
    expect((await fieldErrors(() => auth.securityQuestionFor('old'))).username).toBe(
      'This account has no security question, so its password can’t be reset',
    );
  });
});

describe('profile', () => {
  let accounts: InMemoryUserAccountRepository;
  let keys: InMemoryPlaidKeyRepository;
  let adaId: string | undefined;
  let profile: RepositoryProfileService;
  beforeEach(async () => {
    accounts = new InMemoryUserAccountRepository();
    keys = new InMemoryPlaidKeyRepository();
    adaId = (await accounts.create({ username: 'ada', displayName: 'Ada Lovelace', passwordHash: 'h' })).id;
    profile = new RepositoryProfileService({ accounts, plaidKeys: keys, currentUserId: () => adaId });
  });

  test('loads the signed-in account', async () => {
    expect(await profile.load()).toEqual({
      name: 'Ada Lovelace',
      username: 'ada',
      initials: 'AL',
      signInMethod: 'Username & password',
      plaidClientId: '',
      hasPlaidSecret: false,
    });
  });

  test('saves a new name (never the username) and announces the change', async () => {
    let announced = 0;
    profile.changes.subscribe(() => announced++);
    const saved = await profile.update({ name: '  Ada King ', plaidClientId: TEST_PLAID_CLIENT_ID, plaidSecret: TEST_PLAID_SECRET });
    expect(saved).toMatchObject({ name: 'Ada King', initials: 'AK', username: 'ada' });
    expect(await accounts.fetchById(adaId!)).toMatchObject({ displayName: 'Ada King', username: 'ada', passwordHash: 'h' });
    expect(announced).toBe(1);
  });

  test('requires a name', async () => {
    expect(await fieldErrors(() => profile.update({ name: ' ', plaidClientId: TEST_PLAID_CLIENT_ID, plaidSecret: TEST_PLAID_SECRET }))).toEqual(
      { name: 'Enter your name' },
    );
    expect((await accounts.fetchById(adaId!))!.displayName).toBe('Ada Lovelace');
  });

  test('needs someone signed in', async () => {
    adaId = undefined;
    await expect(profile.load()).rejects.toBeInstanceOf(AppException);
  });

  test('initials fall back to the username, then "?"', () => {
    expect(initialsFor('Cher', undefined)).toBe('C');
    expect(initialsFor(undefined, 'zed')).toBe('Z');
    expect(initialsFor(' ', '')).toBe('?');
  });

  test('shows the client ID but never the secret', async () => {
    await keys.save(adaId!, { clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET });
    const data = await profile.load();
    expect(data.plaidClientId).toBe(TEST_PLAID_CLIENT_ID);
    expect(JSON.stringify(data)).not.toContain(TEST_PLAID_SECRET);
    expect(hasPlaidKeys(data)).toBe(true);
  });

  test('a blank secret keeps the saved one; a new one replaces it', async () => {
    await keys.save(adaId!, { clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET });
    await profile.update({ name: 'Ada', plaidClientId: OTHER_CLIENT_ID, plaidSecret: '' });
    expect(await keys.load(adaId!)).toEqual({ clientId: OTHER_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET });
    await profile.update({ name: 'Ada', plaidClientId: OTHER_CLIENT_ID, plaidSecret: OTHER_SECRET });
    expect((await keys.load(adaId!))!.sandboxSecret).toBe(OTHER_SECRET);
  });

  test('without keys, renaming works; entering only part of the keys is an error', async () => {
    const data = await profile.update({ name: 'Ada King', plaidClientId: '', plaidSecret: '' });
    expect(data.name).toBe('Ada King');
    expect(hasPlaidKeys(data)).toBe(false);
    expect(await keys.load(adaId!)).toBeUndefined();
    expect(await fieldErrors(() => profile.update({ name: 'Ada', plaidClientId: TEST_PLAID_CLIENT_ID, plaidSecret: '' }))).toEqual({
      plaidSecret: 'Enter your Plaid sandbox secret',
    });
  });
});

describe('SandboxPlaidApi', () => {
  const link = (api: SandboxPlaidApi) =>
    api.createSandboxPublicToken({ institutionId: 'ins_109508', products: ['transactions'], credentials: SIMPLE_SANDBOX_CREDENTIALS });
  const replying = (status: number, body: unknown, seen: { url: string; body: Record<string, unknown> }[] = []): Fetch =>
    async (url, init) => {
      seen.push({ url, body: JSON.parse(init.body) });
      return { status, text: async () => JSON.stringify(body) };
    };

  test('sends the keys it is given for each request, to sandbox.plaid.com only', async () => {
    const seen: { url: string; body: Record<string, unknown> }[] = [];
    let current: PlaidKeys = { clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET };
    const api = new SandboxPlaidApi({ keys: async () => current, fetch: replying(200, { public_token: 'public-sandbox-123' }, seen) });
    await link(api);
    current = { clientId: OTHER_CLIENT_ID, sandboxSecret: OTHER_SECRET }; // e.g. another user signs in
    await link(api);
    expect(seen.map((s) => [s.body.client_id, s.body.secret])).toEqual([
      [TEST_PLAID_CLIENT_ID, TEST_PLAID_SECRET],
      [OTHER_CLIENT_ID, OTHER_SECRET],
    ]);
    expect(seen.every((s) => s.url.startsWith('https://sandbox.plaid.com/'))).toBe(true);
  });

  test('without keys, asks for them in Profile and sends nothing', async () => {
    const seen: { url: string; body: Record<string, unknown> }[] = [];
    const api = new SandboxPlaidApi({ keys: async () => NO_PLAID_KEYS, fetch: replying(200, {}, seen) });
    await expect(link(api)).rejects.toThrow('Add your Plaid sandbox keys in Profile to connect a bank.');
    expect(seen).toEqual([]);
  });

  test('keys Plaid rejects point the user to Profile', async () => {
    const api = new SandboxPlaidApi({
      keys: async () => ({ clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET }),
      fetch: replying(400, { error_code: 'INVALID_API_KEYS', error_message: 'invalid client_id or secret provided' }),
    });
    await expect(link(api)).rejects.toThrow('Check the client ID');
  });

  test('a non-sandbox token from the API is refused', async () => {
    const api = new SandboxPlaidApi({
      keys: async () => ({ clientId: TEST_PLAID_CLIENT_ID, sandboxSecret: TEST_PLAID_SECRET }),
      fetch: replying(200, { public_token: 'public-production-123' }),
    });
    await expect(link(api)).rejects.toBeInstanceOf(AppException);
  });
});

describe('the composed app (SQLite)', () => {
  test("the signed-in user's own Plaid keys are sent to the sandbox", async () => {
    const app = await sandboxServices();
    expect(app.plaid.requests.every((r) => r.body.client_id === TEST_PLAID_CLIENT_ID && r.body.secret === TEST_PLAID_SECRET)).toBe(true);
    app.bankData.stopRetrying();
  });

  test('deleting the account removes it and signs out', async () => {
    const app = await sandboxServices({ linkBank: false });
    await app.services.auth.deleteAccount();
    expect(app.services.auth.isSignedIn).toBe(false);
    await expect(app.services.auth.signIn('ada', 'secret123')).rejects.toBeInstanceOf(FieldValidationException);
    expect(await app.database.raw.getAllAsync('SELECT * FROM users')).toEqual([]);
  });
});
