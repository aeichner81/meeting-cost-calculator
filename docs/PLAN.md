# Plan: Meeting Cost Calculator

Implements `specs/001-meeting-cost-calculator.md`. Task order and AC coverage are in `TASKS.md`; AC-to-test-to-code links are in `TRACEABILITY.md`.

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
