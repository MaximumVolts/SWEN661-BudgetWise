# Accessibility test evidence: Pace desktop 1.0.0

This document supports the [Accessibility Conformance Report](accessibility-conformance-report.md). It records how each part of the evaluation was carried out and what it found. The section numbers (E1–E10) are cited from the report's Remarks column.

**Product tested:** Pace 1.0.0, Windows desktop app (Electron 45.2.3, Chromium engine). Build from branch `electron`, base commit `559933f`, with the accessibility fixes described below applied.
**Test platform:** Windows 11 Pro (10.0.26200), 1400 × 950 window at 100% scale.
**Dates:** 14–15 November 2026.
**Test data:** a copy of the app's data with a sandbox bank connection (Plaid sandbox), so tables and charts were populated. No real user data was used.

---

## E1. Automated rules: axe-core

**Tools:** axe-core 4.14.0, injected into the running app; and the **axe DevTools browser extension 4.140.0 (engine 4.13.0)**, loaded into the Electron window.

**Rule sets:**
- **WCAG 2.0, 2.1 and 2.2 at Levels A and AA, plus best practices:** used for the A/AA results below.
- **The same tags plus the WCAG 2.x AAA rules:** used for the AAA results.

**Scope of the A/AA scan:**
- All 11 sidebar pages.
- Every detail page and form.
- Every dialog, picker and panel.
- The signed-out pages: sign in, create account, forgot password (both steps), onboarding and connect bank.

**Results:**

| Scan | Result |
| --- | --- |
| WCAG A/AA + best practice, all views (axe-core 4.14) | **0 violations.** All violations found in the first scan were fixed. The fixes covered 11 rules, from missing dialog names and nested buttons to list structure, autocomplete tokens and label-in-name. |
| axe DevTools extension, Home, WCAG 2.1 AA + best practices | **0 issues:** critical, serious, moderate and minor all 0. See [screenshot](axe-devtools-0-issues.png). |
| WCAG A/AA, zoomed layout (200%, 640 CSS px) on Home, Transactions, Budgets, Bills and Settings | 0 violations |
| AAA rules on the 10 main pages | Only `color-contrast-enhanced` (1.4.6) fails, in the standard theme (see E4). There are no other AAA failures. |
| "Needs review" items | `color-contrast` on icon glyphs: the icons are font characters, not text, so this is not applicable. `label-content-name-mismatch`: axe couldn't decide automatically; checked by hand and named by visible text. |

Per page, with AAA rules included (counts of elements):

| Page | A/AA violations | AAA contrast (1.4.6) | Rules passed | Controls under 44 × 44 px |
| --- | ---: | ---: | ---: | ---: |
| Home | 0 | 18 | 43 | 2 |
| Transactions | 0 | 4 | 43 | 5 |
| Spending | 0 | 4 | 43 | 2 |
| Budgets | 0 | 10 | 42 | 2 |
| Bills | 0 | 9 | 43 | 2 |
| Monthly Comparison | 0 | 11 | 43 | 0 |
| Savings goals | 0 | 12 | 42 | 0 |
| Cash flow | 0 | 15 | 42 | 2 |
| Trends | 0 | 4 | 40 | 0 |
| Settings | 0 | 8 | 42 | 5 |

## E2. Keyboard-only testing

Full method and results are in the [keyboard testing checklist](keyboard-testing-checklist.md).

- **Scope:**
  - 41 views were audited with Tab and Shift+Tab, 775 focus stops in all.
  - Every documented shortcut was tested.
  - Arrow keys, Enter, Space and Esc were tested on every widget type.
  - The tasks run included signing in and out, creating an account and onboarding, creating a budget and a goal, setting a date, search, filters, and settings.
- **Result:** all 284 checks pass. There are no keyboard traps, and every focus stop has a visible focus indicator. The focused control was never off screen or covered.
- **Zoomed layout:** the 200% layout was also audited on Home, Transactions, Budgets, Bills and Settings. Every check passed there too.
- **Problems fixed:** testing found 10 keyboard problems, all fixed before this report. They included links that ignored Enter, shortcuts that didn't work in text fields, one keyboard trap, focus lost after dialogs closed, and the date field.

## E3. Focus appearance

- **Ring style:** every control without a focus style of its own gets a **3 px solid ring in the theme's ink colour, offset 2 px**. That's #1A1A1A in the standard theme and #000000 in high contrast. Against the page background it measures 16.7:1 in the standard theme and 21:1 in high contrast.
- **Text fields:** the field's border changes from a 1 px #8C8A84 line to a 2 px ink line.
- **Before the fix:** some controls showed only Chromium's default 1 px focus outline, at 2.3:1 against the background. All of them now use the app ring.
- **Screenshots:** in [docs/keyboard-testing/](keyboard-testing/), including button unfocused / focused, a sidebar link, a text field and the skip link.

## E4. Colour contrast

Contrast ratios of the colour pairs the interface uses, worked out from the design tokens in `src/ui/theme.ts`:

| Pair | Standard theme | High-contrast theme | Used for |
| --- | ---: | ---: | --- |
| Ink text on page background | 16.66 | 21.00 | Body text, headings |
| Secondary text on page background | 6.62 | 13.77 | Captions, subtitles |
| Secondary text on panel | 6.16 | 12.06 | Sidebar group labels |
| Secondary text on chip | 5.73 | 10.42 | Search placeholder |
| Positive (olive) text on background | 7.86 | 13.29 | "On track", positive amounts |
| Negative (red) text on background | 5.64 | 8.36 | Over budget, money owed |
| Red text on red tint | 4.57 | 6.49 | Error banners |
| White text on navigation pill | 15.56 | 21.00 | Current page in sidebar |
| Ink text on lime | 14.37 | 17.34 | Highlight cards, "New" badge |
| Field border on white | 3.45 | 13.77 | Text fields, pickers (WCAG 1.4.11) |
| "Previous period" chart line on white | **1.69** | 5.49 | Comparison line in spending charts |
| Card divider lines | 1.53 | 6.68 | Decorative separators (not required) |
| Desktop switch, off track on panel | 3.08 | 13.77 | Settings switches (desktop layout) |
| Progress-bar fill on its track | 14.44 | 15.89 | Budget progress |
| Narrow-layout switch, off track on background | **1.15** | **1.32** | Settings switches at 200% zoom or more (phone layout) |

**Colour-blind mode:** blue positive (#0B5FA5) is 6.29:1 and orange negative (#B34700) is 5.27:1. In this mode status is also shown with shapes and patterns.

**Conclusions:**
- **AA text contrast (1.4.3):** met everywhere.
- **AAA (1.4.6):** met in the high-contrast theme. Not met by secondary text in the standard theme, which ranges from 5.73 to 6.62:1.
- **Non-text contrast (1.4.11):** met by the desktop controls. **Not met** in two places:
  - the "previous period" chart line in the standard theme (1.69:1). The chart has a text alternative that gives the previous period's total, and the high-contrast theme makes the line 5.49:1;
  - the off state of the switches in the narrow layout used at 200% zoom or more (1.15:1, or 1.32:1 in high contrast).

## E5. Resize, zoom and reflow

The window was emulated at the viewport sizes that browser zoom produces: 640 CSS px for 200% and 320 CSS px for 400%. Home, Transactions and Monthly Comparison were checked at each size.

| Size | Result |
| --- | --- |
| 200% (640 CSS px) | The layout switches to the single-column tablet/phone layout with a bottom tab bar. Nothing is lost and there's no horizontal page scrolling. Keyboard and axe results were clean (E1, E2). [Screenshot](acr-evidence/zoom-200-home.png). |
| 400% (320 CSS px) | Content reflows to one column with no horizontal page scrolling ([Monthly Comparison](acr-evidence/reflow-320-comparison.png)). Two areas scroll sideways inside their own box:<br>• the Monthly Comparison **data table** (5 columns, 760 px wide), which WCAG 1.4.10 exempts because a data table needs two dimensions;<br>• the **filter buttons** on Transactions (All accounts, Category, Date), which sit in one row that scrolls sideways ([screenshot](acr-evidence/reflow-320-transactions.png)). This one isn't exempt. |

Text can be enlarged with **View → Zoom In** (Ctrl + = / Ctrl + −). There is no in-app text-size setting.

## E6. Text spacing (WCAG 1.4.12)

A style sheet applying the WCAG 1.4.12 spacing was added to the page:
- line height 1.5;
- letter spacing 0.12 em;
- word spacing 0.16 em;
- paragraph spacing 2 em.

**Results:**
- Page content reflowed without loss on Home and Budgets.
- **The sidebar did not.** Its items have a fixed height, so labels overlap: "Trends" is covered by "Notifications", and "Monthly Comparison" is cut to "Monthly Co…".
- The Ctrl K key hints in the search box overflow their boxes.

[Screenshot](acr-evidence/text-spacing-home.png).

## E7. Windows High Contrast (forced colours)

Windows High Contrast was emulated with the forced-colours media feature.

**Results:**
- All text, borders and icons take the system colours.
- The focus ring shows in the system highlight colour.
- **One loss:** the filled "pill" that marks the current page in the sidebar is removed by forced colours. Screen readers still get the current page (`aria-current="page"`), but sighted high-contrast users lose the visual cue.

[Screenshot](acr-evidence/forced-colors-home.png). The app also has its own **High contrast** setting (Settings → Display).

## E8. Names, roles and states (accessibility tree)

The DOM accessibility semantics were checked for each kind of control. Chromium exposes them to Windows UI Automation and MSAA.

**Checked and correct:**
- **Landmarks:** banner, three navigation regions, main and complementary.
- **Headings:** an `h1` per page, then `h2`/`h3`.
- **Buttons and links:** each has a name that matches its visible text.
- **State:**
  - Radio groups and tab lists expose the chosen item (`aria-checked` / `aria-selected`).
  - Switches and checkboxes expose `aria-checked`.
  - Progress bars expose their value (`aria-valuenow` and `aria-valuetext`).
  - Dialogs are named and modal.
  - The search box is a combobox with `aria-activedescendant`.
  - Form errors use `aria-invalid` with the message as the field's hint.
  - Status notices use `role="status"`.
- **Charts:** each chart has a text alternative (`role="img"`), for example "Spending trend chart. Spent so far $190. Projected to reach $379. Previous period ended at $2,196".

**Issue found:**
- **Data tables (Transactions, Spending categories, Monthly Comparison and others) are lists of row buttons, not grid or table structures.** Column headers are therefore not associated with cells. On most tables the row reads clearly on its own ("Nov 10 Uber Transportation Plaid Checking Posted −$5.40"). On Monthly Comparison the numbers lose their meaning without the column names ("Food & drink $516 $16 −$500 Down −96.8%").

**Not done:** this evaluation did **not** include testing with a screen reader (NVDA, JAWS or Narrator). Conformance remarks that depend on screen-reader output rest on the accessibility tree and axe results, not on listening sessions.

## E9. Input purpose and authentication

**`autocomplete` values on input fields:**

| Form | Fields with a correct `autocomplete` value | Missing |
| --- | --- | --- |
| Sign in | Username (`username`), Password (`current-password`) | none |
| Create account | Name (`name`), Username (`username`), Password (`new-password`) | Confirm password (should be `new-password`) |
| Profile | none | Name (`name`) and Username (`username`) |

**Authentication:**
- Password fields accept pasted text and password-manager autofill, and have "Show password".
- The password-reset security answer is a plain text field that accepts paste.
- No CAPTCHA, puzzle or transcription is used.

## E10. Exported documents (statements and comparison reports)

Pace exports statements and the Monthly Comparison report as **CSV** and **PDF**.

| Format | Findings |
| --- | --- |
| CSV | A header row names every column. The data is plain text. The structure is kept. |
| PDF | Made from HTML with a real `<h1>`, a `<table>` with `<th>` headers and a `<title>`. The PDF is **untagged**: Electron's `generateTaggedPDF` option isn't used, so headings, table structure and reading order are not tagged for assistive technology. The source HTML also has no `lang` attribute, so the document language isn't set. The text is real text (not images) and can be selected and read. Contrast of the grey text in the PDF is 6.91:1. |

Code: `src/services/statementEncoders.ts` (HTML) and `desktop/main.js` (`printToPDF`).

## E11. Timing, motion and flashing

- **Timing:**
  - Status notices disappear after **4 seconds** (`SHOW_MS` in `src/state/NoticeContext.tsx`). They're announced politely to screen readers, but sighted users can't pause or extend them.
  - There are no session timeouts. Signing back in is never forced.
- **Motion and flashing:**
  - Nothing flashes, and nothing scrolls or updates on its own for more than 5 seconds.
  - Page transitions are off on desktop. Dialogs fade in, but nothing moves across the screen.

## E12. Automated test suites

The project's own tests cover the behaviours above: 289 tests in 19 suites, all passing. Coverage is about 88% of statements, 78% of branches, 86% of functions and 91% of lines. The accessibility-specific suites are:
- `a11yDom-test.tsx`: names, roles, headings, progress bars, dialogs and table structure.
- `keyboardDom-test.tsx`: keys, focus handling, the focus ring and shortcuts.
- `desktopDatePicker-test.tsx`: the date field by keyboard.
- `journeyController-test.tsx`: Back and Forward on the signed-out pages.
- `asyncData-test.tsx`: focus kept while a page reloads.

## Not evaluated

- **The phone and tablet builds** (iOS, Android). This evaluation covers the Windows desktop app only. The responsive layout seen when zooming the desktop app was tested (E5).
- **The macOS desktop build.** It runs the same code, and the unit tests cover the ⌘ key mapping.
- **Screen-reader listening tests**, as noted in E8.
- **Chromium's own date-picker pop-up.** It opens only on a mouse click; from the keyboard, dates are typed instead.
