# Pace – Flutter (MVCS + Navigator 2.0)

```
lib/
  main.dart     Entry point: picks the AppServices and starts the app.
  models/       Pure-Dart data classes (no Flutter), one file per feature (no barrel file:
                import the feature file and `show` the classes you use). Icons are string keys (`iconKey`).
    app_exception.dart    Errors every layer can throw / show (AppException, FieldValidationException).
    money.dart            Money text, shared by services' labels and views' Fmt.
  repositories/ Data access behind services: an interface + in-memory version per store, SQLite
                versions (extend SqliteRepository), and the external sources (Plaid sandbox API,
                Google sign-in, device storage).
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

## Where logic lives
**Services own business logic; controllers own screen state; views own pixels.**

| Concern | Layer |
|---|---|
| Validation (email format, required fields, amounts) | Service – throw `FieldValidationException` (helpers in `services/validators.dart`) |
| Rules & derived figures (budget status thresholds, projections, "current" period, unread rules) | Service – return finished models |
| Multi-step operations (reconnect + resync, sync, link + initial import, mark-read + resolve target) | Service – one method per use case |
| "What next?" decisions (`FlowStep` after sign-in/onboarding/linking, `DeepLinkTarget` for notifications) | Service returns the decision; controller passes it to `AppNavigator` |
| Persistence, API, Plaid, caching, auth tokens | Repositories (services call them) |
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

## Display preferences (Settings → Accessibility & display)
Saved per user in the `user_preferences` table; signed out, the defaults apply. `DisplayController` follows `SettingsService.preferenceChanges` and `PaceApp` applies them app-wide, immediately.
- **High contrast**: switches `C` (via `C.use`) to `Palette.highContrast` (black text on white, darker secondary text, status colors, outlines, dividers and chart lines). Colors are read from `C` when widgets build, so `PaceApp` rebuilds every screen on a switch, keeping their state.
- **Colorblind mode** (off by default; `user_preferences.colorblind_mode`): nothing depends on telling colors apart. The palette becomes colorblind-safe (`Palette.colorblindSafe()`: the olive-vs-red status pair, which red-green color blindness confuses, becomes blue vs orange; also applied on top of high contrast), and status gets shapes and patterns too: budget statuses on Home use distinct shapes (`BudgetStatusMark`: ✓ on track, ⚠ near limit, ⓧ over) and striped bars when near / over, the selected bar in bar charts is hatched, and the previous-period line (and its legend key) is dotted. Off, the app keeps its standard design. Widgets read it with `PaceDisplay.colorblindOf(context)`. On Settings, a live preview under the switch (`ColorblindPreview`) shows the budget statuses in the current mode, and toggling it shows a confirmation message (`BaseController.showNotice`).

## Navigation map (screens are linked)
Every arrow is a controller calling `AppNavigator`; routes are in `app_route.dart`.

| From | Action → destination |
|---|---|
| Sign in | success → `FlowStep` from the service (onboarding → connect bank → home); Forgot password / Create account → placeholders |
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
| Accounts | Link another account → Connect bank · row → Account detail* |
| Bottom nav (any screen with one) | Home / Transactions / Spending / Budgets / Bills |

\* No design yet – shows a "not implemented" toast; add the page in `app_pages.dart` and remove it from `notImplemented()` when you build it.

Auth: the default `AppRouter.sessionGuard` keeps signed-out users on public routes and skips sign-in when already signed in; it re-runs when `AuthService.signedInChanges` emits.

## Running it
`lib/main.dart` currently starts with `demoServices()` (`lib/services/demo/`, in-memory sample data) so you can click through the whole graph: sign in → home → every tab and detail, or create account → onboarding → connect bank → home. Replace it with your real `AppServices(...)` and delete `lib/services/demo/`.

`flutter test` runs `test/navigation_test.dart` (route parsing, deep links, tab/stack behaviour, guard redirects, target/flow mapping).

## What you implement
1. Services in `lib/services/` (REST/Plaid/Firebase/fakes).
2. `AppServices(...)` + `AppRouter.create(...)`, then `runApp(PaceApp(router: router))`.
3. Optionally `AppModals` (real forms) and `RouteGuard`.
