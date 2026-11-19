# Plan: Meeting Cost Calculator

Implements `specs/001-meeting-cost-calculator.md` and its addendum `specs/002-persistent-meetings.md` (saved meetings, see the spec 002 sections below). Task order and AC coverage are in `TASKS.md`; AC-to-test-to-code links are in `TRACEABILITY.md`.

## Architecture

Static single-page app: Vite + React + TypeScript, no backend (AC-18). Three layers:

- `src/domain/`: pure functions with no React and no browser APIs. The fixed calculation rules live here, so they are unit-tested exhaustively.
- `src/storage/`: thin `localStorage` wrapper that never throws and reports failure (AC-19).
- `src/components/` and `App.tsx`: presentational UI. State is held in `App` via `useReducer` and a small `usePersistedState` hook. No state library (CLAUDE.md: no extra dependencies without asking).

## Folder structure

```
src/
  domain/      rates.ts  meeting.ts  recurrence.ts  validation.ts  currency.ts  (+ *.test.ts)
  storage/     storage.ts  (+ test)
  hooks/       usePersistedState.ts
  components/  RolesPanel  RoleForm  MeetingBuilder  DurationFields  RecurrenceSelect
               CostBreakdown  CurrencySelect  StatusRegion  (each with .module.css + test)
  App.tsx  main.tsx  index.css
.github/workflows/deploy.yml
docs/          PLAN.md  TASKS.md  TRACEABILITY.md  BUILD-LOG.md (owner's diary)
```

## Data model

- `Role { id: string; name: string; annualSalary: number }`
- `Currency = 'GBP' | 'USD' | 'CAD' | 'EUR'`
- `MeetingLine { roleId: string; headcount: number }`: one per role; adding an existing role merges (AC-22).
- `Duration { hours: number; minutes: number }`
- `Recurrence = 'once' | 'daily' | 'weekly' | 'fortnightly' | 'monthly'`
- Persisted under key `mcc:v1`: `{ roles, currency }` only. Meeting state lives in memory and is cleared on reload (AC-24).

## Key decisions

1. **Pure domain layer.** Spec section 5 fixes every formula. Isolating them makes AC-2/6/10/11/21 straightforward to test and keeps maths out of the UI.
2. **No intermediate rounding.** Rates and totals stay as raw numbers. Rounding happens only in `formatMoney` (AC-16). Tests assert displayed strings such as £866.67.
3. **Currency is a symbol prefix only.** `GBP £`, `USD US$`, `CAD CA$`, `EUR €`, with fixed `en-GB`-style grouping and no conversion (AC-15, AC-23). This avoids `Intl` currency quirks that could render CAD as a bare `$`.
4. **Calculate button, not live update.** The spec allows it, and it gives one clear moment to announce results and errors through a single `aria-live="polite"` region (A11Y-6).
5. **Validation returns `{ ok, errors }` keyed by field id.** The UI shows each error as text next to its field, linked with `aria-describedby` (A11Y-5). Parsing is strict: `"1e3"`, `""` and `"abc"` are rejected for salary, and non-integers for headcount, hours and minutes (AC-4, AC-9). Empty hours or minutes count as 0.
6. **Storage fails soft.** `load()` and `save()` return a status. On failure the app runs with an empty role list and shows a visible notice (AC-19). Stored JSON is shape-checked before use.
7. **Plain CSS modules**, desktop-first with one mobile breakpoint. Stacked layout, `min-width: 0`, and the table in a wrapper to avoid horizontal scroll (AC-20, A11Y-8/9). Default focus outlines are kept (A11Y-3).
8. **Semantic HTML first.** One `h1`, a `main` landmark, real `<button>`s, `<label for>`, and the breakdown as a `<table>` with `<th scope>` (A11Y-1, A11Y-7).
9. **Privacy statement** visible in the UI saying data is stored only in this browser. No analytics and no network calls with user data (AC-18).
10. **Deployment.** GitHub Pages via GitHub Actions (`actions/deploy-pages`), with Vite `base` set to `/meeting-cost-calculator/`.

## Testing

Vitest + React Testing Library (jsdom). Domain tests cover the spec's worked examples (AC-2, AC-6, AC-7, AC-10, AC-21). Component tests cover validation messages, merging, empty states and storage failure.

For A11Y automation, `jest-axe` is a candidate but is a new dependency, so ask before adding it; otherwise use axe DevTools manually. Keyboard-only and NVDA/VoiceOver walkthroughs are recorded in Task 16.

## Open points

- Add `jest-axe`? (needs approval)
- Repo name for the Pages `base` path is assumed to be `meeting-cost-calculator`.

## Spec 002: persistent meetings

Adds saving, loading and deleting named meetings in this browser (US-9 to US-11, AC-27 to AC-40). Tasks 21 to 29 in `TASKS.md`.

### Architecture additions

- `src/domain/savedMeetings.ts`: pure functions. `normaliseName` (trim), `sameName` (trimmed, case-insensitive), `upsertMeeting`, `removeMeeting`, `sortByName`, and `resolveLines(saved, roles)`, which returns `{ lines, droppedRoleNames }` for the current roles.
- `src/storage/savedMeetings.ts`: fail-soft `loadSavedMeetings` and `saveSavedMeetings` under their own key, shape-checked like `storage.ts`.
- `src/hooks/useSavedMeetings.ts`: same pattern as `usePersistedState`, with its own `storageFailed` flag.
- `src/components/SavedMeetings.tsx` (+ `.module.css` and test): meeting name field, Save meeting, saved-meeting select, Load, Delete, the empty state and inline confirmations. Placed as its own section after the Meeting section.
- `DurationCalculator` gets optional props `initialHours`, `initialMinutes`, `initialRecurrence` and `onSetupChange`. `App` keeps the setup the calculator reports, so Save can read it. To load a meeting, `App` sets new initial values and remounts the calculator with a new `key`. Calls without the new props behave exactly as now.

Folder structure additions:

```
src/
  domain/      savedMeetings.ts (+ test)
  storage/     savedMeetings.ts (+ test)
  hooks/       useSavedMeetings.ts (+ test)
  components/  SavedMeetings (.tsx, .module.css, test)
```

### Data model additions

- `SavedMeeting { name: string; lines: SavedLine[]; duration: Duration; recurrence: Recurrence; currency: CurrencyCode }`
- `SavedLine { roleId: string; roleName: string; headcount: number }`
- Stored as an array under key `mcc:meetings:v1`. `mcc:v1` is unchanged and still holds only `{ roles, currency }`. The working meeting stays in memory and is cleared on reload (AC-24).

### Key decisions

11. **Separate storage key and hook.** Unreadable or unsaveable meeting data can never wipe roles or currency (AC-39), and the existing storage code and tests stay as they are.
12. **Saved meetings refer to roles; they don't copy salaries.** Lines keep `roleId` and costs always use the current roles (AC-32). `roleName` is kept only so the notice can name a role that has since been deleted (AC-33). Deleting a role does not change saved meetings (spec 002, AC-25 note).
13. **Loading remounts the calculator.** Lines come from `resolveLines`, duration and recurrence become the calculator's initial values, and the remount clears any shown cost until the user presses Calculate (AC-31). Currency is set through the existing `setData` (AC-17).
14. **Inline confirmations.** Replace (AC-30), load over a meeting with lines (AC-34) and delete (AC-36) show a message with real Confirm and Cancel buttons. Focus moves to Confirm, and back to the control that opened it afterwards; the message is announced (A11Y-2, A11Y-6, A11Y-7). Not `window.confirm`, which jsdom does not implement and which cannot be styled to UX-4/UX-5.
15. **Save validation reuses existing rules.** Duration is checked with `validateDuration` from `src/domain/validation.ts`, and an empty meeting gets the AC-26 message text (AC-29). The name check follows the role-name pattern in `RoleForm` (AC-28, A11Y-5).

### Testing

Domain and storage tests cover the spec 002 worked example (AC-32), name matching (AC-30), dropped lines (AC-33) and every storage failure case (AC-39). Component and `App` tests cover save, load, delete, confirmations, notices and reload. A keyboard walkthrough of save, load and delete is added in task 29.

### Existing tests affected by spec 002

| Test | Change | Why | Task |
|---|---|---|---|
| `src/docs.test.ts`, "has a row for every acceptance criterion" | Read spec 002 as well; expect 40 ACs instead of 26 | AC-27 to AC-40 need traceability rows | 21 |
| `src/accessibility.test.tsx`, "uses every label the spec names" | Add `Meeting name` and `Saved meeting` | A11Y-1 gains two fields under spec 002 | 25, 26 |
| `src/accessibility.test.tsx`, `allCss` list | Add `SavedMeetings.module.css` | Otherwise the focus (A11Y-3) and contrast (A11Y-4) checks skip the new stylesheet | 29 |
| `src/design.test.ts`, `sheets` map and component stylesheet list | Add `SavedMeetings.module.css` | The token, no-external-request and spacing checks (UX-3, UX-6) must cover the new section | 29 |
| `src/App.test.tsx`, "says where data is stored and that nothing is sent anywhere (AC-18)" | Assert that the statement mentions saved meetings | The app text "Meetings are not saved." becomes false and is replaced (spec 002 privacy change) | 28 |
| `src/App.test.tsx`, "keeps roles and salaries but clears the meeting after a reload (AC-17, AC-24)" | Save a meeting first; assert it is still listed after reload while the working meeting is cleared; tag with AC-37 | AC-24 is clarified by AC-37 | 28 |
| `src/App.test.tsx`, the AC-19 storage tests | Add assertions that a saved-meetings failure shows its notice and leaves roles and currency alone | AC-39 extends AC-19 | 28 |

Unchanged: `storage.test.ts` and `usePersistedState.test.ts` (separate key; `mcc:v1` still holds only roles and currency), `DurationCalculator.test.tsx` (the new props are optional), the existing keyboard walkthrough (the new section comes after Calculate) and all domain tests.

### Open points

- Inline confirmations (decision 14) rather than a modal dialog. Change before task 25 if the owner prefers otherwise.
