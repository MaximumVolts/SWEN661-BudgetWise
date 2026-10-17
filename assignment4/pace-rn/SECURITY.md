# Security analysis: Pace (React Native)

Run all of it with `npm run security` (lint plus dependency audit).

## 1. Static code analysis (`eslint-plugin-security`)

`eslint.config.js` turns on the plugin's recommended rules for all code. Results, last run on 2026-10-16:

| Rule | Findings | Outcome |
| --- | --- | --- |
| `detect-unsafe-regex` | 3: the thousands separator in `models/money.ts`, the amount checks in `services/validators.ts` and `services/transactionService.ts` | Reviewed, no fix needed. All three are linear-time: anchored patterns with a bounded `{1,2}` group, plus a lookahead that runs only on digits Pace formatted itself. Each is marked with `eslint-disable-next-line` and a comment explaining why. |
| `detect-object-injection` | 30+ `obj[key]` lookups | Turned off. Every key is a TypeScript union or `Record` key (status, kind, tab index), never raw user input. This rule is known for false positives in typed code. |
| `detect-non-literal-fs-filename`, `detect-non-literal-require` | Test helpers that load route files and fixtures | Turned off for `__tests__/` only. Test code, never shipped. |
| Everything else (`eval`, `child_process`, `new Buffer`, timing attacks, pseudo-random bytes, …) | 0 | — |

`npm run lint` passes with **0 errors and 0 warnings**.

## 2. Dependency audit (`npm audit --omit=dev`)

Last run on 2026-10-16: 63 advisories (0 critical). They all come from these transitive packages:

| Package | Advisory | Pulled in by |
| --- | --- | --- |
| `node-forge` ≤ 1.4.0 | RSA signature verification | Expo CLI / config plugins (code signing during builds) |
| `braces` ≤ 3.0.3 | ReDoS | Metro / build tooling file watching |
| `decode-uri-component`, `sprintf-js` | ReDoS / DoS | build tooling |
| `uuid` < 11.1.1 | missing buffer bounds check (only when a `buf` is passed) | `@expo/config-plugins` |

All of these run in **build tooling on the developer's machine** (Expo CLI, config plugins, Metro). None of them is bundled into the app, or handles input from app users. `npm audit fix --force` would downgrade or replace Expo SDK 57 packages and break the build, so the plan is to take Expo's patch releases (`npx expo install --fix`) as they come out.

## 3. How the app protects data

| Concern | How Pace handles it |
| --- | --- |
| Passwords | Never stored. PBKDF2-HMAC-SHA256 with a random 16-byte salt per password (`services/passwordHasher.ts`). Comparisons don't stop at the first wrong character. |
| Bank tokens | Plaid access tokens live in the OS secure store (iOS Keychain, Android Keystore) through `expo-secure-store`, not in SQLite. |
| API keys | Each user enters their own Plaid **sandbox** keys at runtime. No keys are in the source, the repo or the builds. |
| Network | Only `sandbox.plaid.com` over HTTPS. Pace can't reach Plaid's production environment. |
| Local data | On-device SQLite only. Deleting the account deletes the user's row, and their other rows go with it (`ON DELETE CASCADE`). |
| Build artifacts | `.apk`, `.aab`, `.ipa`, keystores (`*.jks`) and provisioning files are git-ignored. |
