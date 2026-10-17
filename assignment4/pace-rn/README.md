# Pace (React Native)

The React Native port of the Pace budgeting app (the Flutter original is in [`../pace`](../pace)). It is built with Expo SDK 57, TypeScript and Expo Router (which runs on React Navigation). It uses the React Context API for shared state, and Jest with React Native Testing Library for tests.

Pace only ever talks to **Plaid's sandbox** (`sandbox.plaid.com`). It can't link a real bank, and there is nowhere to enter real bank details.

**Contents:** [Assignment 5 checklist](#assignment-5-checklist) · [First-time setup](#first-time-setup) · [Commands](#commands) · [Building and deploying](#building-and-deploying) · [Tests and coverage](#tests-and-coverage) · [Security analysis](#security-analysis) · [Compared with the Flutter version](#compared-with-the-flutter-version) · [How it's organised](#how-its-organised) · [Troubleshooting](#troubleshooting)

## Assignment 5 checklist

| Requirement | Where / how |
| --- | --- |
| Feature parity with Flutter | Every Flutter screen has a React Native counterpart (28 screens), see [Compared with the Flutter version](#compared-with-the-flutter-version). The one gap is Google sign-in. |
| React Navigation | Expo Router's `Stack` and `Tabs` are React Navigation navigators (`src/views/routes/_layout.tsx`, `(tabs)/_layout.tsx`). Sign-in guards use `Stack.Protected`. |
| State management | React Context: `ServicesContext`, `SessionContext`, `PreferencesContext`, `NoticeContext`, `DialogContext` (`src/state/`) |
| Phone and tablet layouts | `src/ui/responsive.ts` (`useResponsive`): from 768 dp wide, screens are centered at a readable width and the dashboard switches to two columns. The app rotates freely, and `ios.supportsTablet` is on. |
| Accessibility | Every touch target has an `accessibilityRole` plus a label (its text or `accessibilityLabel`). Other props: `accessibilityState` (selected/checked/disabled), headings marked `header`, charts read out as text, decorative icons hidden, 48×48 minimum targets, high contrast and colorblind modes. |
| Built with Expo | Expo SDK 57, EAS Build profiles in `eas.json` |
| File structure | screens `src/views/screens`, components `src/ui`, hooks `src/controllers` (one `useXController` hook per screen) and `src/ui/responsive.ts`, utils `src/utils` |
| ESLint, no errors | `npm run lint` (Expo config, MVCS import rules, `eslint-plugin-security`) |
| Type checking | TypeScript strict, `npm run typecheck` |
| Security analysis | `npm run security`, see [Security analysis](#security-analysis) and [SECURITY.md](SECURITY.md) |
| Android / iOS builds | `npm run build:android` / `npm run build:ios` (EAS), or a local APK with `npm run build:android:local` |
| Jest + RNTL tests, 60%+ coverage | 167 tests in `__tests__/`, at about 88% statement coverage. `npm run test:coverage` writes the HTML report to `coverage/lcov-report/index.html`. |
| Framework comparison | [`docs/framework-comparison.md`](docs/framework-comparison.md) (export it to PDF/Word to submit) |

## First-time setup

1. Install Node.js 20 or newer (and Android Studio with an emulator, or an Android phone with USB debugging).
2. Clone the repository and switch to this folder:
   ```sh
   git clone https://github.com/MaximumVolts/SWEN661-BudgetWise.git
   cd SWEN661-BudgetWise
   git checkout UMGC-PACE
   cd assignment4/pace-rn
   ```
3. Run `npm install`.
4. Get free Plaid **sandbox** keys at https://dashboard.plaid.com → Developers → Keys. You need the client ID and the **Sandbox** secret, never the Production one. Each user enters their own keys when creating a Pace account (you can change them later on Profile). Keys are stored only on the device, never in the code or the app build.
5. Start the app on an Android phone or emulator with `npm run android`. This makes a development build, and later runs reuse it with `npm start`. Expo Go can't run Pace, because Pace uses native modules that Expo Go doesn't include (see [Troubleshooting](#troubleshooting)).
6. In the app:
   1. Create an account. Choose a username, password and security question, and enter your Plaid sandbox keys.
   2. Pick your priorities.
   3. Tap **Connect test bank with Plaid**. This links First Platypus Bank using Plaid's published test user (`user_good` / `pass_good`).

   Right after linking, Plaid takes a few seconds to prepare transactions. The screens fill in on their own.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Start the Metro dev server (for an installed development build) |
| `npm run android` / `npm run ios` | Build and run a development build on an emulator/simulator or device |
| `npm test` | All tests (Jest + React Native Testing Library) |
| `npm run test:coverage` | Tests with a coverage report in `coverage/` (HTML at `coverage/lcov-report/index.html`) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint (Expo config, layer rules, security rules) |
| `npm run audit` | `npm audit` of the packages that ship in the app |
| `npm run security` | lint + audit |
| `npm run build:android` | Cloud release build on EAS, giving an installable `.apk` |
| `npm run build:ios` | Cloud iOS build on EAS (Simulator build, so no Apple developer account is needed) |
| `npm run build:android:local` | Release `.apk` built on this machine (needs Android Studio) |

## Building and deploying

### Android, on your machine (no Expo account)

```sh
npm run build:android:local
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. Install it by copying it to the phone and opening it (allowing installs from that source), or over USB with `adb install android/app/build/outputs/apk/release/app-release.apk`.

### Android and iOS, in the cloud with EAS Build

You need a free Expo account (`npx eas-cli@latest login`). The first build asks to create the EAS project and links it in `app.json`.

| Profile (`eas.json`) | Android | iOS |
| --- | --- | --- |
| `preview` (default for the npm scripts) | Release `.apk` for direct install | Release build for the iOS Simulator (no Apple account) |
| `preview-device` | Same as `preview` | Ad hoc `.ipa` for registered devices (needs an Apple Developer account) |
| `production` | `.aab` for Google Play, with an auto-incremented version code | App Store build |

```sh
npm run build:android          # or: npx eas-cli@latest build -p android --profile preview
npm run build:ios              # Simulator build
npx eas-cli@latest build -p ios --profile preview-device   # a real iPhone
```

When a build finishes, EAS prints a download link and QR code. To run the iOS Simulator build, unpack the `.tar.gz` and drag `Pace.app` onto a running simulator.

Native `android/` and `ios/` folders are generated (Continuous Native Generation) and git-ignored. Native settings belong in `app.json`. APKs, AABs and IPAs are git-ignored and contain no Plaid keys.

## Tests and coverage

```sh
npm test                 # all suites
npm run test:coverage    # plus coverage: text summary, and HTML in coverage/lcov-report/index.html
```

| Suite | Kind | Covers |
| --- | --- | --- |
| `accountsAndAuth-test.ts` | unit | password hashing, creating accounts, signing in, password reset, profile, the Plaid sandbox client, the composed app on SQLite |
| `featureServices-test.ts` | unit | bill reminders, managing budgets, recurring expenses, savings goals, linking sandbox banks |
| `bankFeatures-test.ts` | unit / integration | bank data sync, transactions, statements, bills and recurring payments, expected income (Plaid responses replayed) |
| `repositories-test.ts` | unit | SQLite storage on the real schema (in-memory database) |
| `authFlow-test.tsx` | RNTL + navigation | sign in, create account → onboarding → connect bank → Home, reset password |
| `homeAndTransactions-test.tsx` | RNTL + navigation | Home links, the tab bar, search and filters, transaction details |
| `budgetsAndBills-test.tsx` | RNTL | budgets (create, edit, delete), bills (mark paid, add, pause, delete) |
| `settingsAndTools-test.tsx` | RNTL + navigation | settings toggles and reminders, profile, accounts, notifications, goals, cash flow, spending, statements |
| `layoutAndSnapshots-test.tsx` | unit + RNTL + snapshot | phone/tablet layouts, snapshots of shared components and screens |

Coverage at the time of writing: **about 88% statements, 77% branches, 87% functions, 91% lines** (the minimum is 60%).

Tests run the real services on an in-memory SQLite database (sql.js), with Plaid replayed from responses recorded from the sandbox (`__tests__/fixtures/plaid_sandbox`). "Today" is fixed to the recording date, 12 October 2026. Screen tests open the actual routes (`src/views/routes`) with Expo Router's `renderRouter`. Nothing in the tests calls Plaid.

To update snapshots after an intended UI change, run `npx jest -u`, and check the diff in `__tests__/__snapshots__` before committing.

## Security analysis

- **Static analysis:** `eslint-plugin-security` (recommended rules) runs as part of `npm run lint`.
- **Dependencies:** `npm run audit` checks the packages that ship in the app.
- **App design:** passwords are stored as salted PBKDF2 hashes, and Plaid access tokens live in the platform secure store (Keychain / Keystore). Only Plaid's sandbox host is reachable, and no secrets are in the code or builds.

[SECURITY.md](SECURITY.md) has the findings and how each was handled.

## Compared with the Flutter version

| | Flutter (`../pace`) | React Native (this app) |
| --- | --- | --- |
| Language / UI | Dart, Material widgets | TypeScript, React Native core components + `react-native-svg` |
| Architecture | MVCS + repositories | The same MVCS + repositories, file for file (`xxx_view.dart` + `screens/xxx_screen.dart` became `XView.tsx` + `screens/XScreen.tsx`) |
| Navigation | Navigator 2.0 (`app_navigator.dart`) | Expo Router / React Navigation (`navigation/appNavigator.ts`) |
| State | `ChangeNotifier` controllers + `ControllerScope` | `useXController` hooks + React Context |
| Storage | `sqflite`, `flutter_secure_storage` | `expo-sqlite`, `expo-secure-store` |
| Notifications | `flutter_local_notifications` | `expo-notifications` |
| Charts | `CustomPainter` | SVG (`react-native-svg`) |
| Accessibility | `Semantics` widgets | `accessibilityRole` / `Label` / `State` props |
| Tablet layout | Phone layout scaled | Centered content, and a two-column dashboard from 768 dp |
| Sign in | Username/password **or Google** | Username/password only (Google sign-in not ported yet) |
| Tests | `flutter_test` | Jest + React Native Testing Library, plus snapshot tests |
| Source size | ~17,500 lines of Dart in 204 files | ~12,600 lines of TypeScript in 205 files |

[`docs/framework-comparison.md`](docs/framework-comparison.md) is the full write-up.

## How it's organised

Pace follows **MVCS** (Model, View, Controller, Service) with the **repository pattern** for data access, like the Flutter version:

```
src/
  models/        M: plain data types (no logic beyond small helpers)
  views/         V: one view per screen (XView.tsx) that connects its controller to its screen
    screens/       the UI for each screen (XScreen.tsx): renders what its controller gives it, nothing else
    routes/        Expo Router's routes (its `root`, set in app.json): each reads URL params and renders a view
  controllers/   C: one controller hook per screen (state, service calls, dialogs, navigation); base/ has the shared helpers
  services/      S: business rules (auth, budgets, bills, cash flow, statements…), behind interfaces
  repositories/  data access behind interfaces: SQLite (expo-sqlite), secure store, Plaid sandbox API, notifications, file saving
  navigation/    appNavigator.ts: navigation as a service, the only code that knows the routes
  state/         React contexts: Services, Session, Preferences (palette), Notice (snackbar), Dialog
  ui/            theme, shared components, SVG charts, nav bar
  utils/         small helpers any layer can use (events, dates)
__tests__/       service, repository and screen tests; Plaid fixtures in __tests__/fixtures
```

As in the Flutter version (`views/*_view.dart` + `views/screens/*_screen.dart`), each screen is a view, a screen and a controller, plus its route. For example, Savings goals is:
- `views/routes/goals.tsx`: the `/goals` route, which renders `<GoalsView />`
- `views/GoalsView.tsx`: `<GoalsScreen controller={useGoalsController()} />`
- `controllers/goalsController.ts`: loads goals from `GoalService`, asks for and checks a contribution, and opens the goal form
- `views/screens/GoalsScreen.tsx`: draws the list, calling `controller.contribute(goal)` when a button is pressed

How the layers depend on each other:
- **Routes** only read URL parameters and render a view. Views get those parameters as props.
- **Screens** never call services, navigate or touch the session. They get data and actions from their controller (a prop).
- **Controllers** never render and hold no business rules. They keep screen state, call services through `ServicesContext`, and navigate through `useAppNavigator()`. Validation, calculations and decisions (what a trend links to, how categories change, when reminders are rescheduled…) are in services.
- **Services** never know about screens. They see repositories only as interfaces (`import type`).
- **`services/appServices.ts`** is the composition root. `createRepositories()` picks the implementations (SQLite, secure store, Plaid sandbox), and `createApp()` builds the services from them. Tests swap in in-memory or recorded ones.

`npm run lint` enforces these rules with ESLint import restrictions (`eslint.config.js`).

- **State.** Controllers get services from `ServicesContext`. Who is signed in, and how far through sign-up they are, lives in `SessionContext`, which decides which routes are reachable through `Stack.Protected`. Display preferences (high contrast, colorblind mode) live in `PreferencesContext` and restyle the whole app at once. Notices and dialogs are contexts as well.
- **Storage.** Accounts, budgets, goals, bills, expected income, notes and categories are stored in on-device SQLite. Passwords are stored as PBKDF2 hashes. Plaid access tokens are kept in the secure store, not the database.
- **Bill reminders.** Reminders are local notifications at 9 AM on the day chosen in Settings. Settings also has **Send a test reminder**.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Expo Go shows "native module not found" / crypto errors | Pace uses `react-native-quick-crypto` and other native modules that Expo Go doesn't bundle. Use a development build: `npm run android`. |
| `npm run android` can't find a device | Start an emulator in Android Studio (Device Manager), or plug in a phone with USB debugging on, and check `adb devices`. |
| `SDK location not found` / `ANDROID_HOME` | Set `ANDROID_HOME` (macOS: `export ANDROID_HOME=$HOME/Library/Android/sdk`), or create `android/local.properties` with `sdk.dir=...`. |
| Changed `app.json` or added a native package, and nothing changed | Regenerate the native project: `npx expo prebuild --clean`, then `npm run android`. |
| Metro serves old code | `npx expo start -c` clears the bundler cache. |
| Linking a bank says the keys are invalid | Use the **Sandbox** secret, not Production. Re-enter the keys on Profile. |
| Screens are empty right after linking | Plaid's sandbox takes a few seconds to prepare transactions, and Pace keeps re-checking until they're ready. Tap **Sync now** on Home if needed. |
| Bill reminders don't appear | Allow notifications for Pace in system settings, then use **Settings → Send a test reminder**. |
| Version mismatch warnings | `npx expo install --fix`, then `npx expo-doctor`. |
| A snapshot test fails after a UI change | If the change was intended, run `npx jest -u` and review the snapshot diff. |
| `eas build` asks for a project ID | Run `npx eas-cli@latest init` once (it needs an Expo account). |
