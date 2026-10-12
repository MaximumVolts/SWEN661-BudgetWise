# Pace – Flutter (MVCS + Navigator 2.0)

```
lib/
  main.dart     Entry point: picks the AppServices and starts the app.
  models/       Pure-Dart data classes (no Flutter), one file per feature (no barrel file:
                import the feature file and `show` the classes you use). Icons are string keys (`iconKey`).
  repositories/ Data access behind services.
  services/     Abstract interfaces: data, auth, Plaid… plus AppNavigator (navigation contract).
    app_services.dart     The service implementations the app runs with.
    app_exception.dart    Errors services throw for controllers to show.
    validators.dart / date_labels.dart   Business-rule and label helpers.
    demo/                 DEV ONLY in-memory services.
  controllers/  ChangeNotifier state + logic. Talk to services; never import views.
    app_dependencies.dart Builds each controller from the services + navigator.
  views/
    *_view.dart       Controller-bound view (loading / error / retry via ControllerScope).
    screens/*_screen  Pure presentational widgets (data + callbacks in).
    widgets/          Shared UI, charts, ControllerScope/Owner, AppIcons.
    navigation/       Navigator 2.0 router, route table, modals (see below).
    pace_app.dart     MaterialApp.router root widget.
    theme.dart / format.dart   Design tokens and display formatting.
```

## Where logic lives
**Services own business logic; controllers own screen state; views own pixels.**

| Concern | Layer |
|---|---|
| Validation (email format, required fields, amounts) | Service – throw `FieldValidationException` (helpers in `services/validators.dart`) |
| Rules & derived figures (budget status thresholds, projections, "current" period, unread rules) | Service – return finished models |
| Multi-step operations (reconnect + resync, sync, link + initial import, mark-read + resolve target) | Service – one method per use case |
| "What next?" decisions (`FlowStep` after sign-in/onboarding/linking, `DeepLinkTarget` for notifications) | Service returns the decision; controller passes it to `AppNavigator` |
| Persistence, API, Plaid, caching, auth tokens | Service implementations |
| Loading/error status, selected tab/filter, submitting flags, optimistic UI + rollback | Controller |
| Calling `navigator.openX()` | Controller (never decides *what*, only *when*) |
| Formatting for display, icons, layout, semantics | View / `views/format.dart` |

Rule of thumb: if a controller needs an `if` that encodes a product rule, move it into the service method and return the outcome.

## Navigator 2.0
The route stack is state; the Navigator renders it declaratively. All files below are in `lib/views/navigation/`.

| File | Role |
|---|---|
| `app_route.dart` | `AppRouteName` (URL patterns) + `AppRoute` (name + params + query). Round-trips to `Uri`. |
| `app_route_parser.dart` | `RouteInformationParser<List<AppRoute>>`: URL ⇄ stack (deep links, web address bar). |
| `app_router_delegate.dart` | `RouterDelegate` with the stack, `push / pop / replaceAll / openTab`, `RouteGuard` redirects, `revalidate()`. |
| `router_app_navigator.dart` | Implements `AppNavigator` on top of the delegate → controllers navigate without knowing about the router. |
| `app_pages.dart` | Route → View (+ its controller). Un-designed destinations are listed in `notImplemented()`: in-app navigation shows a "not implemented" toast, URLs render `PlaceholderView`. |
| `app_modals.dart` | Sheets/dialogs/pickers (not pages). `DefaultAppModals` has pickFilter + delete-confirm; the rest are stubs to replace. |
| `app_router.dart` | `AppRouter.create(services:, guard:, initialStack:)` wires everything. |

Behaviours
- **Tabs**: `openTab` makes the stack `[Home, Tab]` with no animation; Back returns to Home. Home stays alive underneath.
- **Details** push on top (animated). Pages are keyed per stack entry, so controllers are created once per page and disposed when it's removed.
- **Deep links / web URLs**: `/transactions/123` → stack `[Home, TransactionDetail(123)]`; unknown URLs → `initialStack`.
- **Auth redirects**: supply a `RouteGuard` (`AppRoute? Function(target)`); call `delegate.revalidate()` when auth state changes.
- **After sign-in / sign-out**: controllers call `openHome()` / `openSignIn()` which reset the stack.
- Requires Flutter ≥ 3.24 (`Navigator.onDidRemovePage`).

## Accessibility (semantics)
- `Tap` is the single tappable primitive: exposes button/enabled/selected/hint and an `onTap` action. **Icon-only taps require `semanticLabel`** (and get a 48×48 minimum target). Taps containing text merge it as their label.
- `Heading` marks titles/section headers (`header: true`); `PaceTopBar` and `SectionHeader` use it.
- Tabs / nav bar / range selectors expose `button + selected` (and "Tab n of 5"); income radios expose `checked` in a mutually-exclusive group; chips expose `selected`; Settings switches merge with their row label (`toggled` state).
- Charts have text alternatives generated from their data (override with `semanticLabel`); bar-chart bars are individual elements (`BarDatum.semanticLabel`). Progress bars announce label + percent when `semanticLabel` is set, otherwise are treated as decorative since adjacent text states the numbers.
- Loading spinner is labelled; errors render as text + "Try again"; action failures use a snackbar.
- Password visibility toggle has a tooltip; text fields use `labelText`/`errorText`.

## Navigation map (screens are linked)
Every arrow is a controller calling `AppNavigator`; routes are in `app_route.dart`.

| From | Action → destination |
|---|---|
| Sign in | success → `FlowStep` from the service (onboarding → connect bank → home); Forgot password / Create account → placeholders |
| Onboarding | Continue → Connect bank (pushed, Back works) |
| Connect bank | Connect / Not now → next `FlowStep` (home) |
| **Dashboard** | gear → Settings · bell → Notifications · review banner / See more → Transactions tab · account row → Account detail* · Add account → Connect bank · See budget → Budgets tab · budget row → Budget category · See all bills → Bills tab · bill row → Bill detail* · See all trends → Trends · trend button → Trend detail* · tools → Recurring / Savings goals / Cash flow |
| Transactions | row → Transaction detail · filters → picker sheet |
| Transaction detail | Back · category chips (saved) · New category / Add a note → sheets |
| Budgets | category → Budget category · Add category → sheet |
| Budget category | Back · Edit → sheet · transaction → Transaction detail |
| Spending | category → Spending category* · bars highlight |
| Bills (Upcoming ⇄ Recurring) | tab switch swaps pages · row → Bill detail* · + → sheet · ⋮ → subscription menu |
| Savings goals / Cash flow / Trends | Back · actions open sheets / detail* |
| Notifications | tap / "View bill" → closes, then opens the service-provided target (bill, budget category, bills…) · Mark as paid → service |
| Settings | Connected accounts → Accounts · Profile, Statement export, Security, Budget categories → pages* · Terms/Privacy → external · Sign out → Sign in · Delete → confirm → Sign in |
| Accounts | Link another account → Connect bank · row → Account detail* |
| Bottom nav (any screen with one) | Home / Transactions / Spending / Budgets / Bills |

\* No design yet – shows a "not implemented" toast; add the page in `app_pages.dart` and remove it from `notImplemented()` when you build it.

Auth: the default `AppRouter.sessionGuard` keeps signed-out users on public routes and skips sign-in when already signed in; it re-runs when `AuthService.signedInChanges` emits.

## Running it
`lib/main.dart` currently starts with `demoServices()` (`lib/services/demo/`, in-memory sample data) so you can click through the whole graph: sign in → home → every tab and detail, or create account / first-time Google sign-in → onboarding → connect bank → home. Replace it with your real `AppServices(...)` and delete `lib/services/demo/`.

`flutter test` runs `test/navigation_test.dart` (route parsing, deep links, tab/stack behaviour, guard redirects, target/flow mapping).

Run with the Google client IDs: `flutter run --dart-define-from-file=config/google_sign_in.json` (the VS Code launch config in `.vscode/launch.json` already passes it).

## Google Sign-In setup
"Continue with Google" uses the official `google_sign_in` plugin (Android and iOS). The first time a Google user signs in, `RepositoryAuthService` creates their Pace account (→ onboarding); after that they go straight home. If a Pace account already uses the same email, Google is linked to it.

| Layer | File |
|---|---|
| Models | `models/google_account.dart` (what Google returns), `models/user_account.dart` (the Pace account) |
| Repository | `repositories/user_account_repository.dart` (`InMemoryUserAccountRepository` until real storage exists) |
| Services | `services/google_account_service.dart` (interface), `services/google_sign_in_account_service.dart` (plugin), `services/repository_auth_service.dart` (account rules) |
| Controller | `SignInController.signInWithGoogle` → `navigator.openFlowStep(...)` |

Without client IDs the button shows "Google sign-in isn't set up for this build yet." To enable it, in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (one project, OAuth consent screen configured), create three OAuth client IDs:

1. **Web application** – no settings needed. Put its ID in `config/google_sign_in.json` as `GOOGLE_SERVER_CLIENT_ID` (Android requires it).
2. **Android** – package name `com.example.pace` (`android/app/build.gradle.kts`) and the SHA-1 of your signing key (`cd android && ./gradlew signingReport`; use the debug key for development, and add the release key's SHA-1 too before releasing).
3. **iOS** – bundle ID `com.example.pace`. Put its ID in `config/google_sign_in.json` as `GOOGLE_IOS_CLIENT_ID`, and its *reversed* form (`com.googleusercontent.apps.<id-prefix>`) in `ios/Flutter/GoogleSignIn.xcconfig` as `GOOGLE_REVERSED_CLIENT_ID` (used as the URL scheme in `ios/Runner/Info.plist`).

`com.example.*` IDs work for development, but change the package / bundle ID before publishing (and update the OAuth clients to match).

Prototype limits: accounts live in memory (lost on restart), and there is no backend verifying Google's ID token (`GoogleAccount.idToken`); a real backend must verify it before trusting the account.

## What you implement
1. Services in `lib/services/` (REST/Plaid/Firebase/fakes).
2. `AppServices(...)` + `AppRouter.create(...)`, then `runApp(PaceApp(router: router))`.
3. Optionally `AppModals` (real forms) and `RouteGuard`.
