# Traceability

Acceptance criteria from `specs/001-meeting-cost-calculator.md`. "Task" is pre-filled from `TASKS.md`; "Test" and "Code" are filled in as tasks are completed.

| AC | Story | Summary | Task | Test | Code |
|----|-------|---------|------|------|------|
| AC-1 | US-1 | Add a role with name and annual salary; it appears in the list | 7 | `src/components/RoleForm.test.tsx`, `src/components/RolesPanel.test.tsx`, `src/App.test.tsx` | `src/components/RoleForm.tsx`, `src/components/RolesPanel.tsx`, `src/App.tsx` |
| AC-2 | US-1 | Hourly rate = salary ÷ 1,820 (£36,400 → £20.00) | 2 | `src/domain/rates.test.ts` (domain only: the hourly rate is never shown in the UI, see gap G4) | `src/domain/rates.ts` |
| AC-3 | US-1 | Edit or delete a role; later calculations use new values | 8 | `src/components/RolesPanel.test.tsx`, `src/components/RoleForm.test.tsx`, `src/App.test.tsx` (`App.test.tsx` covers a salary edited after a calculation) | `src/components/RolesPanel.tsx`, `src/components/RoleForm.tsx`, `src/App.tsx` |
| AC-4 | US-1 | Blank name or invalid salary shows an error and is not saved | 4, 7, 8 | `src/domain/validation.test.ts`, `src/components/RoleForm.test.tsx`, `src/App.test.tsx` | `src/domain/validation.ts`, `src/components/RoleForm.tsx` |
| AC-5 | US-2 | Add meeting line (role, headcount) and duration; total cost shown | 9, 10 | `src/domain/meeting.test.ts`, `src/domain/validation.test.ts`, `src/components/MeetingBuilder.test.tsx`, `src/components/DurationCalculator.test.tsx`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/domain/validation.ts`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx`, `src/App.tsx` |
| AC-6 | US-2 | 3×£20 + 1×£40 for 2h = £200.00 | 2, 11 | `src/domain/meeting.test.ts`, `src/components/CostBreakdown.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/meeting.ts`, `src/components/CostBreakdown.tsx`, `src/components/DurationCalculator.tsx` |
| AC-7 | US-3 | Breakdown by role (£120.00 + £80.00) adds up to total | 2, 11 | `src/domain/meeting.test.ts`, `src/components/CostBreakdown.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/meeting.ts`, `src/components/CostBreakdown.tsx`, `src/components/DurationCalculator.tsx` |
| AC-8 | US-2 | No roles: prompt to add a role first | 9 | `src/components/MeetingBuilder.test.tsx`, `src/App.test.tsx` | `src/components/MeetingBuilder.tsx`, `src/App.tsx` |
| AC-9 | US-2 | Invalid headcount, hours, minutes or zero duration shows error, no cost | 4, 9, 10 | `src/domain/validation.test.ts`, `src/components/MeetingBuilder.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/validation.ts`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx` |
| AC-10 | US-4 | Weekly £200.00 → £866.67 monthly, £10,400.00 yearly | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-11 | US-4 | Occurrences per year 260 / 52 / 26 / 12; monthly = yearly ÷ 12 | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-12 | US-4 | Daily counts weekdays only; holidays ignored | 3, 12 | `src/domain/recurrence.test.ts` (asserts 52 × 5 = 260, so it restates the constant; see gap G3), `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-13 | US-4 | Non-recurring shows per-occurrence cost only | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-14 | US-5 | Default currency is pounds sterling (£) | 5, 13 | `src/domain/currency.test.ts`, `src/App.test.tsx` | `src/domain/currency.ts`, `src/App.tsx` |
| AC-15 | US-5 | Changing currency changes the symbol only, not the numbers | 5, 13 | `src/domain/currency.test.ts`, `src/App.test.tsx` | `src/domain/currency.ts`, `src/components/CurrencySelect.tsx`, `src/App.tsx` |
| AC-16 | US-5 | Displayed costs rounded to 2 dp; no intermediate rounding | 5, 13 | `src/domain/currency.test.ts`, `src/App.test.tsx` | `src/domain/currency.ts` |
| AC-17 | US-6 | Roles, salaries and currency persist across reopen | 6, 13, 14 | `src/storage/storage.test.ts`, `src/hooks/usePersistedState.test.ts`, `src/App.test.tsx` (reload keeps roles, salaries, currency) | `src/storage/storage.ts`, `src/hooks/usePersistedState.ts`, `src/App.tsx` |
| AC-18 | US-6 | No salary, role or meeting data sent to any server | 6, 14 | `src/storage/storage.test.ts` (no `fetch` from the storage module only), `src/App.test.tsx` (privacy statement text only); see gap G2 | `src/storage/storage.ts`, `src/App.tsx` |
| AC-19 | US-6 | Storage unavailable: app works with empty list and says so | 6, 14 | `src/storage/storage.test.ts`, `src/hooks/usePersistedState.test.ts` (fail-soft and `storageFailed` flag), `src/App.test.tsx` (visible notice on load and save failure) | `src/storage/storage.ts`, `src/hooks/usePersistedState.ts`, `src/App.tsx` |
| AC-20 | US-7 | Phone-sized screen: all tasks without horizontal scrolling | 15, 16 | `src/layout.test.ts` (reads stylesheet source only; no real-browser or phone check has been done, see gap G1) | `src/index.css`, `src/components/RoleForm.module.css`, `src/components/MeetingBuilder.module.css`, `src/components/RolesPanel.module.css`, `src/components/CostBreakdown.module.css`, `src/components/CostBreakdown.tsx` |
| AC-21 | US-2 | 2 × £20.00 for 1h 30m = £60.00 | 2, 10 | `src/domain/meeting.test.ts`, `src/components/DurationCalculator.test.tsx`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/components/DurationCalculator.tsx` |
| AC-22 | US-2 | Adding an existing role merges into one line (3 + 2 = 5) | 9 | `src/domain/meeting.test.ts`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/App.tsx` |
| AC-23 | US-5 | Currency selector offers exactly GBP, USD, CAD, EUR | 5, 13 | `src/domain/currency.test.ts`, `src/components/CurrencySelect.test.tsx` | `src/domain/currency.ts`, `src/components/CurrencySelect.tsx` |
| AC-24 | US-6 | Meeting lines, duration and recurrence cleared on reopen | 14 | `src/App.test.tsx` (reload clears lines, duration, recurrence, result) | `src/App.tsx` |
| AC-25 | US-2 | Deleting a role removes its meeting line, updates or clears a shown cost, and says so | 18 | `src/App.test.tsx` (line removed, cost recalculated without it, cleared when no lines remain, notice in a live region, no notice if the role was not in the meeting) | `src/App.tsx`, `src/components/DurationCalculator.tsx` |
| AC-26 | US-2 | Calculate with no meeting lines shows an "add attendees first" message and no cost | 19 | `src/components/DurationCalculator.test.tsx` (message in the live region with a valid and an invalid duration, no total, table, monthly or yearly figures, earlier figures removed, message not stale after lines are added or removed) | `src/components/DurationCalculator.tsx` |

## Accessibility baseline (spec section 5)

| ID | Requirement | Task | Test | Code |
|----|-------------|------|------|------|
| A11Y-1 | Visible, programmatically linked labels | 7, 16 | `src/components/RoleForm.test.tsx`, `src/components/CurrencySelect.test.tsx`, `src/components/RecurrenceSelect.test.tsx` (role, currency and recurrence fields), `src/accessibility.test.tsx` (every field in the app) | `src/components/RoleForm.tsx`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx`, `src/components/CurrencySelect.tsx`, `src/components/RecurrenceSelect.tsx` |
| A11Y-2 | Full keyboard operation, sensible tab order, no traps | 16 | `src/accessibility.test.tsx` (core flow by keyboard, Shift+Tab, no positive tabindex; arrow keys in selects are manual) | `src/App.tsx` |
| A11Y-3 | Visible focus; default outlines not removed | 16 | `src/accessibility.test.tsx` (no outline overrides in any stylesheet) | `src/index.css` |
| A11Y-4 | Contrast 4.5:1 text, 3:1 large text, borders, focus | 16 | `src/accessibility.test.tsx` (computed contrast of every hard-coded text and border colour; no overridden page or focus colours) | `src/components/RoleForm.module.css`, `src/components/MeetingBuilder.module.css`, `src/components/CostBreakdown.module.css` |
| A11Y-5 | Errors as text next to field, linked, not colour alone | 7, 10, 16 | `src/components/RoleForm.test.tsx`, `src/components/DurationCalculator.test.tsx` (role and duration forms), `src/accessibility.test.tsx` (error linked to field, text prefix) | `src/components/RoleForm.tsx`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx` |
| A11Y-6 | Results and errors announced (`aria-live="polite"`) | 10, 16, 18, 19 | `src/components/DurationCalculator.test.tsx` (total, error and no-lines status; screen reader check is manual), `src/accessibility.test.tsx` (role, headcount and duration errors reach a live region that already exists), `src/App.test.tsx` (role-removed notice, task 18) | `src/components/DurationCalculator.tsx`, `src/components/RoleForm.tsx`, `src/components/MeetingBuilder.tsx`, `src/App.tsx` |
| A11Y-7 | `lang`, one `h1`, `main`, real buttons, breakdown as `<table>` | 1, 11, 16 | `src/App.test.tsx` (skeleton: `lang`, one `h1`, `main`), `src/components/CostBreakdown.test.tsx` (breakdown table with header cells), `src/accessibility.test.tsx` (heading order, real buttons, table headers) | `index.html`, `src/App.tsx`, `src/components/CostBreakdown.tsx` |
| A11Y-8 | Usable at 200% zoom | 15, 16 | `src/layout.test.ts` (viewport allows zoom, text wraps; no real-browser zoom check has been done, see gap G1) | `index.html`, `src/index.css` |
| A11Y-9 | Touch targets at least 24 × 24 CSS px | 15, 16 | `src/layout.test.ts` (button, input, select minimum size) | `src/index.css` |

## Visual design (spec section 5, revision 2)

| ID | Requirement | Task | Test | Code |
|----|-------------|------|------|------|
| UX-1 | Fields aligned: labels above, shared edges and row height, same-kind fields same width; related fields side by side, stacked on a phone | 20 | pending (task 20) | pending (task 20) |
| UX-2 | Results aligned: money right-aligned with tabular figures, total most prominent, one results block | 20 | pending (task 20) | pending (task 20) |
| UX-3 | One accent colour, neutrals, system fonts only, tokens defined once as CSS variables | 20 | pending (task 20) | pending (task 20) |
| UX-4 | Clear section grouping; primary, secondary and destructive buttons look different | 20 | pending (task 20) | pending (task 20) |
| UX-5 | One consistent style for rest, hover, focus, disabled and error states | 20 | pending (task 20) | pending (task 20) |
| UX-6 | No regression of any AC, A11Y-1 to A11Y-9, or the no-external-requests rule | 20 | pending (task 20) | pending (task 20) |

The visual review (UX-1 to UX-5) is the owner's, from desktop and phone-width screenshots, and is not ticked until it happens.

## Manual accessibility checks (open)

The automated tests above cover what jsdom can check. The spec's test method also asks for the checks below, which need a real browser or screen reader. They are gaps in the evidence, listed here rather than ticked, and a gap is not a sign the criteria fail.

- [ ] axe DevTools on the live page: no serious or critical issues. (`jest-axe` would automate this but is a new dependency, so it needs approval. An attempt to load axe-core into the page from a CDN was blocked.)
- [ ] Keyboard-only walkthrough in a real browser, including arrow keys in the currency, role and recurrence selects (A11Y-2). The tab order was read from Chrome on 2026-11-04: 13 controls in visual order, no positive `tabindex`.
- [ ] Focus ring visible on every control (A11Y-3), and the default ring meets 3:1 (A11Y-4). On 2026-11-04 the Currency select showed the browser's default outline (`:focus-visible`); the other controls were not each checked.
- [ ] 200% browser zoom: nothing lost or overlapping (A11Y-8). A resize to a phone width was attempted and did not take effect, so this is unchecked in a real browser. Controls measured 40 px high (A11Y-9).
- [ ] Phone-sized screen (real device or emulation): every task completes with no horizontal scrolling (AC-20). Only stylesheet text is tested today.
- [ ] NVDA or VoiceOver smoke test of add a role, build a meeting, calculate, change currency; errors and totals are announced (A11Y-6).

## Audit (2026-11-08)

Run against `specs/001-meeting-cost-calculator.md` (Approved). Nothing was fixed; this section only records findings.

**Results.** `npx vitest run`: 18 files, 276 tests, all passing. `npm run lint` clean. `npm run build` (`tsc --noEmit` and `vite build`) clean. All 24 ACs and all 9 A11Y requirements have at least one passing automated test and named code. Every cited file exists, and `docs.test.ts` enforces that. I also read the cited tests for each row, because `docs.test.ts` only checks that cells are non-empty and files exist, not that a cited test exercises the criterion.

**Where the spec's exact examples are asserted.** AC-6 (£200.00), AC-7 (£120.00 + £80.00) and AC-21 (£60.00) are asserted through the UI and the domain. AC-10 (£866.67, £10,400.00) is asserted in the domain and through `DurationCalculator`. AC-23 asserts the four option labels, including the codes.

### Gaps

- **G1. AC-20 and A11Y-8 have no real-browser evidence.** `layout.test.ts` reads CSS text, since Vitest runs with `css: false`. The "stacks form controls" test only asserts that some `max-width` media query exists, not what it does. The earlier resize attempt did not take effect, so nothing has been seen at phone width or 200% zoom. The earlier row text said a real-device check was done in task 16; it was not, and the rows now say so. Not a known failure, but unproven.
- **G2. AC-18 is only partly tested.** The one network test stubs `fetch` around the storage module. No test runs the whole app (add a role, build a meeting, calculate) with `fetch`, `XMLHttpRequest` and `sendBeacon` stubbed, and the App test checks the privacy wording only. Static evidence is good: no network APIs in `src/`, no external URLs in `index.html`, and the built bundle holds only XML namespace strings. A source-scan test or a full-flow test would close it.
- **G3. AC-12 is weakly tested.** The test asserts `52 * 5 === 260`, which restates the constant. "Holidays ignored" holds only because the code has no calendar logic. That is correct for the spec's fixed rule, but the test would not catch a change of meaning.
- **G4. AC-2 is verified in the domain only.** The hourly rate is never shown to the user, so "when the hourly rate is calculated, then it is £20.00" is tested on `hourlyRate()` and indirectly through cost totals. The spec does not require displaying it, so this is a note and not a defect.
- **G5. Behaviour that is not in the spec.** `CLAUDE.md` says to implement nothing outside an approved spec, so each needed a spec decision. Two are resolved by spec 001 revision 2 and are now tasks; two are still undecided:
  - Resolved: deleting a role removes its lines from the current meeting (`App.tsx` `deleteRole`). Now AC-25, task 18. Task 18 added the notice (`meetingNotice` in `App.tsx`).
  - Open: after Calculate, the shown total updates by itself when meeting lines change (test "keeps the total current when the meeting lines change"). The spec still has no update-as-you-type requirement and describes a Calculate action.
  - Resolved: Calculate with no meeting lines shows "Add attendees to the meeting first." and no cost. Now AC-26, task 19. Task 19 made the message appear with an invalid duration too, and stopped it going stale.
  - Open: the duration and Calculate section is hidden until at least one role exists. AC-8 only says the app tells the user to add a role first.
- **G6. The manual accessibility checks are still open** (list above): axe DevTools, a real-browser keyboard walkthrough including arrow keys in selects, focus rings on every control, 200% zoom, an NVDA/VoiceOver smoke test, and the new phone-width check. A11Y-2 to A11Y-6 are covered by jsdom tests only. Automated contrast covers hard-coded colours, not the browser's default focus ring.
- **G7. The doc check is shallow.** `docs.test.ts` cannot tell whether a cited test relates to its AC. The mapping was verified by hand in this audit and could drift as code changes.
