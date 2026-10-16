# Pace (React Native)

The React Native port of the Pace budgeting app (the Flutter original is in `../pace`). It is built with Expo SDK 57, TypeScript and Expo Router. It uses the React Context API for shared state, and Jest with React Native Testing Library for tests.

Pace only ever talks to **Plaid's sandbox** (`sandbox.plaid.com`). It can't link a real bank, and there is nowhere to enter real bank details.

## First-time setup

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Get free Plaid **sandbox** keys at https://dashboard.plaid.com → Developers → Keys. You need the client ID and the **Sandbox** secret, never the Production one. Each user enters their own keys when creating a Pace account (you can change them later on Profile). Keys are stored only on the device, never in the code or the app build.
4. Start the app:
   - On an Android phone or emulator (a development build, recommended): `npm run android`
   - Or with Expo Go: `npx expo start`, then scan the QR code.
5. In the app:
   1. Create an account. Choose a username, password and security question, and enter your Plaid sandbox keys.
   2. Pick your priorities.
   3. Tap **Connect test bank with Plaid**. This links First Platypus Bank using Plaid's published test user (`user_good` / `pass_good`).

   Right after linking, Plaid takes a few seconds to prepare transactions. The screens fill in on their own.

## Installing on an Android phone (.apk)

Build a release APK with `npx expo run:android --variant release`. The APK is written to `android/app/build/outputs/apk/release/`.

To install it, copy it to the phone and open it, allowing installs from that source. Or install it over USB with `adb install app-release.apk`.

APKs are git-ignored and contain no Plaid keys.

## Commands

| Command | What it does |
| --- | --- |
| `npm test` | All tests (Jest + React Native Testing Library) |
| `npm run test:coverage` | Tests with a coverage report in `coverage/` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint (Expo config) |

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

## Tests

Tests run the real services on an in-memory SQLite database (sql.js), with Plaid replayed from responses recorded from the sandbox (`__tests__/fixtures/plaid_sandbox`). "Today" is fixed to the recording date, 12 October 2026.

Screen tests open the actual routes (`src/views/routes`) with Expo Router's `renderRouter`. Nothing in the tests calls Plaid.
