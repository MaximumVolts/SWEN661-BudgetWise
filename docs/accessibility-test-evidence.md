# Accessibility test evidence: Pace desktop 1.0.0

This document supports the [Accessibility Conformance Report](accessibility-conformance-report.md). It records how each part of the evaluation was carried out and what it found. The section numbers (E1–E13) are cited from the report's Remarks column.

**Product tested:** Pace 1.0.0, Windows desktop app (Electron 45.2.3, Chromium engine). Build from branch `electron`, base commit `4d6819a`, with the accessibility fixes described below applied.

**How to read this document:** sections E1–E11 record the first evaluation. Each problem it found has since been fixed. Where a section reports a problem, a **Fixed** note follows it, and [E13](#e13-re-test-after-remediation) records the re-test of every fix.
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

The A/AA scan of all 10 pages was repeated after the fixes in E13: still 0 violations. The AAA counts were unchanged, except Settings, which went from 8 to 9 because of the captions on its two new switches.

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

**Colour-blind mode:** blue positive (#0B5FA5) is 6.29:1 and orange negative (#A64200) is 5.91:1 on the page and 5.00:1 on its pale-orange badge (darkened from #B34700, which was 4.45:1 on the badge — found by the contrast test in `__tests__/a11yContrast-test.ts`). In this mode status is also shown with shapes and patterns.

**Conclusions:**
- **AA text contrast (1.4.3):** met everywhere.
- **AAA (1.4.6):** met in the high-contrast theme. Not met by secondary text in the standard theme, which ranges from 5.73 to 6.62:1.
- **Non-text contrast (1.4.11):** met by the desktop controls. **Not met** in two places:
  - the "previous period" chart line in the standard theme (1.69:1). The chart has a text alternative that gives the previous period's total, and the high-contrast theme makes the line 5.49:1;
  - the off state of the switches in the narrow layout used at 200% zoom or more (1.15:1, or 1.32:1 in high contrast).

**Fixed (E13):**
- The "previous period" token is now `#8C8A84`, the same as the field-border colour. It measures 3.45:1 on white, 3.31:1 on the page background and 3.08:1 on panels. It is still clearly lighter than the current-period line (5.04:1 between the two).
- The narrow layout's switches now use the outline colour for the off track: 3.31:1 in the standard theme and 13.77:1 in high contrast.
- Non-text contrast (1.4.11) is now met everywhere.

## E5. Resize, zoom and reflow

The window was emulated at the viewport sizes that browser zoom produces: 640 CSS px for 200% and 320 CSS px for 400%. Home, Transactions and Monthly Comparison were checked at each size.

| Size | Result |
| --- | --- |
| 200% (640 CSS px) | The layout switches to the single-column tablet/phone layout with a bottom tab bar. Nothing is lost and there's no horizontal page scrolling. Keyboard and axe results were clean (E1, E2). [Screenshot](acr-evidence/zoom-200-home.png). |
| 400% (320 CSS px) | Content reflows to one column with no horizontal page scrolling ([Monthly Comparison](acr-evidence/reflow-320-comparison.png)). Two areas scroll sideways inside their own box:<br>• the Monthly Comparison **data table** (5 columns, 760 px wide), which WCAG 1.4.10 exempts because a data table needs two dimensions;<br>• the **filter buttons** on Transactions (All accounts, Category, Date), which sit in one row that scrolls sideways ([screenshot](acr-evidence/reflow-320-transactions.png)). This one isn't exempt.<br>**Fixed (E13):** the filter buttons now wrap onto more lines, and long account names wrap inside their button. At 320 px nothing on Transactions scrolls sideways ([screenshot](acr-evidence/fixed-reflow-320-transactions.png)). |

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

**Fixed (E13):**
- Sidebar items, the top bar, the search box and key hints now have a minimum height instead of a fixed one.
- Sidebar labels wrap instead of being cut short.
- With the same spacing applied, items grow, and the sidebar scrolls to show the rest. No visible item overlaps another ([screenshot](acr-evidence/fixed-text-spacing-home.png)).

## E7. Windows High Contrast (forced colours)

Windows High Contrast was emulated with the forced-colours media feature.

**Results:**
- All text, borders and icons take the system colours.
- The focus ring shows in the system highlight colour.
- **One loss:** the filled "pill" that marks the current page in the sidebar is removed by forced colours. Screen readers still get the current page (`aria-current="page"`), but sighted high-contrast users lose the visual cue.

[Screenshot](acr-evidence/forced-colors-home.png). The app also has its own **High contrast** setting (Settings → Display).

**Fixed (E13):**
- Under forced colours, the current page in the sidebar is now filled with the system **Highlight** colour, with its text in **HighlightText**.
- The chosen tab and the chosen radio option or chip get the same treatment, since forced colours had removed their fills too.
- Measured with the emulation: the current item's background is the system Highlight colour (rgb 26, 235, 255) where other items have none ([screenshot](acr-evidence/fixed-forced-colors-home.png), [Monthly Comparison](acr-evidence/fixed-forced-colors-comparison.png)).

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

**Fixed (E13):** every data table is now an ARIA table, made of these parts:
- a `table` named after its section ("Transactions", "Category breakdown", "Spending by category", and so on);
- a header row of `columnheader`s;
- rows of one `rowheader` followed by `cell`s.

So a screen reader announces each value with its column name, and its table-navigation commands work. Details:
- **Rows that open:** the row's button sits inside its row header, so every child of a row is a cell. The button is named with the column names, for example "Nov 10, Merchant: Uber, Category: Transportation, …, Amount: −$5.40".
- **Section titles:** titles above tables ("Category breakdown", "Recent transactions", "Recurring & subscriptions", each bill group) were plain text and are now headings.
- **Checked in the running app:** every visible table has headers and contains only cells in its rows (E13). The `a11yDom` tests also check this structure.

**Not done:** this evaluation did **not** include testing with a screen reader (NVDA, JAWS or Narrator). Conformance remarks that depend on screen-reader output rest on the accessibility tree and axe results, not on listening sessions.

## E9. Input purpose and authentication

**`autocomplete` values on input fields:**

| Form | Fields with a correct `autocomplete` value | Missing |
| --- | --- | --- |
| Sign in | Username (`username`), Password (`current-password`) | none |
| Create account | Name (`name`), Username (`username`), Password (`new-password`) | Confirm password (should be `new-password`) |
| Profile | none | Name (`name`) and Username (`username`) |

**Fixed (E13):** Profile → Name is now `name` and Username `username`. Create account → Confirm password is now `new-password`. Forgot password → Username is now `username`, and both new-password fields are `new-password`. Read back from the running app: no personal-data field is missing a value.

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

**Fixed (E13):**
- **Tagged PDFs:** `printToPDF` now passes `generateTaggedPDF: true` (and `generateDocumentOutline: true`).
- **Source HTML:** both the statement and the Monthly Comparison report now have `lang="en"`, `scope="col"` column headers and `scope="row"` row headers, and the statement table has a caption.
- **Verified:** a PDF printed by Electron 45 the same way was inspected. It contains a structure tree (`/StructTreeRoot`, `/MarkInfo << /Marked true >>`), the document language `/Lang (en)` and `H1`, `Table` and `TH` structure elements.
- **Not done:** full PDF/UA validation (for example with PAC) was not run.

## E11. Timing, motion and flashing

- **Timing:**
  - Status notices disappear after **4 seconds** (`SHOW_MS` in `src/state/NoticeContext.tsx`). They're announced politely to screen readers, but sighted users can't pause or extend them.
  - There are no session timeouts. Signing back in is never forced.
  - **Fixed (E13):** status notices now behave as follows:
    - they stay for **10 seconds**;
    - the time doesn't run while the mouse is over a notice or focus is on its button;
    - each has a **Close message** button, with a light focus ring (11.7:1 against the dark bar);
    - **Settings → Keep messages on screen** turns the time limit off, so notices stay until closed (WCAG 2.2.1 "Turn off").
- **Motion and flashing:**
  - Nothing flashes, and nothing scrolls or updates on its own for more than 5 seconds.
  - Page transitions are off on desktop. Dialogs fade in, but nothing moves across the screen.

## E12. Automated test suites

The project's own tests cover the behaviours above: 517 tests in 23 suites, all passing (289 in 19 suites before the remediation, 297 in 20 after it). Coverage is 89.6% of statements, 80.7% of branches, 87.7% of functions and 92.1% of lines. The [test coverage report](test-coverage-report.md) has the details. The accessibility-specific suites are:
- `a11yContrast-test.ts` (115 tests): the WCAG contrast ratio of every text / background pair, plus borders, switch tracks, chart lines and the focus ring, in all four palettes. It found the Colour-blind orange at 4.45:1 on its badge; that colour is now `#A64200` (5.00:1).
- `a11yNames-test.tsx` (53 tests): every screen, in the phone and the desktop layout. Each control, text field, image, group, table and region must have an accessible name (E14).
- `a11yWidgets-test.tsx` (45 tests) covers:
  - chart text alternatives, and patterns as well as colour;
  - bar state (`aria-pressed`), with axis labels hidden;
  - switches and radio groups by keyboard;
  - every Settings switch named by its label;
  - Notifications actions not nested in the card button;
  - focus after keyboard navigation (Ctrl+K, Ctrl+number, Alt+←).

  It found the nested buttons and the bar-chart state; both are fixed.
- `a11yDom-test.tsx`: names, roles, headings, progress bars, dialogs and table structure (table, column headers, row headers, cells).
- `notice-test.tsx`: status notices: read out politely, closed with their button, the time paused while focused, kept until closed with the setting on.
- `keyboard-test.ts`: includes `?` turned off by the Single-key shortcuts setting.
- `bankFeatures-test.ts`, `comparison-test.ts`: the exported HTML has `lang="en"` and `scope` on its column and row headers.
- `keyboardDom-test.tsx`: keys, focus handling, the focus ring and shortcuts.
- `desktopDatePicker-test.tsx`: the date field by keyboard.
- `journeyController-test.tsx`: Back and Forward on the signed-out pages.
- `asyncData-test.tsx`: focus kept while a page reloads.

## E13. Re-test after remediation

Every issue from E1–E11 was fixed, and the desktop app was rebuilt and re-tested with the same scratch data and tools.

| Check | Result |
| --- | --- |
| axe-core A/AA + best practice, all 10 main pages | **0 violations** on every page |
| Full keyboard-only regression (the checklist's scripted run, rebuilt app) | **282 of 282 checks pass**: no traps, every stop has a visible focus indicator and is on screen and not covered, and every shortcut works |
| Tables: Transactions, Spending, Bills (both groups), Accounts, Monthly Comparison | Each is a named `table` with `columnheader`s; each row holds only `rowheader` / `cell` children. Row buttons are named with column names. A click at the centre of any cell reaches the row's button, and a real mouse click on a cell opens the transaction ([screenshot](acr-evidence/fixed-comparison-table.png)) |
| Exported PDF (printed by Electron 45 as the app does) | `/StructTreeRoot`, `/Marked true`, `/Lang (en)`, `H1`, `Table`, `TH` present |
| Text spacing (WCAG 1.4.12 style sheet), Home | No visible sidebar item overlaps another; items grow and the sidebar scrolls ([screenshot](acr-evidence/fixed-text-spacing-home.png)) |
| Forced colours (emulated), Home and Monthly Comparison | Current page filled with the system Highlight colour (rgb 26, 235, 255); others unfilled ([Home](acr-evidence/fixed-forced-colors-home.png), [Monthly Comparison](acr-evidence/fixed-forced-colors-comparison.png)) |
| 320 CSS px (400% zoom), Transactions | Nothing scrolls sideways. Tab reaches the wrapped **Date** filter, which scrolls into view and isn't covered ([screenshot](acr-evidence/fixed-reflow-320-transactions.png)) |
| Narrow-layout switches | Off track `#8C8A84` (rgb 140, 138, 132), 3.31:1 against the page |
| Autocomplete (read from the app) | Sign in, Create account, Profile: every personal-data field has a value (`name`, `username`, `current-password`, `new-password`) |
| Notices | A notice shows a **Close message** button. It's gone after 10 s by default, and still there after 15 s with **Keep messages on screen** on. Enter on Close removes it, and focus returns to the page. The Close button's focus ring is light lime, 11.7:1 against the bar ([screenshot](acr-evidence/fixed-notice-close.png)) |
| Single-key shortcuts | Off: `?` does nothing, and Ctrl+/ still opens the list. On: `?` opens the list, and Esc closes it. The setting is saved per user |
| Automated tests | 297 of 297 passed at the re-test. After the added accessibility suites: 517 of 517 pass (E12) |

The scratch user's settings were put back to their defaults after testing.

## E14. Accessible-name audit

**Method:** for every view and dialog, Chromium's computed accessibility tree (`Accessibility.getFullAXTree` over the DevTools protocol) was read from the rebuilt desktop app, on the scratch data. Every element was listed whose role needs a name (button, link, switch, radio, tab, text field, combo box, image, progress bar, tab list, radio group, list box, table, column / row header, heading, dialog, navigation, region, form) but whose computed name was empty. Icon-font glyphs were not counted as a name. Dialogs and pickers were opened and then closed with Esc; confirmations were never confirmed.

**Views covered (46):**
- **Signed-out pages:** Sign in, Create account, Forgot password.
- **The 10 main pages.**
- **Detail pages:** a transaction, a spending category, a budget category, a bill.
- **Forms:** add budget, add bill, goal, expected income, profile.
- **Account and statement pages:** Manage budgets, Connected accounts, add account, Budget categories, Statement export, Notifications.
- **Dialogs, pickers and lists:**
  - Transactions Date, Account and Category filters;
  - the Monthly Comparison Customize panel and period picker;
  - Bills Recurring tab and Manage recurring bill;
  - the Theme and reminder pickers, and the Delete account confirmation;
  - the top bar's notifications, search results and keyboard-shortcuts list.

| Run | Result |
| --- | --- |
| First run | 25 unnamed elements on 5 views. 24 were SVG drawings, each exposed as an unnamed image inside an already-named progress bar or chart (Home 4, a transaction 1, Budgets 13, Savings goals 6). 1 was the Customize panel's tab list. |
| After the fixes | **0 unnamed elements on all 46 views** |
| axe-core A/AA on the 10 main pages, after the fixes | 0 violations |

**Fixes:** every `<Svg>` is `aria-hidden` (`src/ui/components.tsx`, `src/ui/charts.tsx`). `Tabs` and `SegTabs` require a `label`, and every tab list now has one.

**Automated guard:** `__tests__/a11yNames-test.tsx` repeats the check on all 26 screens in both the phone and the desktop layout (53 tests), so a control added later without a name fails the build.

## Not evaluated

- **The phone and tablet builds** (iOS, Android). This evaluation covers the Windows desktop app only. The responsive layout seen when zooming the desktop app was tested (E5).
- **The macOS desktop build.** It runs the same code, and the unit tests cover the ⌘ key mapping.
- **Screen-reader listening tests**, as noted in E8.
- **Chromium's own date-picker pop-up.** It opens only on a mouse click; from the keyboard, dates are typed instead.

## E15. Turning off animations

**Setting:** **Settings → Accessibility & display → Turn off animations**, saved per user. The same switch is on the phone Settings screen. Animations are also off whenever the operating system asks for reduced motion (`prefers-reduced-motion` on the desktop), even with the switch off.

**Method:** the rebuilt desktop app, on scratch data. The switch was used from the keyboard only (Tab, then Space). Animations were read with `document.getAnimations()` the moment the Monthly Comparison **Customize** panel opened, and the system setting was emulated over the DevTools protocol.

| Check | Result |
| --- | --- |
| Default | Switch off; the Customize panel fades in (one 250 ms animation) |
| Switch reached with Tab and turned on with Space | Pass ([screenshot](acr-evidence/motion-setting-on.png)) |
| Switch on | The panel appears at once (no animations running); the page gets the rule that stops CSS transitions and animations |
| After a reload and signing in again | Still on |
| Switch off, system reduce-motion on | No fade; the rule is on the page |
| System setting cleared | The fade is back |

**Automated:** `motionFor` (the rule: off if the user *or* the system says so) in `featureServices-test.ts`, saving in `repositories-test.ts`, both settings screens and the dialogs' animation in `settingsAndTools-test.tsx` (including the system setting), and the page rule in `a11yWidgets-test.tsx`.
