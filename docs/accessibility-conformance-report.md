# Pace Accessibility Conformance Report
## International Edition (INT)

**Based on VPAT® Version 2.5Rev INT**

| | |
| --- | --- |
| **Name of Product/Version** | Pace (BudgetWise) 1.0.0, Windows desktop app (Electron 45.2.3) |
| **Report Date** | 15 November 2026 |
| **Product Description** | Pace is a personal budgeting app. It connects to bank accounts (Plaid sandbox), shows spending, budgets, bills and savings goals, and compares months. It also projects cash flow and exports statements as CSV or PDF. The desktop app is the Expo / React Native web build running in Electron. It is operated with mouse or keyboard and has its own keyboard shortcuts. |
| **Contact Information** | Pace project team, SWEN 661 (GitHub: `g3arshift`; repository `SWEN661-BudgetWise`) |
| **Notes** | **Scope:** the Windows desktop app only, signed in and signed out, including documents it exports. The iOS and Android builds from the same code base were **not** evaluated, and the macOS desktop build was not run.<br>**Screen readers:** no screen-reader listening tests (NVDA, JAWS, Narrator) were done. Where a remark depends on what assistive technology announces, it rests on the accessibility tree and automated checks (see Evaluation Methods).<br>**Evidence:** sections E1–E13 of the [Accessibility test evidence](accessibility-test-evidence.md) document are cited throughout. |
| **Evaluation Methods Used** | 1. **Automated testing:** axe-core 4.14.0 (WCAG 2.0/2.1/2.2 A, AA and AAA rules plus best practices) on every view, and the axe DevTools extension 4.140.0 inside the app (E1).<br>2. **Keyboard-only testing:** a scripted run on 41 views with no mouse use. It covered 775 focus stops, every shortcut, and the main tasks: 284 checks, all passing ([checklist](keyboard-testing-checklist.md), E2).<br>3. **Focus appearance and contrast:** measured from the design tokens, with screenshots (E3, E4).<br>4. **Zoom, reflow, text spacing and Windows High Contrast:** emulated at 200% and 400% zoom, with WCAG 1.4.12 spacing and forced colours (E5–E7).<br>5. **Accessibility tree:** names, roles, states and relationships inspected (E8).<br>6. **Code review:** input purpose, timing, exported documents (E9–E11).<br>7. **Automated unit tests:** 453 tests, including 156 accessibility-specific tests: WCAG contrast ratios for every palette, and DOM tests of names, roles, states, keyboard operation and focus (E12, [coverage report](test-coverage-report.md)).<br>8. **Remediation and re-test:** every issue the first evaluation found was fixed, then re-tested in the running app, with axe and the keyboard run repeated (E13).<br>Testing was done on Windows 11 Pro. |

## Applicable Standards/Guidelines

This report covers the degree of conformance for the following accessibility standards/guidelines:

| Standard/Guideline | Included In Report |
| --- | --- |
| [Web Content Accessibility Guidelines 2.0](https://www.w3.org/TR/2008/REC-WCAG20-20081211) | Level A (Yes)<br>Level AA (Yes)<br>Level AAA (Yes) |
| [Web Content Accessibility Guidelines 2.1](https://www.w3.org/TR/WCAG21) | Level A (Yes)<br>Level AA (Yes)<br>Level AAA (Yes) |
| [Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22) | Level A (Yes)<br>Level AA (Yes)<br>Level AAA (Yes) |
| [Revised Section 508 standards](https://www.access-board.gov/ict/) published January 18, 2017 and corrected January 22, 2018 | (Yes) |
| [EN 301 549 Accessibility requirements for ICT products and services](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf) V3.2.1 (2021-03) | (Yes) |

## Terms

The terms used in the Conformance Level information are defined as follows:

- **Supports**: The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.
- **Partially Supports**: Some functionality of the product does not meet the criterion.
- **Does Not Support**: The majority of product functionality does not meet the criterion.
- **Not Applicable**: The criterion is not relevant to the product.
- **Not Evaluated**: The product has not been evaluated against the criterion. This can only be used in WCAG Level AAA criteria.

*No criterion in this report is marked Not Evaluated.*

## WCAG 2.x Report

**How this section applies to the other standards:**
- The WCAG 2.x tables also stand for the matching provisions of **Revised Section 508**:
  - 501.1 Scope, Chapter 5 (Software);
  - 504.2 (Authoring tools);
  - 602.3 (Support documentation).
- They also stand for the matching **EN 301 549** clauses:
  - Clause 9 (Web);
  - Clause 10 (non-web documents);
  - Clause 11 (Software).

**How the criteria were applied:**
- **Desktop app:** Pace is non-web software, so the criteria were applied to it as described in *WCAG2ICT* (W3C, Guidance on Applying WCAG 2 to Non-Web ICT).
- **Exported files:** the statements and reports the app exports (CSV, PDF) were evaluated as **electronic documents**.

**How to read the rows:** where the result differs between the app and its exported files, the row gives one line for each:
- **Software** means the Pace desktop app.
- **Electronic Docs** means the exported statements and reports.

### Table 1: Success Criteria, Level A

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| [1.1.1 Non-text Content](https://www.w3.org/TR/WCAG22/#non-text-content) (Level A) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:**<br>• Charts have text alternatives that give their key values (`role="img"`), e.g. "Spending trend chart. Spent so far $190. Projected to reach $379. Previous period ended at $2,196".<br>• Progress bars expose their values.<br>• Decorative icons are hidden from assistive technology, and icon-only buttons are named ("Keyboard shortcuts", "Swap periods", "Options for …").<br>• axe finds no violations (E1, E8).<br>**Electronic Docs:** contain no images. |
| [1.2.1 Audio-only and Video-only (Prerecorded)](https://www.w3.org/TR/WCAG22/#audio-only-and-video-only-prerecorded) (Level A) | Not Applicable | There is no audio or video content. |
| [1.2.2 Captions (Prerecorded)](https://www.w3.org/TR/WCAG22/#captions-prerecorded) (Level A) | Not Applicable | There is no audio or video content. |
| [1.2.3 Audio Description or Media Alternative (Prerecorded)](https://www.w3.org/TR/WCAG22/#audio-description-or-media-alternative-prerecorded) (Level A) | Not Applicable | There is no video content. |
| [1.3.1 Info and Relationships](https://www.w3.org/TR/WCAG22/#info-and-relationships) (Level A) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:**<br>• Landmarks (banner, three named navigation regions, main, complementary).<br>• Page titles are `h1`, with `h2`/`h3` below. Section titles above tables are headings.<br>• Lists, labelled form fields and radio / tab groups.<br>• Required and invalid fields are exposed programmatically.<br>• **Data tables** (Transactions, Spending categories, Bills, Accounts, Monthly Comparison and others) are named ARIA tables. Each has a row of column headers, then rows made of a row header and cells, so each value is announced with its column name. A row that opens is a button inside its row header, named with the column names ("Food & drink, collapsed. October 2026 $516, November 2026 $16, …") (E8, E13).<br>**Electronic Docs:**<br>• Exported PDFs are **tagged**: heading, table (with caption), column and row headers.<br>• CSV files keep their structure through a header row (E10, E13). |
| [1.3.2 Meaningful Sequence](https://www.w3.org/TR/WCAG22/#meaningful-sequence) (Level A) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:** the reading order matches the visual order: sidebar, then top bar, then page, left to right and top to bottom. Tab order follows the same sequence (E2).<br>**Electronic Docs:** the tagged PDF's structure tree gives the reading order: header, totals, then the table (E10, E13). |
| [1.3.3 Sensory Characteristics](https://www.w3.org/TR/WCAG22/#sensory-characteristics) (Level A) | Supports | Instructions don't rely on shape, colour, size, position or sound. Arrows in legends come with text ("↑ Up = spent more"). |
| [1.4.1 Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color) (Level A) | Supports | • **Budget status and changes:** shown in words as well as colour ("On track", "Over budget", "Down −96.8%"), with arrows and signs on amounts.<br>• **Chart lines:** the current and previous periods differ strongly in lightness, are named in a text legend, and are covered by the chart's text alternative.<br>• **Colour-blind mode:** adds shapes and patterns and switches to a colour-blind-safe palette (E4). |
| [1.4.2 Audio Control](https://www.w3.org/TR/WCAG22/#audio-control) (Level A) | Not Applicable | The app plays no audio. |
| [2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) (Level A) | Supports | Every function works from the keyboard. This includes:<br>• navigation, search, filters, pickers and dialogs;<br>• forms and dates;<br>• sign-in, account creation and onboarding.<br>The keyboard test found 284 of 284 checks passing on 41 views (E2). The browser's calendar pop-up opens only on click; from the keyboard, dates are typed, with ↑ ↓ on each part. |
| [2.1.2 No Keyboard Trap](https://www.w3.org/TR/WCAG22/#no-keyboard-trap) (Level A) | Supports | • Tab and Shift+Tab cycle fully round every view.<br>• Dialogs, pickers and panels keep focus inside while open (modal) and close with Esc, returning focus to the control that opened them.<br>• A trap found in the period picker during testing has been fixed (E2). |
| [2.1.4 Character Key Shortcuts](https://www.w3.org/TR/WCAG22/#character-key-shortcuts) (Level A) | Supports | • **The one single-character shortcut:** **`?`** (Shift+/) opens the keyboard-shortcuts list.<br>• **Turning it off:** **Settings → Accessibility & display → Single-key shortcuts**. When it is off, `?` does nothing, and the list still opens with Ctrl+/ or F1 (E13).<br>• **Never while typing:** it doesn't fire while a text field has focus.<br>• **All other shortcuts** use Ctrl, Alt or F1. |
| [2.2.1 Timing Adjustable](https://www.w3.org/TR/WCAG22/#timing-adjustable) (Level A) | Supports | • **Status notices:** for example "Nothing to save here" and sync results.<br>&nbsp;&nbsp;– They stay for 10 seconds, and the time doesn't run while the mouse or focus is on them.<br>&nbsp;&nbsp;– Each has a **Close message** button.<br>&nbsp;&nbsp;– **Settings → Keep messages on screen** turns the time limit off, so notices stay until closed.<br>&nbsp;&nbsp;– They are announced to screen readers through `role="status"` (E11, E13).<br>• There are no session timeouts or other time limits. |
| [2.2.2 Pause, Stop, Hide](https://www.w3.org/TR/WCAG22/#pause-stop-hide) (Level A) | Supports | Nothing moves, blinks or scrolls automatically for more than 5 seconds. Data updated in the background replaces content in place without animation (E11). |
| [2.3.1 Three Flashes or Below Threshold](https://www.w3.org/TR/WCAG22/#three-flashes-or-below-threshold) (Level A) | Supports | Nothing flashes. |
| [2.4.1 Bypass Blocks](https://www.w3.org/TR/WCAG22/#bypass-blocks) (Level A) | Supports | • The first Tab stop is a **Skip to main content** link.<br>• Landmarks and headings mark each region.<br>• Ctrl+1…9 and Ctrl+K jump directly to pages and search (E2). |
| [2.4.2 Page Titled](https://www.w3.org/TR/WCAG22/#page-titled) (Level A) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:**<br>• The window is titled with the software name, "Pace", which WCAG2ICT accepts for software.<br>• Each view has an `h1` and a breadcrumb naming it.<br>• Dialogs are named.<br>• *Recommendation:* add the view name to the window title ("Budgets – Pace").<br>**Electronic Docs:** each PDF has a title ("Pace statement · account · month"). |
| [2.4.3 Focus Order](https://www.w3.org/TR/WCAG22/#focus-order) (Level A) | Supports | • Focus moves in reading order, and Shift+Tab reverses it exactly on every view.<br>• After navigating, focus moves to the new page.<br>• After a dialog closes, focus returns to its opener (E2). |
| [2.4.4 Link Purpose (In Context)](https://www.w3.org/TR/WCAG22/#link-purpose-in-context) (Level A) | Supports | Links and buttons are named by their visible text in context ("See all bills" in Upcoming bills; "Recurring & Subscriptions: view details"). |
| [2.5.1 Pointer Gestures](https://www.w3.org/TR/WCAG22/#pointer-gestures) (Level A) | Supports | No multipoint or path-based gestures are used. Everything works with a single click. |
| [2.5.2 Pointer Cancellation](https://www.w3.org/TR/WCAG22/#pointer-cancellation) (Level A) | Supports | Controls act on release (the up-event). Moving off a control before releasing cancels the action. |
| [2.5.3 Label in Name](https://www.w3.org/TR/WCAG22/#label-in-name) (Level A) | Supports | Controls whose visible text names them are named by that text, in the same order. Composed labels that broke this were removed during the axe remediation (E1). |
| [2.5.4 Motion Actuation](https://www.w3.org/TR/WCAG22/#motion-actuation) (Level A) | Not Applicable | No function uses device or user motion. |
| [3.1.1 Language of Page](https://www.w3.org/TR/WCAG22/#language-of-page) (Level A) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:** the language is set to English (`lang="en"`).<br>**Electronic Docs:** exported PDFs declare their language (`/Lang (en)`) (E10, E13). |
| [3.2.1 On Focus](https://www.w3.org/TR/WCAG22/#on-focus) (Level A) | Supports | Focusing a control never changes context. Focusing the search box only shows its list of suggestions. |
| [3.2.2 On Input](https://www.w3.org/TR/WCAG22/#on-input) (Level A) | Supports | Choosing an option (period, view, filter) updates the content on the same page and doesn't move focus. Forms are submitted only by their button or Ctrl+S. |
| [3.2.6 Consistent Help](https://www.w3.org/TR/WCAG22/#consistent-help) (Level A 2.2 only) | Supports | The help mechanism (the keyboard-shortcuts list) is always in the same place: the top bar's keyboard button and Help → Keyboard Shortcuts. |
| [3.3.1 Error Identification](https://www.w3.org/TR/WCAG22/#error-identification) (Level A) | Supports | Fields with errors are marked `aria-invalid` and show the error in text beside the field. Focus moves to the first field with an error (E2, E8). |
| [3.3.2 Labels or Instructions](https://www.w3.org/TR/WCAG22/#labels-or-instructions) (Level A) | Supports | Every field has a visible label. Optional fields are marked "(optional)", and fields have helper text where useful ("Applies to every month…"). |
| [3.3.7 Redundant Entry](https://www.w3.org/TR/WCAG22/#redundant-entry) (Level A 2.2 only) | Supports | No process asks for the same information twice. The exception is "Confirm password", which WCAG allows for security. |
| [4.1.1 Parsing](https://www.w3.org/TR/WCAG21/#parsing) (Level A) | Supports | For WCAG 2.2 this criterion is obsolete and removed. For WCAG 2.0 and 2.1 the 2023 errata treat it as always satisfied. The markup is generated by React and has no duplicate IDs or invalid nesting found by axe. |
| [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value) (Level A) | Supports | • **Name and role:** every control has an accessible name and role.<br>• **State:** exposed for radio groups and tabs (checked / selected), switches and checkboxes (`aria-checked`), the search combobox (`aria-expanded`, `aria-activedescendant`) and progress bars (value).<br>• **Dialogs:** named and marked modal.<br>• **Verification:** axe shows 0 violations and the accessibility tree was inspected (E1, E8). Not verified with a screen reader. |

### Table 2: Success Criteria, Level AA

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| [1.2.4 Captions (Live)](https://www.w3.org/TR/WCAG22/#captions-live) (Level AA) | Not Applicable | There is no live media. |
| [1.2.5 Audio Description (Prerecorded)](https://www.w3.org/TR/WCAG22/#audio-description-prerecorded) (Level AA) | Not Applicable | There is no video. |
| [1.3.4 Orientation](https://www.w3.org/TR/WCAG22/#orientation) (Level AA 2.1 and 2.2) | Supports | The orientation isn't locked. The layout adapts to any window shape. |
| [1.3.5 Identify Input Purpose](https://www.w3.org/TR/WCAG22/#identify-input-purpose) (Level AA 2.1 and 2.2) | Supports | Fields that collect information about the user have the matching `autocomplete` value:<br>• **Sign in:** `username` and `current-password`.<br>• **Create account:** `name`, `username`, and `new-password` for Password and Confirm password.<br>• **Forgot password:** `username`, and `new-password` for both new-password fields.<br>• **Profile:** `name` and `username` (E9, E13). |
| [1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum) (Level AA) | **Software:** Supports<br>**Electronic Docs:** Supports | **Software:**<br>• All text meets 4.5:1. The lowest ratios are secondary text on a chip (5.73:1) and red text on a red tint (4.57:1).<br>• This holds in all four palettes (standard, High contrast, and each with Colour-blind mode); an automated test checks every text / background pair.<br>• axe finds no contrast violations (E1, E4).<br>**Electronic Docs:** PDF text is 6.91:1 or more. |
| [1.4.4 Resize Text](https://www.w3.org/TR/WCAG22/#resize-text) (Level AA) | Supports | View → Zoom In (Ctrl + =) enlarges everything. At 200% the app switches to its single-column layout with nothing lost, and keyboard and axe checks pass at that size (E5). |
| [1.4.5 Images of Text](https://www.w3.org/TR/WCAG22/#images-of-text) (Level AA) | Supports | No images of text are used. The logo mark is an icon beside the text "Pace". |
| [1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow) (Level AA 2.1 and 2.2) | Supports | • At 320 CSS px (400% zoom), content reflows to one column without horizontal page scrolling.<br>• The Transactions filter buttons wrap onto more lines, and the search, filters and list scroll together.<br>• Only the Monthly Comparison data table scrolls sideways, inside its own area. That is exempt, as a two-dimensional table (E5, E13). |
| [1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast) (Level AA 2.1 and 2.2) | Supports | • Field and picker borders are 3.45:1.<br>• Focus rings are 16.7:1. The notice's Close button has a light ring, 11.7:1 against the dark bar.<br>• Switches show their off state with a grey track of 3.08:1 or more (3.31:1 in the narrow layout), and their on state in ink.<br>• Progress-bar fills are 14.4:1 against their track.<br>• The "previous period" chart line is 3.31:1 against the page and 3.45:1 against white, and 5.49:1 in the High contrast theme (E4, E13). |
| [1.4.12 Text Spacing](https://www.w3.org/TR/WCAG22/#text-spacing) (Level AA 2.1 and 2.2) | Supports | With the WCAG spacing applied (line height 1.5, letter spacing 0.12 em, word spacing 0.16 em, paragraph spacing 2 em):<br>• page content reflows without loss;<br>• sidebar items, the search box and key hints grow to fit their text. Labels wrap rather than being cut short, and the sidebar scrolls. No visible item overlaps another (E6, E13). |
| [1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) (Level AA 2.1 and 2.2) | Supports | The search suggestions shown on focus stay while you hover or focus them, and Esc dismisses them. The tooltips on sidebar items are the browser's own (`title`), which are exempt. |
| [2.4.5 Multiple Ways](https://www.w3.org/TR/WCAG22/#multiple-ways) (Level AA) | Supports | You can reach any view in more than one way:<br>• the sidebar;<br>• search (Ctrl+K), which also finds pages;<br>• numbered shortcuts;<br>• links from Home cards;<br>• the breadcrumb. |
| [2.4.6 Headings and Labels](https://www.w3.org/TR/WCAG22/#headings-and-labels) (Level AA) | Supports | Headings name each page and section. Labels describe each field's purpose. |
| [2.4.7 Focus Visible](https://www.w3.org/TR/WCAG22/#focus-visible) (Level AA) | Supports | Every focus stop shows a visible indicator: a 3 px ink-coloured ring, or a thicker border on text fields. This was checked at all 775 stops (E2, E3). |
| [2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/TR/WCAG22/#focus-not-obscured-minimum) (Level AA 2.2 only) | Supports | The focused control is never hidden by the top bar, notices or panels. This was checked at every stop (E2). |
| [2.5.7 Dragging Movements](https://www.w3.org/TR/WCAG22/#dragging-movements) (Level AA 2.2 only) | Supports | No function needs dragging. |
| [2.5.8 Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum) (Level AA 2.2 only) | Supports | No target is smaller than 24 × 24 CSS px on any main page (E1). |
| [3.1.2 Language of Parts](https://www.w3.org/TR/WCAG22/#language-of-parts) (Level AA) | Supports | All content is in English. Merchant names come from the bank. |
| [3.2.3 Consistent Navigation](https://www.w3.org/TR/WCAG22/#consistent-navigation) (Level AA) | Supports | The sidebar and top bar are the same on every signed-in view. The signed-out pages share the same brand panel and step list. |
| [3.2.4 Consistent Identification](https://www.w3.org/TR/WCAG22/#consistent-identification) (Level AA) | Supports | The same functions have the same names and icons everywhere (Back, Search, Notifications, Add …). |
| [3.3.3 Error Suggestion](https://www.w3.org/TR/WCAG22/#error-suggestion) (Level AA) | Supports | Error messages say how to fix the problem ("Enter a name", "That's more than the target", "Passwords don't match"). |
| [3.3.4 Error Prevention (Legal, Financial, Data)](https://www.w3.org/TR/WCAG22/#error-prevention-legal-financial-data) (Level AA) | Supports | • Pace makes no payments or other financial transactions.<br>• Deleting an account, a budget or a bill asks for confirmation.<br>• Budgets, bills, goals and notes can be edited after saving.<br>• Forms are checked before saving. |
| [3.3.8 Accessible Authentication (Minimum)](https://www.w3.org/TR/WCAG22/#accessible-authentication-minimum) (Level AA 2.2 only) | Supports | • Password and username fields support password managers (`autocomplete`) and paste, and have "Show password".<br>• The password-reset answer field accepts paste.<br>• There's no CAPTCHA, puzzle or transcription (E9). |
| [4.1.3 Status Messages](https://www.w3.org/TR/WCAG22/#status-messages) (Level AA 2.1 and 2.2) | Supports | Notices use `role="status"` (polite live region) and don't take focus. Form errors are shown inline, and focus moves to the first field with an error. |

### Table 3: Success Criteria, Level AAA

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| [1.2.6 Sign Language (Prerecorded)](https://www.w3.org/TR/WCAG22/#sign-language-prerecorded) (Level AAA) | Not Applicable | There is no media. |
| [1.2.7 Extended Audio Description (Prerecorded)](https://www.w3.org/TR/WCAG22/#extended-audio-description-prerecorded) (Level AAA) | Not Applicable | There is no media. |
| [1.2.8 Media Alternative (Prerecorded)](https://www.w3.org/TR/WCAG22/#media-alternative-prerecorded) (Level AAA) | Not Applicable | There is no media. |
| [1.2.9 Audio-only (Live)](https://www.w3.org/TR/WCAG22/#audio-only-live) (Level AAA) | Not Applicable | There is no media. |
| [1.3.6 Identify Purpose](https://www.w3.org/TR/WCAG22/#identify-purpose) (Level AAA 2.1 and 2.2) | Partially Supports | • **Met:** regions are identified with landmarks, and every personal-data field has an `autocomplete` value (see 1.3.5).<br>• **Not met:** icons don't carry machine-readable purpose metadata. |
| [1.4.6 Contrast (Enhanced)](https://www.w3.org/TR/WCAG22/#contrast-enhanced) (Level AAA) | Partially Supports | • **High contrast setting:** all text meets 7:1.<br>• **Standard theme:** secondary text is 5.73–6.62:1 and red text on the red tint is 4.57:1. axe flagged 4–18 elements per page (E1, E4). |
| [1.4.7 Low or No Background Audio](https://www.w3.org/TR/WCAG22/#low-or-no-background-audio) (Level AAA) | Not Applicable | There is no audio. |
| [1.4.8 Visual Presentation](https://www.w3.org/TR/WCAG22/#visual-presentation) (Level AAA) | Partially Supports | • **Met:**<br>&nbsp;&nbsp;– text isn't justified;<br>&nbsp;&nbsp;– blocks of text are short;<br>&nbsp;&nbsp;– text resizes to 200% without horizontal scrolling;<br>&nbsp;&nbsp;– users can switch to the High contrast theme or Windows High Contrast colours.<br>• **Not met:** users can't choose their own colours or line spacing within the app, and line spacing isn't 1.5 by default. |
| [1.4.9 Images of Text (No Exception)](https://www.w3.org/TR/WCAG22/#images-of-text-no-exception) (Level AAA) | Supports | There are no images of text. |
| [2.1.3 Keyboard (No Exception)](https://www.w3.org/TR/WCAG22/#keyboard-no-exception) (Level AAA) | Supports | Every function works by keyboard without exception (E2). |
| [2.2.3 No Timing](https://www.w3.org/TR/WCAG22/#no-timing) (Level AAA) | Supports | Nothing in Pace is timed. The time that status notices stay on screen can be turned off (**Keep messages on screen**, see 2.2.1). |
| [2.2.4 Interruptions](https://www.w3.org/TR/WCAG22/#interruptions) (Level AAA) | Supports | Bill reminders, the only interruption, can be set to Off or delayed in Settings. In-app notices don't take focus. |
| [2.2.5 Re-authenticating](https://www.w3.org/TR/WCAG22/#re-authenticating) (Level AAA) | Supports | Sessions don't expire while the app is open. Data entered is saved to the local database. |
| [2.2.6 Timeouts](https://www.w3.org/TR/WCAG22/#timeouts) (Level AAA 2.1 and 2.2) | Supports | No data is lost through inactivity. |
| [2.3.2 Three Flashes](https://www.w3.org/TR/WCAG22/#three-flashes) (Level AAA) | Supports | Nothing flashes. |
| [2.3.3 Animation from Interactions](https://www.w3.org/TR/WCAG22/#animation-from-interactions) (Level AAA 2.1 and 2.2) | Supports | Page transitions are turned off on desktop. Dialogs fade in without moving. |
| [2.4.8 Location](https://www.w3.org/TR/WCAG22/#location) (Level AAA) | Supports | • The breadcrumb ("Overview › Budgets") shows where you are.<br>• The current sidebar item is highlighted and marked `aria-current="page"`.<br>• Setup shows "Step 2 of 3". |
| [2.4.9 Link Purpose (Link Only)](https://www.w3.org/TR/WCAG22/#link-purpose-link-only) (Level AAA) | Supports | Links (sidebar, breadcrumb, skip link) are named by their destination alone. |
| [2.4.10 Section Headings](https://www.w3.org/TR/WCAG22/#section-headings) (Level AAA) | Supports | Sections of each page have headings (cards, panels, form groups). |
| [2.4.12 Focus Not Obscured (Enhanced)](https://www.w3.org/TR/WCAG22/#focus-not-obscured-enhanced) (Level AAA 2.2 only) | Supports | No part of the focused control was covered at any of the 775 stops (E2). |
| [2.4.13 Focus Appearance](https://www.w3.org/TR/WCAG22/#focus-appearance) (Level AAA 2.2 only) | Supports | • The focus ring is 3 px thick, solid and offset 2 px around the whole control, with 16.7:1 contrast against its surroundings.<br>• On text fields, focus changes the border from 1 px grey to 2 px ink, across the field's full perimeter (E3). |
| [2.5.5 Target Size (Enhanced)](https://www.w3.org/TR/WCAG22/#target-size-enhanced) (Level AAA 2.1 and 2.2) | Partially Supports | Most targets are 44 × 44 px or larger. Some are smaller: Settings switches (52 × 32), the breadcrumb link (65 × 40), and the Clear and key-hint buttons (36 px) (E1). |
| [2.5.6 Concurrent Input Mechanisms](https://www.w3.org/TR/WCAG22/#concurrent-input-mechanisms) (Level AAA 2.1 and 2.2) | Supports | Mouse, keyboard and touch (on touchscreens) can be used together. The only change is that the calendar pop-up opens from a click and the typed date field from the keyboard; both are always available. |
| [3.1.3 Unusual Words](https://www.w3.org/TR/WCAG22/#unusual-words) (Level AAA) | Partially Supports | Most terms are plain. Some financial terms ("cash flow projection", "TrendScore", "payday estimate") have help only in places (for example "About payday estimate"). There's no glossary. |
| [3.1.4 Abbreviations](https://www.w3.org/TR/WCAG22/#abbreviations) (Level AAA) | Partially Supports | "CSV" and "PDF" are explained next to the export choices ("PDF (to read or print)"). Abbreviations in bank-supplied data (for example "ACH") aren't expanded. |
| [3.1.5 Reading Level](https://www.w3.org/TR/WCAG22/#reading-level) (Level AAA) | Supports | Interface text uses short, plain sentences, for example "Set a monthly limit for a category to see how you're doing". No text requires reading ability beyond lower secondary level. No formal readability scoring was done. |
| [3.1.6 Pronunciation](https://www.w3.org/TR/WCAG22/#pronunciation) (Level AAA) | Supports | No words are ambiguous without pronunciation. |
| [3.2.5 Change on Request](https://www.w3.org/TR/WCAG22/#change-on-request) (Level AAA) | Supports | Changes of context (opening pages, dialogs) happen only when you ask for them. Nothing opens or navigates automatically. |
| [3.3.5 Help](https://www.w3.org/TR/WCAG22/#help) (Level AAA) | Supports | Context help includes:<br>• field helper text;<br>• "About payday estimate";<br>• the keyboard-shortcuts list (?, F1);<br>• the README's keyboard guide. |
| [3.3.6 Error Prevention (All)](https://www.w3.org/TR/WCAG22/#error-prevention-all) (Level AAA) | Supports | Deletions ask for confirmation. Entries can be edited after saving. Forms are checked before saving. |
| [3.3.9 Accessible Authentication (Enhanced)](https://www.w3.org/TR/WCAG22/#accessible-authentication-enhanced) (Level AAA 2.2 only) | Supports | Sign-in and password reset need no cognitive-function test. Paste and password managers are supported, and no object or image recognition is used (E9). |

## Revised Section 508 Report

### Chapter 3: [Functional Performance Criteria](https://www.access-board.gov/ict/#chapter-3-functional-performance-criteria) (FPC)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 302.1 Without Vision | Supports | • **What works:**<br>&nbsp;&nbsp;– names, roles, states, landmarks and table structure are exposed through the platform accessibility API (via Chromium);<br>&nbsp;&nbsp;– everything is keyboard operable;<br>&nbsp;&nbsp;– exported PDFs are tagged.<br>• **Not done:** no screen-reader listening tests (see Notes). |
| 302.2 With Limited Vision | Supports | • Zoom to 200% and beyond, with reflow, including at 320 CSS px (1.4.10).<br>• Text spacing can be increased without loss (1.4.12).<br>• A High contrast theme.<br>• Windows High Contrast is honoured, with the current page and chosen options in the system highlight colour (E7, E13).<br>• A strong focus ring. |
| 302.3 Without Perception of Color | Supports | Status and changes are given in words and symbols as well as colour. Colour-blind mode adds patterns and shapes. |
| 302.4 Without Hearing | Supports | The app uses no audio. Reminders are visual system notifications. |
| 302.5 With Limited Hearing | Supports | The app uses no audio. |
| 302.6 Without Speech | Supports | No function needs speech. |
| 302.7 With Limited Manipulation | Supports | • Everything can be done by keyboard, and no key chords are required: every shortcut has a sidebar or menu equivalent.<br>• There are no fine gestures, drags or timed actions.<br>• Targets are at least 24 px. |
| 302.8 With Limited Reach and Strength | Supports | The app runs on the user's own computer with any input device. No physical reach or strength is needed. |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | Partially Supports | • **What works:**<br>&nbsp;&nbsp;– plain language and consistent layout;<br>&nbsp;&nbsp;– errors that say how to fix them;<br>&nbsp;&nbsp;– confirmations before deleting;<br>&nbsp;&nbsp;– no timed tasks, and notices can be kept on screen until closed.<br>• **Gap:** some financial terms aren't explained (3.1.3). |

### Chapter 4: [Hardware](https://www.access-board.gov/ict/#chapter-4-hardware)

**Notes:** Not Applicable. Pace is software and has no hardware.

### Chapter 5: [Software](https://www.access-board.gov/ict/#chapter-5-software)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 501.1 Scope – Incorporation of WCAG 2.0 AA | See [WCAG 2.x section](#wcag-2x-report) | See the information in the WCAG 2.x section. |
| **502 Interoperability with Assistive Technology** | Heading cell – no response required | Heading cell – no response required |
| 502.2.1 User Control of Accessibility Features | Not Applicable | Pace isn't platform software. |
| 502.2.2 No Disruption of Accessibility Features | Supports | Pace doesn't turn off or override platform accessibility features: Windows High Contrast, magnifier, Sticky Keys, Filter Keys, key repeat and system text scaling. Shortcuts ignore auto-repeat (E7). |
| **502.3 Accessibility Services** | Heading cell – no response required | Heading cell – no response required |
| 502.3.1 Object Information | Supports | Role, name and state of every control are exposed through UI Automation / MSAA by Chromium from the page's semantics (E8). |
| 502.3.2 Modification of Object Information | Supports | States set by the user (checked, selected, expanded) are exposed and updated when the user changes them. |
| 502.3.3 Row, Column, and Headers | Supports | Data tables expose table, row, column-header, row-header and cell roles, so cells are associated with their headers (see 1.3.1). Customize panel options and lists expose list relationships. |
| 502.3.4 Values | Supports | Text fields, progress bars (`aria-valuenow` / `aria-valuetext`), switches and pickers expose their current values. |
| 502.3.5 Modification of Values | Supports | Values can be changed through standard controls exposed to assistive technology. |
| 502.3.6 Label Relationships | Supports | Fields are labelled, and error and helper text is associated as the field's description. |
| 502.3.7 Hierarchical Relationships | Supports | Landmarks, lists, groups (radio groups, tab lists, list boxes) and dialogs expose parent-child relationships. |
| 502.3.8 Text | Supports | All text is real text and is exposed with its content. |
| 502.3.9 Modification of Text | Supports | Text entry uses standard editable fields. |
| 502.3.10 List of Actions | Supports | Each control's action (press, toggle, select) follows from its exposed role. |
| 502.3.11 Actions on Objects | Supports | Actions can be performed through the accessibility API (default action) and the keyboard. |
| 502.3.12 Focus Cursor | Supports | Keyboard focus and the active search result (`aria-activedescendant`) are exposed. |
| 502.3.13 Modification of Focus Cursor | Supports | Focus can be moved programmatically and by keyboard. Pace keeps focus predictable after dialogs and navigation. |
| 502.3.14 Event Notification | Supports | Focus, state, value and live-region changes are reported through the platform API. Notices use a polite live region. |
| 502.4 Platform Accessibility Features | Supports | The app works with Windows accessibility features (for example Sticky Keys, Filter Keys and High Contrast) because it doesn't intercept or block them. |
| **503 Applications** | Heading cell – no response required | Heading cell – no response required |
| 503.2 User Preferences | Supports | • The app honours Windows High Contrast (forced colours), system text scaling and zoom.<br>• Under forced colours, the current page and chosen options use the system Highlight colours (E7, E13). |
| 503.3 Alternative User Interfaces | Not Applicable | Pace doesn't provide an alternative user interface that works as assistive technology. |
| 503.4 User Controls for Captions and Audio Description | Not Applicable | There is no media. |
| **504 Authoring Tools** | Heading cell – no response required | Heading cell – no response required |
| 504.2 Content Creation or Editing | Not Applicable | Pace isn't an authoring tool. Users don't create content for others. The statements and reports it generates are covered under Electronic Docs in the WCAG section and EN 301 549 Clause 10. |
| 504.2.1 Preservation of Information Provided for Accessibility in Format Conversion | Not Applicable | Not an authoring tool. See EN 301 549 5.4 for the PDF export. |
| 504.2.2 PDF Export | Not Applicable | Not an authoring tool. Exported PDFs are tagged and declare their language (EN 301 549 Clause 10). Full PDF/UA validation was not run. |
| 504.3 Prompts | Not Applicable | Not an authoring tool. |
| 504.4 Templates | Not Applicable | Not an authoring tool. |

### Chapter 6: [Support Documentation and Services](https://www.access-board.gov/ict/#chapter-6-support-documentation-and-services)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 601.1 Scope | Heading cell – no response required | Heading cell – no response required |
| **602 Support Documentation** | Heading cell – no response required | Heading cell – no response required |
| 602.2 Accessibility and Compatibility Features | Supports | • **README:** lists every keyboard shortcut and how to use the app by keyboard, and describes the High contrast and Colour-blind settings.<br>• **In the app:** the shortcuts list is available from the keyboard (?, Ctrl+/, F1) and from Help → Keyboard Shortcuts.<br>• **This report:** documents the accessibility features and known issues. |
| 602.3 Electronic Support Documentation | Supports | The documentation is Markdown (README, this report, the keyboard checklist and the test evidence). It renders as structured HTML with headings, lists and tables, and its images have alt text. See the WCAG 2.x section for the criteria. |
| 602.4 Alternate Formats for Non-Electronic Support Documentation | Not Applicable | There is no non-electronic documentation. |
| **603 Support Services** | Heading cell – no response required | Heading cell – no response required |
| 603.2 Information on Accessibility and Compatibility Features | Not Applicable | This academic project has no support service. Accessibility information is in the documentation (602.2). |
| 603.3 Accommodation of Communication Needs | Not Applicable | No support service is provided. |

## EN 301 549 Report

### Chapter 4: [4.2 Functional Performance Statements](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=22) (FPS)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 4.2.1 Usage without vision | Supports | See Section 508 302.1. |
| 4.2.2 Usage with limited vision | Supports | See Section 508 302.2. |
| 4.2.3 Usage without perception of colour | Supports | See Section 508 302.3. |
| 4.2.4 Usage without hearing | Supports | The app uses no audio. |
| 4.2.5 Usage with limited hearing | Supports | The app uses no audio. |
| 4.2.6 Usage with no or limited vocal capability | Supports | No function needs speech. |
| 4.2.7 Usage with limited manipulation or strength | Supports | See Section 508 302.7. |
| 4.2.8 Usage with limited reach | Supports | See Section 508 302.8. |
| 4.2.9 Minimize photosensitive seizure triggers | Supports | Nothing flashes. |
| 4.2.10 Usage with limited cognition, language or learning | Partially Supports | See Section 508 302.9. |
| 4.2.11 Privacy | Supports | Accessibility features don't expose private information. Password fields are masked by default and can be shown on request. Nothing is spoken aloud by the app itself. |

### Chapter 5: [Generic Requirements](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=23)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 5.1 Closed functionality (5.1.1 – 5.1.6.2) | Not Applicable | Pace isn't closed. It works with the user's own assistive technology. |
| 5.2 Activation of accessibility features | Supports | The High contrast, Colour-blind and chart-value settings are in Settings and can be reached by keyboard. Zoom is in the View menu. |
| 5.3 Biometrics | Not Applicable | Pace doesn't use biometrics. |
| 5.4 Preservation of accessibility information during conversion | Supports | • **CSV:** column headers are preserved.<br>• **PDF:** the structure of the source HTML is kept in a tagged PDF (heading, table, column and row headers, title, language) (E10, E13). |
| 5.5 Operable parts (5.5.1 – 5.5.2) | Not Applicable | There are no physical operable parts. |
| 5.6 Locking or toggle controls (5.6.1 – 5.6.2) | Supports | The software toggles (switches) show their state visually and to assistive technology (`aria-checked`). There are no hardware locking keys. |
| 5.7 Key repeat | Supports | Pace doesn't change the system's key-repeat settings. Shortcuts act once per press and ignore auto-repeat. |
| 5.8 Double-strike key acceptance | Supports | Pace doesn't change the system's keyboard acceptance settings (Filter Keys). |
| 5.9 Simultaneous user actions | Supports | No function needs keys pressed together. Every shortcut is optional, and each has an equivalent in the sidebar, menu or controls. |

### Chapter 6: [ICT with Two-Way Voice Communication](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=28)

**Notes:** Not Applicable. Pace has no voice communication.

### Chapter 7: [ICT with Video Capabilities](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=31)

**Notes:** Not Applicable. Pace has no video.

### Chapter 8: [Hardware](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=32)

**Notes:** Not Applicable. Pace is software.

### Chapter 9: [Web](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=39)

**Notes:** Not Applicable. Pace is delivered as desktop (non-web) software and isn't served as a web page, so its interface is reported under Chapter 11. The responses would be the same as the [WCAG 2.x section](#wcag-2x-report).

### Chapter 10: [Non-Web Documents](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=43)

These clauses apply to the statements and Monthly Comparison reports that Pace exports (PDF and CSV). See the "Electronic Docs" lines in the [WCAG 2.x section](#wcag-2x-report). In summary:

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 10.1.1.1 Non-text content | Supports | The documents contain no images. |
| 10.1.2.1 – 10.1.2.5 Time-based media | Not Applicable | There is no media. |
| 10.1.3.1 Info and relationships | Supports | The tagged PDF keeps its heading and table structure, with column and row headers. CSV keeps it through its header row. |
| 10.1.3.2 Meaningful sequence | Supports | The tagged PDF's structure tree gives the reading order: header, totals, then the table. |
| 10.1.3.3 Sensory characteristics | Supports | No instructions depend on sensory characteristics. |
| 10.1.3.4 Orientation | Supports | The orientation isn't locked. |
| 10.1.3.5 Identify input purpose | Not Applicable | The documents have no form fields. |
| 10.1.4.1 Use of colour | Supports | Amounts use signs (+ / −), not colour alone. |
| 10.1.4.2 Audio control | Not Applicable | There is no audio. |
| 10.1.4.3 Contrast (minimum) | Supports | The lowest contrast is 6.91:1. |
| 10.1.4.4 Resize text | Supports | PDF and CSV viewers zoom the text, which is real text. |
| 10.1.4.5 Images of text | Supports | There are no images of text. |
| 10.1.4.10 Reflow | Supports | The PDF is a fixed-layout format, which is excepted. CSV is plain data. |
| 10.1.4.11 Non-text contrast | Supports | The documents have no controls. The table's lines are decorative. |
| 10.1.4.12 Text spacing | Not Applicable | The format doesn't let the user change text spacing. |
| 10.1.4.13 Content on hover or focus | Not Applicable | The documents have no interactive content. |
| 10.2.1.1 – 10.2.5.4 Operable (keyboard, timing, seizures, navigation) | Not Applicable | The documents are static, with no links or controls. Keyboard navigation is provided by the viewer. |
| 10.2.4.2 Document titled | Supports | The PDF has a title, "Pace statement · account · month". |
| 10.3.1.1 Language of document | Supports | The PDF declares its language (`/Lang (en)`). |
| 10.3.1.2 Language of parts | Not Applicable | Everything is in one language. |
| 10.3.2.x / 10.3.3.x Predictable, input assistance | Not Applicable | The documents have no interaction or input. |
| 10.4.1.2 Name, role, value | Not Applicable | The documents have no user interface components. |
| 10.4.1.3 Status messages | Not Applicable | The documents have no status messages. |

### Chapter 11: [Software](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=53)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| 11.0 General (informative) | Heading cell – no response required | Heading cell – no response required |
| 11.1.1.1 through 11.4.1.3 (Perceivable, Operable, Understandable, Robust) | See [WCAG 2.x section](#wcag-2x-report) | Software (open functionality): see the Software lines in the WCAG 2.x section. Clauses 11.2.4.1, 11.2.4.5, 11.3.2.3 and 11.3.2.4 aren't applied to non-web software by EN 301 549, but the WCAG responses are given for them anyway. |
| **11.5 Interoperability with assistive technology** | Heading cell – no response required | Heading cell – no response required |
| 11.5.1 Closed functionality | Not Applicable | Pace isn't closed. |
| 11.5.2.1 Platform accessibility service support for software that provides a user interface | Supports | The interface is exposed through Windows UI Automation / MSAA by Chromium, which Pace runs on. See Section 508 502.3. |
| 11.5.2.2 Platform accessibility service support for assistive technologies | Not Applicable | Pace isn't a platform. |
| 11.5.2.3 Use of accessibility services | Supports | Standard roles and states are used (Section 508 502.3.1). |
| 11.5.2.4 Assistive technology | Not Applicable | Pace isn't assistive technology. |
| 11.5.2.5 Object information | Supports | See Section 508 502.3.1. |
| 11.5.2.6 Row, column, and headers | Supports | See Section 508 502.3.3. |
| 11.5.2.7 Values | Supports | See Section 508 502.3.4. |
| 11.5.2.8 Label relationships | Supports | See Section 508 502.3.6. |
| 11.5.2.9 Parent-child relationships | Supports | See Section 508 502.3.7. |
| 11.5.2.10 Text | Supports | See Section 508 502.3.8. |
| 11.5.2.11 List of available actions | Supports | See Section 508 502.3.10. |
| 11.5.2.12 Execution of available actions | Supports | See Section 508 502.3.11. |
| 11.5.2.13 Tracking of focus and selection attributes | Supports | See Section 508 502.3.12. |
| 11.5.2.14 Modification of focus and selection attributes | Supports | See Section 508 502.3.13. |
| 11.5.2.15 Change notification | Supports | See Section 508 502.3.14. |
| 11.5.2.16 Modifications of states and properties | Supports | See Section 508 502.3.2. |
| 11.5.2.17 Modifications of values and text | Supports | See Section 508 502.3.5 and 502.3.9. |
| **11.6 Documented accessibility usage** | Heading cell – no response required | Heading cell – no response required |
| 11.6.1 User control of accessibility features | Not Applicable | Pace isn't platform software. |
| 11.6.2 No disruption of accessibility features | Supports | See Section 508 502.2.2. |
| 11.7 User preferences | Supports | See Section 508 503.2. |
| **11.8 Authoring tools** | Heading cell – no response required | Heading cell – no response required |
| 11.8.1 Content technology | Not Applicable | Pace isn't an authoring tool. |
| 11.8.2 Accessible content creation | Not Applicable | Pace isn't an authoring tool. |
| 11.8.3 Preservation of accessibility information in transformations | Not Applicable | Pace isn't an authoring tool. See 5.4 for the PDF export. |
| 11.8.4 Repair assistance | Not Applicable | Pace isn't an authoring tool. |
| 11.8.5 Templates | Not Applicable | Pace isn't an authoring tool. |

### Chapter 12: [Documentation and Support Services](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=73)

| Criteria | Conformance Level | Remarks and Explanations |
| --- | --- | --- |
| **12.1 Product documentation** | Heading cell – no response required | Heading cell – no response required |
| 12.1.1 Accessibility and compatibility features | Supports | See Section 508 602.2. |
| 12.1.2 Accessible documentation | Supports | See Section 508 602.3. |
| **12.2 Support services** | Heading cell – no response required | Heading cell – no response required |
| 12.2.2 Information on accessibility and compatibility features | Not Applicable | No support service is provided (see Section 508 603). |
| 12.2.3 Effective communication | Not Applicable | No support service is provided. |
| 12.2.4 Accessible documentation | Not Applicable | No support service is provided. |

### Chapter 13: [ICT Providing Relay or Emergency Service Access](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=74)

**Notes:** Not Applicable. Pace provides no relay or emergency services.

## Remediation

### Fixed and re-tested

The first evaluation found the issues below. Each has been fixed in this version and re-tested in the running app (E13).

| # | Issue found | Criteria | Fix | Re-test result |
| --- | --- | --- | --- | --- |
| 1 | Data tables weren't tables to assistive technology; Monthly Comparison values were read without their column names | 1.3.1, 508 502.3.3, EN 11.5.2.6 | Tables are ARIA tables: named `table`, `columnheader`s, and rows of a `rowheader` and `cell`s. Row buttons sit in the row header and are named with column names. Section titles above tables became headings. | Every table on every page has headers and contains only cells in its rows |
| 2 | Exported PDFs were untagged and had no language | 1.3.1, 1.3.2, 3.1.1 (Electronic Docs), EN 5.4, 10.1.3.1, 10.1.3.2, 10.3.1.1 | `generateTaggedPDF` in `printToPDF`; `lang="en"`, `scope` on headers and a caption in the source HTML | PDF has `/StructTreeRoot`, `/Marked true`, `/Lang (en)`, `H1`, `Table`, `TH` |
| 3 | Sidebar items overlapped when text spacing was increased; key hints overflowed | 1.4.12, 508 302.2 | Minimum heights instead of fixed ones; labels wrap; the sidebar scrolls | No visible overlap with WCAG text spacing applied |
| 4 | Status notices disappeared after 4 seconds | 2.2.1, 2.2.3, 508 302.9 | 10 seconds, paused while hovered or focused; a **Close message** button; **Settings → Keep messages on screen** turns the limit off | Notice gone after 10 s by default; still there after 15 s with the setting on; Enter on Close removes it and focus returns to the page |
| 5 | The `?` shortcut couldn't be turned off | 2.1.4 | **Settings → Single-key shortcuts** | Off: `?` does nothing, Ctrl+/ and F1 still work. On: `?` opens the list |
| 6 | Profile Name and Username, and Create account → Confirm password, had no `autocomplete` value | 1.3.5, 1.3.6 | `name`, `username`, `new-password` (also on Forgot password) | No personal-data field without a value |
| 7 | "Previous period" chart line was 1.69:1; the narrow layout's switch off state was 1.15:1 | 1.4.11 | Chart token `#8C8A84`; narrow switch off track uses the outline colour | 3.31:1 and 3.31:1 against the page |
| 8 | Current-page highlight was lost under Windows High Contrast | 503.2, EN 11.7, 302.2 | Forced-colours rule: current page, chosen tab and chosen option use `Highlight` / `HighlightText` | Current item filled with the system highlight colour |
| 9 | Transactions filter row scrolled sideways at 320 px | 1.4.10 | Filters wrap; search, filters and list scroll together | Nothing scrolls sideways at 320 px |
| 10 | In Colour-blind mode, orange danger text on its badge was 4.45:1 (found by the contrast tests) | 1.4.3 | Orange darkened from `#B34700` to `#A64200` | 5.00:1 on the badge, 5.91:1 on the page; `a11yContrast-test.ts` passes for all four palettes |
| 11 | A notification's action buttons ("Mark paid", "View bill") were inside the card's own button (found by the DOM tests) | 4.1.2 | The card's button holds only the message; the actions sit beside it | No button inside another on the Notifications page (`a11yWidgets-test.tsx`) |
| 12 | Bar chart on desktop: the chosen bar's state wasn't exposed, and axis labels were read twice (found by the DOM tests) | 1.3.1, 4.1.2 | Chosen bar is `aria-pressed`; axis row is `aria-hidden`; non-pressable bars are named images | Bars report pressed / not pressed; axis labels hidden from assistive technology |

### Remaining

| Issue | Criteria | Notes |
| --- | --- | --- |
| Secondary text below 7:1 in the standard theme | 1.4.6 (AAA) | All text meets the AA minimum of 4.5:1. The High contrast setting meets 7:1. |
| Targets smaller than 44 × 44 px | 2.5.5 (AAA) | All targets meet the AA minimum of 24 × 24 px (2.5.8). |
| No glossary for some financial terms; abbreviations in bank data not expanded | 3.1.3, 3.1.4 (AAA), 508 302.9, EN 4.2.10 | |
| No in-app choice of colours or line spacing | 1.4.8 (AAA) | Users can switch to High contrast or Windows High Contrast. |
| Icons carry no machine-readable purpose | 1.3.6 (AAA) | |
| Screen-reader listening tests (NVDA, JAWS, Narrator) not yet done | — | Recommended next step. Results here rest on the accessibility tree and automated checks. |

## Supporting Documentation

| Document | Contents |
| --- | --- |
| [Accessibility test evidence](accessibility-test-evidence.md) | Methods and results for each evaluation (E1–E13): axe results per page, contrast tables, zoom and reflow, text spacing, forced colours, accessibility tree, input purpose, exported documents, timing, and the re-test after remediation |
| [Keyboard testing checklist](keyboard-testing-checklist.md) | Keyboard-only test of 41 views and 775 focus stops, with every shortcut: 284 checks, the 10 problems found and fixed, and focus screenshots |
| [axe DevTools result](axe-devtools-0-issues.png) | Screenshot of the axe DevTools extension inside the Pace window: 0 issues |
| [Evidence screenshots](acr-evidence/) | 200% zoom, 320 px reflow, text spacing, Windows High Contrast, before and after the fixes (`fixed-*.png`) |
| [Keyboard screenshots](keyboard-testing/) | Skip link, focus rings (button, link, field), picker arrow keys, search |
| [README: Keyboard](../README.md) | The user documentation of keyboard use and shortcuts |
| [Test coverage report](test-coverage-report.md) | Coverage per layer, the accessibility test suites mapped to WCAG criteria, and the defects they found |
| `__tests__/a11yContrast-test.ts`, `a11yWidgets-test.tsx`, `a11yDom-test.tsx`, `keyboardDom-test.tsx`, `notice-test.tsx`, `desktopDatePicker-test.tsx`, `journeyController-test.tsx`, `asyncData-test.tsx` | Automated tests that guard the accessibility behaviour (453 tests in total, all passing) |

## Legal Disclaimer (Pace project team)

This report reflects the state of Pace 1.0.0 (Windows desktop) as evaluated by the project team on the dates shown. It was produced for an academic course and isn't a legal certification of conformance. Results for other platforms (iOS, Android, macOS) or later versions may differ. "VPAT" is a registered service mark of the Information Technology Industry Council (ITI).
