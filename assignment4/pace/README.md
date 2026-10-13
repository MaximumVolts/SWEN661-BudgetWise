# Pace – Flutter (MVCS + Navigator 2.0)

## Project description
Pace is a personal-finance app built with Flutter. You create an account on the device (a username and password, plus your own Plaid sandbox keys), link a bank through Plaid, and see your money in one place:

- **Home:** balances, spending so far this month against last month, budgets, upcoming bills and trends.
- **Transactions:** search, filters, multiple categories per transaction.
- **Spending:** by category over a month, 3 months or a year.
- **Budgets:** a monthly limit per category, tracked month by month.
- **Bills & subscriptions:** recurring payments the bank detects plus your own, with price-change alerts.
- **Notifications:** overdue and upcoming bills, budgets near or over their limit.
- **Cash-flow projection and trends.**
- **Statements:** download a month as PDF or CSV.
- **Profile and settings,** including high-contrast and colorblind modes, and your Plaid sandbox keys.

Pace is a prototype. Every bank connection uses **Plaid's Sandbox** with Plaid's published test bank, so no real bank details can be entered and no real money data exists.

### It will not run in chrome. It needs to either run on an android device, or an android emulator.

Data stored on the device in SQLite (`database/schema.sql`):
- accounts (username, password hash, security question);
- each user's Plaid sandbox keys;
- budgets;
- your own recurring expenses;
- display preferences.

The code follows **MVCS with a repository layer**: views → controllers → services (business rules) → repositories (SQLite, Plaid, device storage). [Architecture](#architecture) explains each layer below.

## How to run the app
**Requirements**
- Flutter 3.24 or newer (developed on 3.47.5).
- An Android emulator or device.
- Free Plaid **Sandbox** keys (client ID and sandbox secret) from [dashboard.plaid.com/developers/keys](https://dashboard.plaid.com/developers/keys). You enter them in the app when you create your account, so nothing needs configuring before you build.

**Steps**
1. Install dependencies and run:
   ```sh
   flutter pub get
   flutter run
   ```
2. In the app, follow [First-time setup](#first-time-setup): create an account with your Plaid sandbox keys, finish onboarding, then **Connect test bank with Plaid**.

## Installing the APK
Pace runs on Android only for now. Just copy the .apk to your device and install it.

**Build it**
```sh
flutter build apk --release
```
The APK is written to `build/app/outputs/flutter-apk/app-release.apk`. It's signed with the debug key, so it installs directly but can't go on the Play Store.

No keys are built into the APK, so one build works for everyone: each person enters their own Plaid sandbox keys when they create their account.

**Install on an emulator or a phone connected by USB**
1. On a phone, turn on **Developer options** (Settings → About phone → tap **Build number** 7 times), then **USB debugging**. Connect the phone and accept the prompt. An emulator needs no setup.
2. Install:
   ```sh
   adb install -r build/app/outputs/flutter-apk/app-release.apk
   ```
   `-r` replaces an older copy and keeps its data. On an emulator, you can also drag the APK onto its window.

**Install on a phone without a computer**
1. Copy `app-release.apk` to the phone (USB, cloud drive, etc.) and open it in the **Files** app.
2. When Android asks, allow that app to **install unknown apps**, then tap **Install**.
3. If Play Protect warns that the app is unrecognized, choose **Install anyway**. That happens because the APK is debug-signed.

To uninstall, remove **Pace** like any other app. That also deletes its on-device data (accounts, budgets).

## First-time setup
Everything in Pace is stored on the phone, so the first time you open it you create a local account:

1. **Sign in screen:** tap **Create account**.
2. **Start your Pace account:** enter your name, a **username** and a password.
   - The username is how you sign in: 3–30 letters, numbers, dots, dashes or underscores, starting with a letter or number. It isn't case-sensitive and can't be changed later.
   - The password needs at least 8 characters, including a letter and a number.
   - Also pick a **security question** and answer. Pace asks it if you use **Forgot password**, so choose an answer you'll remember.
   - Enter your **Plaid sandbox keys**: the **Client ID** and the **Sandbox secret**.
     - **Where to find them:** create a free account at [dashboard.plaid.com](https://dashboard.plaid.com), then go to **Developers → Keys**. Use the *Sandbox* secret, never Production.
     - **Format:** a client ID is 24 characters and a secret is 30, using only 0–9 and a–f.
     - **Storage:** the keys are kept on this phone with your account and used whenever Pace talks to Plaid.
     - **Changing them later:** Settings → Profile → **Plaid sandbox keys**. Leave the secret blank there to keep the saved one.
3. **Set your priorities:** pick what you'd like help with (spending, bills, budgets, subscriptions, saving) and how your income arrives (**Steady paycheck** or **Changes month to month**). Then tap **Continue**.
4. **Bring your accounts together:** tap **Connect test bank with Plaid**.
   - Pace links Plaid's **sandbox** test bank (user `user_good`) for you. You never enter bank details, and no real bank is involved.
   - New accounts must link the test bank before reaching Home.
5. **Home:** balances appear right away. Transactions can take a few seconds to arrive from the sandbox, and screens update on their own when they do.

**Next steps**
- **Budgets:** Budgets tab → **New budget**. Set a monthly limit for a category; it applies to every month.
- **Bills & subscriptions:** the Bills tab shows recurring payments your bank detected. Use **+** to add your own.
- **Display:** Settings (gear icon on Home) has **High contrast** and **Colorblind mode**.
- **Statements:** Settings → **Statement export**, to save a month as PDF or CSV.
- **Signing in again:** you sign in after every restart, with the username and password you created. (Accounts created before usernames existed sign in with their email as the username.) Your data stays on the phone.

## How to run tests
```sh
flutter test              # the whole suite
flutter test --coverage   # also writes coverage/lcov.info
```
The tests need no device, network or Plaid keys:
- **Plaid sandbox replay:** Plaid responses are replayed from real sandbox data in `test/fixtures/plaid_sandbox`, recorded on 2026-10-12, which is "today" in the tests.
- **SQLite:** database tests use an in-process SQLite against the real `schema.sql`.

**What's tested**
- **Feature tests** (`test/features_test.dart`): the real app (services, controllers, views, navigation) used the way a person would. They cover the first run (onboarding → connect bank), Home, Transactions, Spending, Budgets, Bills, Notifications, Cash flow, Trends, Savings goals, Accounts, Profile and Settings.
- **Service tests:** business rules for budgets, bills and subscriptions, statements, search, display preferences, sign-up (username rules), sign-in and password reset.
- **Plaid keys** (`test/plaid_keys_test.dart`): keys required in the right format at sign-up, Profile updates (a blank secret keeps the saved one), every Plaid request using the signed-in user's keys, and storage.
- **Repository tests:**
  - SQLite storage and schema upgrades.
  - Accounts created before usernames still sign in with their old email.
- **Navigation tests:** `test/navigation_test.dart`.
- **Shared helpers:**
  - `test/sandbox.dart` has the sandbox replay and `openSandboxApp(...)`.
  - `test/helpers.dart` has `createAda`, `NoGoogle`, `fieldErrors` and test Plaid keys (`testPlaidClientId`, `testPlaidSecret`).

## Test coverage report
**[docs/coverage.md](docs/coverage.md)** has coverage in total, by layer and by file. At the last run: 179 tests, 94.1% of lines. To regenerate it:
```sh
flutter test --coverage
dart run tool/coverage_report.dart
```

## Known issues and limitations
- **Sandbox only:**
  - Pace never connects to real banks.
  - Plaid's test bank repeats the same transactions every month, so whole months can look identical.
- **Android only:** Pace hasn't been built or tested on iOS.
- **Prototype security shortcuts:**
  - Each user's Plaid secret is stored unencrypted on the phone with their account; in production it belongs on a server.
  - A wrong key is only noticed when connecting a bank. Pace checks the keys' format at sign-up, not whether Plaid accepts them. If Plaid rejects them, the error points to Profile to fix them.
  - Plaid access tokens are kept in plain app storage.
- **Not remembered between launches:**
  - You have to sign in again after every restart.
  - Category changes and notes on transactions are lost.
  - Bills marked paid and subscriptions paused are lost.
  - Which notifications you've read is lost.
  - Savings goals are lost.
- **Not built yet:**
  - These show a "not implemented" message: account details, spending by category, trend details, the tool shortcuts, adding a note, new categories, the theme and bill-reminder pickers, adding expected income, adding or editing savings goals, and the ⋮ menus on Accounts, Transaction detail and Spending's calendar.
  - Google and Apple sign-in are hidden.
  - The **Show values on charts** setting is saved but has no effect.
- **Accounts from before usernames:** they sign in with their old email as the username. Accounts from before Plaid keys moved into the app have no keys until they're added in Profile.
- **Bank linking can be skipped after sign-up:** it's required right after creating an account, but someone who closes the app on the Connect bank screen and signs in later reaches Home without a bank. They can also remove the bank from Profile.
- **Display preferences on the sign-in screen:** it always uses the default look, since display preferences belong to a signed-in user.
- **Your own recurring expenses** aren't matched to bank transactions, so their details page has no payment history.
- **Statements:** only the last 6 months, and posted transactions only (pending ones are left out).
- **Google sign-in code:** the wrapper around the Google plugin has little test coverage, because it needs the real plugin.

## Team member contributions this week
| Team member | Contributions |
|---|---|
| Logan Humphries-Russ | Developed primary code |
| Max Stine | Assisted with code development and videography |
| Carolyn Sangi | Assisted with code development and documentation |

## AI usage summary
We used an AI coding assistant (Claude Code) this week as a pair-programming aid. It helped with:
- planning and implementing features
- restructuring code toward the MVCS and repository patterns
- tracking down bugs
- writing and extending automated tests
- drafting documentation

The team set the requirements and the direction, decided which changes to keep, and checked the results by running the app and the test suite.

---

# Architecture

```
lib/
  main.dart     Entry point: picks the AppServices and starts the app.
  models/       Pure-Dart data classes (no Flutter), one file per feature (no barrel file:
                import the feature file and `show` the classes you use). Icons are string keys (`iconKey`).
    app_exception.dart    Errors every layer can throw / show (AppException, FieldValidationException).
    money.dart            Money text, shared by services' labels and views' Fmt.
  repositories/ Data access behind services: an interface + in-memory version per store, SQLite
                versions (extend SqliteRepository), and the external sources (Plaid sandbox API,
                Google sign-in, device storage). Each user's Plaid sandbox keys are a store too
                (PlaidKeyRepository); SandboxPlaidApi asks for the signed-in user's keys per request.
  services/     Business logic: abstract interfaces + implementations. Bank-data services extend
                BankDataService / AnnotatedBankDataService and depend on each other only through
                interfaces.
    app_services.dart     The service implementations the app runs with.
    validators.dart / date_labels.dart   Business-rule and label helpers.
    demo/                 Composition of the services the app runs with (demoServices()).
  controllers/  ChangeNotifier screen state. Talk to services; never import views or repositories.
    base_controller.dart  BaseController / ScreenController / FormController (shared load, refresh,
                          action, stream and form-submission handling).
    app_navigator.dart    The navigation contract controllers call (views implement it).
    app_dependencies.dart Builds each controller from the services + navigator.
  views/
    *_view.dart       Controller-bound view (loading / error / retry via ControllerScope).
    screens/*_screen  Pure presentational widgets (data + callbacks in).
    widgets/          Shared UI, charts, ControllerScope/Owner, AppIcons.
    navigation/       Navigator 2.0 router, route table, modals (see below).
    pace_app.dart     MaterialApp.router root widget.
    theme.dart / format.dart   Design tokens and display formatting.
```

### Where logic lives
**Services own business logic; controllers own screen state; views own pixels.**

| Concern | Layer |
|---|---|
| Validation (username format, required fields, amounts) | Service – throw `FieldValidationException` (helpers in `services/validators.dart`) |
| Rules & derived figures (budget status thresholds, projections, "current" period, unread rules) | Service – return finished models |
| Multi-step operations (reconnect + resync, sync, link + initial import, mark-read + resolve target) | Service – one method per use case |
| "What next?" decisions (`FlowStep` after sign-in/onboarding/linking, `DeepLinkTarget` for notifications) | Service returns the decision; controller passes it to `AppNavigator` |
| Persistence, API, Plaid, caching, auth tokens | Repositories (services call them) |
| Loading/error status, selected tab/filter, submitting flags, optimistic UI + rollback | Controller |
| Calling `navigator.openX()` | Controller (never decides *what*, only *when*) |
| Formatting for display, icons, layout, semantics | View / `views/format.dart` |

Rule of thumb: if a controller needs an `if` that encodes a product rule, move it into the service method and return the outcome.

### Navigator 2.0
The route stack is state; the Navigator renders it declaratively. All files below are in `lib/views/navigation/`.

| File | Role |
|---|---|
| `app_route.dart` | `AppRouteName` (URL patterns) + `AppRoute` (name + params + query). Round-trips to `Uri`. |
| `app_route_parser.dart` | `RouteInformationParser<List<AppRoute>>`: URL ⇄ stack (deep links, web address bar). |
| `app_router_delegate.dart` | `RouterDelegate` with the stack, `push / pop / replaceAll / openTab`, `RouteGuard` redirects, `revalidate()`. |
| `router_app_navigator.dart` | Implements `AppNavigator` on top of the delegate → controllers navigate without knowing about the router. |
| `app_pages.dart` | Route → View (+ its controller). Un-designed destinations are listed in `notImplemented()`: in-app navigation shows a "not implemented" toast, URLs render `PlaceholderView`. |
| `app_modals.dart` | Sheets/dialogs/pickers (not pages). `DefaultAppModals` has the filter picker, confirmations and the bill / subscription menu; the rest show "not implemented". |
| `app_router.dart` | `AppRouter.create(services:, guard:, initialStack:)` wires everything. |

Behaviours
- **Tabs**: `openTab` makes the stack `[Home, Tab]` with no animation; Back returns to Home. Home stays alive underneath.
- **Details** push on top (animated). Pages are keyed per stack entry, so controllers are created once per page and disposed when it's removed.
- **Deep links / web URLs**: `/transactions/123` → stack `[Home, TransactionDetail(123)]`; unknown URLs → `initialStack`.
- **Auth redirects**: supply a `RouteGuard` (`AppRoute? Function(target)`); call `delegate.revalidate()` when auth state changes.
- **After sign-in / sign-out**: controllers call `openHome()` / `openSignIn()` which reset the stack.
- Requires Flutter ≥ 3.24 (`Navigator.onDidRemovePage`).

### Accessibility (semantics)
- `Tap` is the single tappable primitive: exposes button/enabled/selected/hint and an `onTap` action. **Icon-only taps require `semanticLabel`** (and get a 48×48 minimum target). Taps containing text merge it as their label.
- `Heading` marks titles/section headers (`header: true`); `PaceTopBar` and `SectionHeader` use it.
- Tabs / nav bar / range selectors expose `button + selected` (and "Tab n of 5"); income radios expose `checked` in a mutually-exclusive group; chips expose `selected`; Settings switches merge with their row label (`toggled` state).
- Charts have text alternatives generated from their data (override with `semanticLabel`); bar-chart bars are individual elements (`BarDatum.semanticLabel`). Progress bars announce label + percent when `semanticLabel` is set, otherwise are treated as decorative since adjacent text states the numbers.
- Loading spinner is labelled; errors render as text + "Try again"; action failures use a snackbar.
- Password visibility toggle has a tooltip; text fields use `labelText`/`errorText`.

### Display preferences (Settings → Accessibility & display)
Saved per user in the `user_preferences` table; signed out, the defaults apply. `DisplayController` follows `SettingsService.preferenceChanges` and `PaceApp` applies them app-wide, immediately.
- **High contrast**: switches `C` (via `C.use`) to `Palette.highContrast` (black text on white, darker secondary text, status colors, outlines, dividers and chart lines). Colors are read from `C` when widgets build, so `PaceApp` rebuilds every screen on a switch, keeping their state.
- **Colorblind mode** (off by default; `user_preferences.colorblind_mode`): nothing depends on telling colors apart. The palette becomes colorblind-safe (`Palette.colorblindSafe()`: the olive-vs-red status pair, which red-green color blindness confuses, becomes blue vs orange; also applied on top of high contrast), and status gets shapes and patterns too: budget statuses on Home use distinct shapes (`BudgetStatusMark`: ✓ on track, ⚠ near limit, ⓧ over) and striped bars when near / over, the selected bar in bar charts is hatched, and the previous-period line (and its legend key) is dotted. Off, the app keeps its standard design. Widgets read it with `PaceDisplay.colorblindOf(context)`. On Settings, a live preview under the switch (`ColorblindPreview`) shows the budget statuses in the current mode, and toggling it shows a confirmation message (`BaseController.showNotice`).

### Navigation map (screens are linked)
Every arrow is a controller calling `AppNavigator`; routes are in `app_route.dart`.

| From | Action → destination |
|---|---|
| Sign in | username + password → Home · Forgot password → Reset password (username, then security question) · Create account (name, username, password, security question, Plaid sandbox keys) → onboarding → connect bank → Home |
| Onboarding | Continue → Connect bank (pushed, Back works) |
| Connect bank | Connect → next `FlowStep` (home); linking is required after creating an account (no skip) |
| **Dashboard** | gear → Settings · bell → Notifications · review banner / See more → Transactions tab · account row → Account detail* · Add account → Connect bank · See budget → Budgets tab · budget row → Budget category · See all bills → Bills tab · bill row → Bill detail · See all trends → Trends · trend button → Trend detail* · tools → Recurring / Savings goals / Cash flow |
| Transactions | search (merchant, category, account, note, amount; as you type) · row → Transaction detail · filters → picker sheet |
| Transaction detail | Back · category chips (saved) · New category / Add a note → sheets |
| Budgets | month tabs (limits apply to every month; spending is that month's) · category → Budget category · New budget → budget form · ⋮ → Manage budgets |
| Budget category | Back · Edit → budget form · transaction → Transaction detail |
| Manage budgets | edit → budget form · delete → confirm · New budget → budget form |
| Spending | category → Spending category* · bars highlight |
| Bills (Upcoming ⇄ Recurring) | tab switch swaps pages · Recurring lists Subscriptions and Bills (bank-detected + your own, with price changes) · row → Bill detail · + → New recurring expense form · ⋮ → menu (details, pause / resume, edit / delete for your own) |
| Bill detail | Back · Mark next payment as paid · Pause / Resume tracking · Edit → form · Delete → confirm (your own only) · payment → Transaction detail |
| Savings goals / Cash flow / Trends | Back · actions open sheets / detail* |
| Notifications | tap / "View bill" → closes, then opens the service-provided target (bill, budget category, bills…) · Mark as paid → service |
| Settings | Connected accounts → Accounts · Profile → Profile · Statement export → pick account, month and PDF / CSV, download (system Save dialog) · Budget categories → Manage budgets · Sign out → Sign in · Delete → confirm → Sign in |
| Profile | edit name and Plaid sandbox keys → Save changes (username is read-only) · Connect test bank / Remove → confirm |
| Accounts | Link another account → Connect bank · row → Account detail* |
| Bottom nav (any screen with one) | Home / Transactions / Spending / Budgets / Bills |

\* No design yet – shows a "not implemented" toast; add the page in `app_pages.dart` and remove it from `notImplemented()` when you build it.

Auth: the default `AppRouter.sessionGuard` keeps signed-out users on public routes and skips sign-in when already signed in; it re-runs when `AuthService.signedInChanges` emits.
