# Tasks

Build in order, one task at a time. Each task: tests first for its criteria, then code; stop when tests, lint and build pass. Tick the box and update `TRACEABILITY.md` when done.

- [x] **1. Scaffold and deploy.** Vite + React + TS, Vitest + RTL, ESLint, `npm` scripts (`dev`, `test`, `build`, `lint`); GitHub Pages deploy workflow; page skeleton with `lang`, one `h1` and a `main` landmark. Covers: infrastructure, A11Y-7 (skeleton).
- [x] **2. Domain: costs.** Hourly rate, duration in hours, line and total cost, per-role breakdown. Covers: AC-2, AC-6, AC-7, AC-21.
- [x] **3. Domain: recurrence.** Occurrences per year, yearly and monthly cost; "once" has no figures. Covers: AC-10, AC-11, AC-12, AC-13.
- [ ] **4. Domain: validation.** Salary and meeting-input validation with per-field errors. Covers: AC-4, AC-9.
- [ ] **5. Domain: currency.** Currency list and `formatMoney`, rounding to 2 dp at display only. Covers: AC-14, AC-15, AC-16, AC-23.
- [ ] **6. Storage.** Fail-soft `localStorage` wrapper and `usePersistedState`. Covers: AC-17, AC-18, AC-19.
- [ ] **7. Roles: add and list.** Add-role form with labels and inline errors; role list. Covers: AC-1, AC-4.
- [ ] **8. Roles: edit and delete.** Later calculations use the new values. Covers: AC-3.
- [ ] **9. Meeting builder.** Add a line (role + headcount), merge duplicate roles, "add a role first" empty state. Covers: AC-5, AC-8, AC-22.
- [ ] **10. Duration and Calculate.** Hours and minutes fields, Calculate button, total, errors, live region. Covers: AC-5, AC-9, AC-21.
- [ ] **11. Cost breakdown table.** Per-role costs that add up to the total. Covers: AC-6, AC-7.
- [ ] **12. Recurrence UI.** Recurrence select with monthly and yearly display. Covers: AC-10, AC-11, AC-12, AC-13.
- [ ] **13. Currency selector.** Wired to display and persistence. Covers: AC-14, AC-15, AC-16, AC-17, AC-23.
- [ ] **14. Persistence behaviours.** Meeting cleared on reload, storage-unavailable notice, privacy statement. Covers: AC-17, AC-18, AC-19, AC-24.
- [ ] **15. Responsive layout.** Phone-sized layout without horizontal scroll; touch targets. Covers: AC-20, A11Y-8, A11Y-9.
- [ ] **16. Accessibility pass.** Axe check, keyboard walkthrough, contrast, focus, screen reader smoke test notes. Covers: A11Y-1 to A11Y-9.
- [ ] **17. Wrap-up.** Finish `TRACEABILITY.md`, write the README (the method story), confirm the live Pages site. Covers: documentation.
