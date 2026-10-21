---
title: "Pace: Flutter vs React Native"
subtitle: "SWEN 661, Assignment 5: Framework Comparison Analysis"
author: "Team 2 (Pace)"
date: "October 2026"
---

# Flutter vs React Native: lessons from building Pace twice

We built Pace, a budgeting app for young professionals with Plaid sandbox banking, budgets, bills, reminders and colorblind-friendly charts, first in Flutter (`assignment4/pace`) and then in React Native with Expo (`assignment4/pace-rn`). Both versions use the same MVCS + repository architecture and cover the same 28 screens. That made this a controlled comparison: the features stayed the same and only the framework changed.

| Metric | Flutter | React Native |
| --- | --- | --- |
| App source | ~17,500 lines of Dart, 204 files | ~12,600 lines of TypeScript, 205 files |
| Test code | ~4,400 lines, ~216 tests | ~6,900 lines, 167 tests |
| Line coverage | 94.0% | 91.1% (87.8% statements) |
| Key packages | sqflite, flutter_secure_storage, flutter_local_notifications | expo-sqlite, expo-secure-store, expo-notifications |

## Development experience

**Ease of learning.** React Native was easier for us to pick up, because we already knew TypeScript and React. Hooks, props and Context carried straight over, and the main new idea was replacing HTML elements with `View`, `Text` and `Pressable`. Flutter meant learning Dart, the widget tree, `BuildContext` and how `ChangeNotifier` rebuilds work. Once that clicked, though, Flutter was more predictable: one widget system, one layout model, and no CSS-like style objects to keep track of.

**Documentation.** Flutter's documentation is more consistent. The API reference, cookbook and widget catalogue are all versioned together. Expo's documentation is excellent and offers versioned Markdown for each SDK. The overall React Native picture, though, is spread across reactnative.dev, Expo, React Navigation/Expo Router and each library's README. Expo ships breaking changes every SDK release, so we had to check that the docs matched SDK 57.

**Hot reload.** Both were fast for UI changes (well under a second). Flutter's stateful hot reload kept screen state more reliably. React Native's Fast Refresh sometimes remounted a screen after we changed a hook. Changes to native configuration needed a full rebuild in both: `flutter run` or `expo prebuild` plus `run:android`.

**Debugging.** Flutter DevTools (widget inspector, layout explorer, performance overlay) felt more polished. In React Native we used React DevTools and the Expo dev menu. Because the code is plain TypeScript, `tsc` and ESLint caught many errors before the app ever ran. Our ESLint import rules even enforce the MVCS layers, which Dart's analyzer cannot do as easily.

## Performance observations

Both versions felt smooth on a mid-range Android emulator and a physical phone in normal use: scrolling the transaction list, switching tabs and opening detail screens. Flutter was a little smoother when animating charts and drawing long lists. It draws every pixel itself with Impeller, so there is no JavaScript-to-native hop. React Native's New Architecture (JSI/Fabric) narrowed the gap. The one hitch we noticed was the first render of the dashboard right after a Plaid sync, when parsing a large JSON response and drawing the SVG charts happened on the JS thread together. Release-build startup time and APK size were similar. *(Add measured numbers here if you profile startup time or frame rate.)*

## Accessibility implementation

Both frameworks expose the same platform screen readers (TalkBack and VoiceOver), but they model accessibility differently. Flutter wraps widgets in `Semantics`. React Native puts accessibility props on each component:

```dart
// Flutter: a semantics wrapper around the widget
Semantics(header: true, child: Text('Remind me about bills', style: T.title))
```

```tsx
// React Native: props on the component itself
<Text accessibilityRole="header" style={t.title}>Remind me about bills</Text>
<Pressable accessibilityRole="tab" accessibilityLabel="Spending"
           accessibilityState={{ selected: on }} onPress={() => onSelect(2)} />
```

Material widgets in Flutter come with a lot of semantics built in (buttons, switches, list tiles), so we wrote less accessibility code there. In React Native, a bare `Pressable` announces nothing useful until you add a role and a label. We solved this by routing every touch target through one shared `Tap` component that requires a label for icon-only buttons and enforces a 48×48 target. Colorblind mode (shapes and patterns as well as color) and high contrast were equally easy in both, because both read colors from a single theme. Tests felt similar too: `find.bySemanticsLabel` in Flutter, and `getByRole` / `getByLabelText` in React Native Testing Library.

## Code complexity

React Native needed about 28% fewer lines for the same features. Flutter's nested widget constructors (`Padding(child: Row(children: [...]))`) and explicit view/controller wiring add bulk. JSX with inline style objects is denser. Flutter's code is more uniform, though: a single `ThemeData` and Material components meant fewer one-off styles. Our React Native screens have more inline styles, which are harder to review. For maintainability, TypeScript's structural types and the ESLint layer rules worked as well as Dart's sound null safety. React Native's bigger risk is dependency churn: 26 runtime npm packages that must all match the Expo SDK, against a smaller and more stable set of pub packages.

## Recommendation

For a real product built by a team with web/React skills, we would choose **React Native with Expo**. The team ramps up faster, can share code and people with a web front end, EAS gives cloud builds for both platforms without a Mac, and over-the-air updates through `eas update` are a big operational win. We would choose **Flutter** when pixel-perfect custom UI, heavy animation or charts, or consistent rendering across mobile, desktop and embedded matter most, or for a team starting fresh without a JavaScript background.

| Project type | Better fit |
| --- | --- |
| Product with an existing React web app / JS team | React Native |
| Brand-heavy, animation- or graphics-intensive UI | Flutter |
| Fast iteration with OTA updates | React Native (Expo) |
| One codebase for mobile + desktop + embedded | Flutter |
| Mostly native UI with deep platform integration | React Native |

**Bottom line:** both frameworks can deliver Pace's features with good accessibility and test coverage. The decision comes down to team skills and how custom the UI is, more than to any capability gap.
