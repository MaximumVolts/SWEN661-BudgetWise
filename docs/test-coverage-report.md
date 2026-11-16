# Test coverage report

**App:** Pace (BudgetWise), Expo / React Native, desktop build in Electron
**Date:** 16 November 2026
**Command:** `npm run test:coverage` (Jest 29 with the `jest-expo` preset)
**Result:** 22 suites, **453 tests, all passing**, 4 snapshots passing. `npx tsc --noEmit` and `npx expo lint` are clean.

## Summary

| Metric | Required | Enforced in CI (`coverageThreshold`) | Before this round | **Now** | Change |
| --- | --- | --- | --- | --- | --- |
| Statements | 60% | 75% | 88.09% (4195 / 4762) | **89.37%** (4256 / 4762) | +1.28 |
| Branches | 60% | 75% | 78.22% (2961 / 3785) | **80.02%** (3032 / 3789) | +1.80 |
| Functions | 60% | 75% | 85.66% (1530 / 1786) | **87.34%** (1560 / 1786) | +1.68 |
| Lines | 60% | 75% | 90.79% (3611 / 3977) | **91.95%** (3657 / 3977) | +1.16 |
| Tests | | | 297 in 20 suites | **453 in 22 suites** | +156 |

All four metrics are well above the 60% minimum. `npm run test:coverage` fails if any of them drops below 75%.

## Where the full report is

`npm run test:coverage` writes these files to `coverage/` (the folder is in `.gitignore`, so run the command to regenerate them):

| File | Use |
| --- | --- |
| `coverage/lcov-report/index.html` | Browsable HTML report, file by file and line by line |
| `coverage/lcov.info` | LCOV, for editors and CI tools |
| `coverage/coverage-summary.json` | Totals per file, as JSON |
| `coverage/clover.xml` | Clover XML |

## Coverage by layer

| Layer (`src/…`) | Files | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- | --- |
| `models` | 25 | 98.8% | 91.6% | 98.2% | 98.4% |
| `services` | 29 | 95.3% | 84.7% | 95.0% | 97.5% |
| `ui` (shared components, charts, keyboard, theme) | 14 | 93.4% | 90.3% | 88.8% | 94.9% |
| `state` | 7 | 91.6% | 80.5% | 90.3% | 96.5% |
| `controllers` | 33 | 89.7% | 72.4% | 86.8% | 94.3% |
| `controllers/base` | 2 | 85.5% | 60.9% | 94.1% | 89.5% |
| `views` (frame and keyboard views) | 31 | 97.7% | 64.7% | 97.1% | 97.6% |
| `views/routes` | 31 | 100% | 69.0% | 100% | 100% |
| `views/screens` (phone and tablet) | 29 | 92.7% | 85.5% | 89.5% | 93.0% |
| `views/screens/desktop` | 12 | 79.9% | 63.2% | 73.6% | 80.4% |
| `utils` | 5 | 86.2% | 47.1% | 92.6% | 90.0% |
| `navigation` | 1 | 77.4% | 57.9% | 89.5% | 78.0% |
| `repositories` | 19 | 70.6% | 59.8% | 69.0% | 76.8% |
| `repositories/desktop` | 2 | 83.3% | 40.0% | 88.5% | 83.9% |

Most of the gap in `repositories` is native-only code that Jest cannot run: `expoDatabase.ts` (expo-sqlite), `secretVault.ts` (the platform secure store), `deviceNotifications.ts` (expo-notifications) and `statementSaver.ts` (the share sheet). The tests use stand-ins for these: an in-memory sql.js database with the real schema, and in-memory stores. Everything above the repositories (services, controllers and screens) runs as real code.

## Accessibility tests

This round added **two accessibility suites (156 tests)**, on top of the three that already existed.

| Suite | Tests | What it checks | WCAG 2.2 |
| --- | --- | --- | --- |
| `a11yContrast-test.ts` **(new)** | 115 | Works out the WCAG contrast ratio for every text / background pair in all four palettes (standard, high contrast, and each in colorblind mode). Covers: body, muted, link and danger text on every surface; danger badges; text on lime and on the dark nav; field borders, switch tracks, the chart's previous-period line and the focus ring at 3:1. Also checks that high contrast is never weaker than standard, reaches 7:1 for body text and shows dividers. Checks that colorblind mode uses blue / orange that also differ in lightness. | 1.4.1, 1.4.3, 1.4.6, 1.4.11 |
| `a11yWidgets-test.tsx` **(new)** | 41 | In a real DOM (jsdom with react-native-web, as in the Electron app):<br>• Charts are named images that state their numbers. Bars are named with their values. The chosen bar is `aria-pressed`. Axis labels are hidden so they aren't read twice. Patterns or dashes are drawn, not only colour (colorblind hatching, dashed projection, dotted previous period).<br>• Switches have the switch role, a name and on / off state, and Space flips them once without scrolling the page.<br>• Radio groups: one Tab stop; arrow keys, Home and End move and choose.<br>• Settings page: one `<h1>`, section headings, every switch named by its visible label and usable from the keyboard, named loading indicator, "Try again" on errors.<br>• Notifications page: filter radio group; action buttons are not inside the card's button.<br>• Shortcuts and focus: Ctrl+K goes to search; after Ctrl+number or Alt+← focus moves to the new page; Ctrl+S leaves focus alone; "?" can be turned off but F1 always works; held keys run once. | 1.1.1, 1.3.1, 1.4.1, 2.1.1, 2.1.4, 2.4.3, 2.4.6, 2.5.3, 4.1.2 |
| `a11yDom-test.tsx` | 13 | Fixes from the axe scan: names from visible text, `<h1>` titles, progress bars, radio checked state, dialog backdrop, ARIA data tables | 1.3.1, 2.4.6, 4.1.2 |
| `keyboardDom-test.tsx` | 27 | Arrow-key groups, Space and Enter, Tab kept inside dialogs, focus returning after a dialog, the focus ring, forced-colours rule, shortcuts while typing, mouse Back / Forward, Electron menu | 2.1.1, 2.1.2, 2.4.3, 2.4.7, 1.4.11 |
| `notice-test.tsx` | 4 | Status messages announced politely, a close button, paused while focused, kept on screen if the user chooses | 2.2.1, 4.1.3 |

Several other suites also check accessibility along the way. `keyboard-test.ts` covers the shortcut map and turning single-key shortcuts off. `desktopShell-test.tsx` covers landmarks, link roles and the breadcrumb name. `bankFeatures-test.ts` and `comparison-test.ts` check that exported PDFs have a language and `th scope`, and the screen suites find controls by role and accessible name.

### Coverage of the accessibility code

| File | Before | **Now** (statements / branches) |
| --- | --- | --- |
| `ui/charts.tsx` | 61.0% / 45.1% | **100% / 98.7%** |
| `views/screens/desktop/AccountPagesDesktop.tsx` (Settings, Notifications) | 47.6% / 40.0% | **100% / 96.0%** |
| `views/KeyboardShortcutsView.tsx` | 37.5% / 0% | **100% / 100%** |
| `ui/keyboard.tsx` | 95.9% / 92.1% | 95.9% / 92.1% |
| `ui/theme.ts` | 100% / 100% | 100% / 100% |
| `state/NoticeContext.tsx` | 91.2% / 86.7% | 91.2% / 86.7% |

## Defects the new tests found (fixed)

The new tests found three real accessibility defects that the axe scan had missed. Each test failed before its fix and passes after it.

1. **Danger text in colorblind mode was below AA.** Orange `#B34700` on its pale-orange badge was 4.45:1. It is now `#A64200`, which is 5.00:1 on the badge and 5.91:1 on the page. Fixed in `src/ui/theme.ts` (SC 1.4.3). axe did not catch it because the scan ran with colorblind mode off.
2. **Notification action buttons were inside the card's button.** On a notification with "Mark paid" / "View bill", those buttons sat inside the card's button. That is invalid HTML and an axe `nested-interactive` failure, and screen readers merge them into one control. The card's button now holds only the message, with the actions next to it. Fixed in `src/views/screens/desktop/AccountPagesDesktop.tsx` (SC 4.1.2). The scanned account had no notifications with actions, so axe never saw one.
3. **Bar chart state and labels on desktop.** react-native-web ignores `accessibilityState` and `importantForAccessibility`. As a result, the chosen bar's state never reached screen readers, and each axis label was read a second time after its bar. The chosen bar now has `aria-pressed`, and the axis row has `aria-hidden`. A bar that can't be pressed is now a named image (a plain element may not have an `aria-label`). Fixed in `src/ui/charts.tsx` (SC 1.3.1, 4.1.2). The shared-components snapshot was updated for this change.

## Not covered by automated tests

These are checked by hand. The results are in [accessibility-test-evidence.md](accessibility-test-evidence.md) and [keyboard-testing-checklist.md](keyboard-testing-checklist.md).

- Actual screen-reader output (NVDA / Narrator / VoiceOver).
- Real layout and reflow at 320 px, and text spacing. jsdom has no layout engine, so these were checked in Electron.
- PDF/UA validation of exported statements with an external checker.

## How to run

```sh
npm test                 # all suites
npm run test:coverage    # with coverage; HTML at coverage/lcov-report/index.html
npx jest __tests__/a11y  # only the accessibility suites
```
