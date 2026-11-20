# Tasks

Build in order, one task at a time. Each task: tests first for its criteria, then code; stop when tests, lint and build pass. Tick the box and update `TRACEABILITY.md` when done.

- [x] **1. Scaffold and deploy.** Vite + React + TS, Vitest + RTL, ESLint, `npm` scripts (`dev`, `test`, `build`, `lint`); GitHub Pages deploy workflow; page skeleton with `lang`, one `h1` and a `main` landmark. Covers: infrastructure, A11Y-7 (skeleton).
- [x] **2. Domain: costs.** Hourly rate, duration in hours, line and total cost, per-role breakdown. Covers: AC-2, AC-6, AC-7, AC-21.
- [x] **3. Domain: recurrence.** Occurrences per year, yearly and monthly cost; "once" has no figures. Covers: AC-10, AC-11, AC-12, AC-13.
- [x] **4. Domain: validation.** Salary and meeting-input validation with per-field errors. Covers: AC-4, AC-9.
- [x] **5. Domain: currency.** Currency list and `formatMoney`, rounding to 2 dp at display only. Covers: AC-14, AC-15, AC-16, AC-23.
- [x] **6. Storage.** Fail-soft `localStorage` wrapper and `usePersistedState`. Covers: AC-17, AC-18, AC-19.
- [x] **7. Roles: add and list.** Add-role form with labels and inline errors; role list. Covers: AC-1, AC-4.
- [x] **8. Roles: edit and delete.** Later calculations use the new values. Covers: AC-3.
- [x] **9. Meeting builder.** Add a line (role + headcount), merge duplicate roles, "add a role first" empty state. Covers: AC-5, AC-8, AC-22.
- [x] **10. Duration and Calculate.** Hours and minutes fields, Calculate button, total, errors, live region. Covers: AC-5, AC-9, AC-21.
- [x] **11. Cost breakdown table.** Per-role costs that add up to the total. Covers: AC-6, AC-7.
- [x] **12. Recurrence UI.** Recurrence select with monthly and yearly display. Covers: AC-10, AC-11, AC-12, AC-13.
- [x] **13. Currency selector.** Wired to display and persistence. Covers: AC-14, AC-15, AC-16, AC-17, AC-23.
- [x] **14. Persistence behaviours.** Meeting cleared on reload, storage-unavailable notice, privacy statement. Covers: AC-17, AC-18, AC-19, AC-24.
- [x] **15. Responsive layout.** Phone-sized layout without horizontal scroll; touch targets. Covers: AC-20, A11Y-8, A11Y-9.
- [x] **16. Accessibility pass.** Axe check, keyboard walkthrough, contrast, focus, screen reader smoke test notes. Covers: A11Y-1 to A11Y-9. (Automated checks done; the manual axe, browser keyboard, zoom and screen reader checks are listed in `TRACEABILITY.md`.)
- [x] **17. Wrap-up.** Finish `TRACEABILITY.md`, write the README (the method story), confirm the live Pages site. Covers: documentation.

Change request, spec 001 revision 2 (2026-11-08). Same rules: tests first, then code; stop when tests, lint and build pass; tick the box and update `TRACEABILITY.md`.

- [x] **18. Delete cascade.** Deleting a role removes its line from the meeting, a shown cost no longer includes it (cleared if no lines remain), and a text notice, announced through a live region, says which role's line was removed. Existing behaviour is only tested as "drops meeting lines"; add the notice and tag the tests with the AC. Covers: AC-25, A11Y-6.
- [x] **19. No-lines message.** Calculate on a meeting with no lines, including with a valid duration, shows a clear "add attendees first" message, no cost, announced to screen readers. The message exists today; tag its tests with the AC, check it with a valid and an invalid duration, and make sure no stale cost or recurring figures remain. Covers: AC-26, A11Y-6.
- [x] **20. Visual design pass.** Define design tokens once as CSS variables (one accent colour, neutrals, system font stack, size and spacing scale). Align fields on a shared grid with labels above; put related fields side by side on desktop and stacked on a phone. Right-align money columns with tabular figures; make the total the most prominent figure and group per-occurrence, monthly and yearly figures in one results block. Group sections consistently; style primary, secondary and destructive buttons differently; one style for rest, hover, focus, disabled and error states. No new dependencies, no web fonts, no external requests. Add stylesheet tests for the checkable parts, keep all existing layout and accessibility tests green, then pause for the owner's review of desktop and phone-width screenshots. Covers: UX-1 to UX-6 (and must not regress AC-20, A11Y-3, A11Y-4, A11Y-8, A11Y-9). This may be split into two tasks (tokens and form layout; results block) if it proves large.

Change request, spec 002 (persistent meetings). Same rules: tests first, then code; stop when tests, lint and build pass; tick the box and update `TRACEABILITY.md`. Design and the list of existing tests that change are in `PLAN.md`, section "Spec 002: persistent meetings".

- [x] **21. Traceability for spec 002.** `docs.test.ts` reads both specs and expects 40 acceptance criteria; add `pending` rows for AC-27 to AC-40 to `TRACEABILITY.md`. Covers: documentation.
- [x] **22. Domain: saved meetings.** Pure functions for trimming and matching names (ignoring case), saving or replacing, removing, sorting by name, and resolving saved lines against the current roles (keeping current salaries, collecting the names of deleted roles). Covers: AC-28, AC-30, AC-32, AC-33, AC-36, AC-37.
- [ ] **23. Storage: saved meetings.** Fail-soft load and save under `mcc:meetings:v1` with shape checks and no network calls, plus a `useSavedMeetings` hook. A failure here never touches roles or currency. Covers: AC-37, AC-38, AC-39.
- [ ] **24. Lift the meeting setup.** Optional initial hours, minutes and recurrence and an `onSetupChange` callback on `DurationCalculator`; `App` keeps the current setup. No visible change; all existing tests stay green. Covers: groundwork for AC-27 and AC-31.
- [ ] **25. Save meeting.** A Saved meetings section with a meeting name field and Save meeting; inline name error; the AC-26 and AC-9 messages when the meeting can't be saved; replace confirmation for a matching name. Add `Meeting name` to the A11Y-1 label test. Covers: AC-27, AC-28, AC-29, AC-30, A11Y-1, A11Y-5, A11Y-6.
- [ ] **26. Load meeting.** Saved-meeting select and Load. Loading replaces lines, duration and recurrence, switches the currency and clears any shown cost; lines for deleted roles are left out with an announced notice; confirmation when the current meeting has lines; "no saved meetings yet" empty state. Add `Saved meeting` to the A11Y-1 label test. Covers: AC-31, AC-32, AC-33, AC-34, AC-35, A11Y-1, A11Y-6.
- [ ] **27. Delete saved meeting.** Delete with confirmation; the working meeting is unchanged. Covers: AC-36.
- [ ] **28. Persistence, privacy and storage notices.** Saved meetings survive a reload while the working meeting is still cleared; the privacy statement mentions saved meetings; a saved-meetings storage failure shows a notice and leaves roles and currency alone. Update the affected `App.test.tsx` tests listed in `PLAN.md`. Covers: AC-24, AC-37, AC-38, AC-39.
- [ ] **29. Layout, accessibility and design for the new section.** CSS module using the existing tokens; fields and buttons aligned and stacked on a phone; add the stylesheet to the design and accessibility checks; keyboard walkthrough of save, load and delete; then pause for the owner's desktop and phone-width screenshot review. Covers: AC-40, A11Y-1 to A11Y-9, UX-1 to UX-6.
