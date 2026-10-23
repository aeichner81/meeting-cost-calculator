# Traceability

Acceptance criteria from `specs/001-meeting-cost-calculator.md`. "Task" is pre-filled from `TASKS.md`; "Test" and "Code" are filled in as tasks are completed.

| AC | Story | Summary | Task | Test | Code |
|----|-------|---------|------|------|------|
| AC-1 | US-1 | Add a role with name and annual salary; it appears in the list | 7 | `src/components/RoleForm.test.tsx`, `src/components/RolesPanel.test.tsx`, `src/App.test.tsx` | `src/components/RoleForm.tsx`, `src/components/RolesPanel.tsx`, `src/App.tsx` |
| AC-2 | US-1 | Hourly rate = salary ÷ 1,820 (£36,400 → £20.00) | 2 | `src/domain/rates.test.ts` (domain only; UI in later tasks) | `src/domain/rates.ts` |
| AC-3 | US-1 | Edit or delete a role; later calculations use new values | 8 | `src/components/RolesPanel.test.tsx`, `src/components/RoleForm.test.tsx`, `src/App.test.tsx` (meeting lines that use roles arrive in task 9) | `src/components/RolesPanel.tsx`, `src/components/RoleForm.tsx`, `src/App.tsx` |
| AC-4 | US-1 | Blank name or invalid salary shows an error and is not saved | 4, 7, 8 | `src/domain/validation.test.ts`, `src/components/RoleForm.test.tsx`, `src/App.test.tsx` | `src/domain/validation.ts`, `src/components/RoleForm.tsx` |
| AC-5 | US-2 | Add meeting line (role, headcount) and duration; total cost shown | 9, 10 | `src/domain/meeting.test.ts`, `src/domain/validation.test.ts`, `src/components/MeetingBuilder.test.tsx`, `src/components/DurationCalculator.test.tsx`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/domain/validation.ts`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx`, `src/App.tsx` |
| AC-6 | US-2 | 3×£20 + 1×£40 for 2h = £200.00 | 2, 11 | `src/domain/meeting.test.ts`, `src/components/CostBreakdown.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/meeting.ts`, `src/components/CostBreakdown.tsx` |
| AC-7 | US-3 | Breakdown by role (£120.00 + £80.00) adds up to total | 2, 11 | `src/domain/meeting.test.ts`, `src/components/CostBreakdown.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/meeting.ts`, `src/components/CostBreakdown.tsx` |
| AC-8 | US-2 | No roles: prompt to add a role first | 9 | `src/components/MeetingBuilder.test.tsx`, `src/App.test.tsx` | `src/components/MeetingBuilder.tsx`, `src/App.tsx` |
| AC-9 | US-2 | Invalid headcount, hours, minutes or zero duration shows error, no cost | 4, 9, 10 | `src/domain/validation.test.ts`, `src/components/MeetingBuilder.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/validation.ts`, `src/components/MeetingBuilder.tsx`, `src/components/DurationCalculator.tsx` |
| AC-10 | US-4 | Weekly £200.00 → £866.67 monthly, £10,400.00 yearly | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-11 | US-4 | Occurrences per year 260 / 52 / 26 / 12; monthly = yearly ÷ 12 | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-12 | US-4 | Daily counts weekdays only; holidays ignored | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-13 | US-4 | Non-recurring shows per-occurrence cost only | 3, 12 | `src/domain/recurrence.test.ts`, `src/components/RecurrenceSelect.test.tsx`, `src/components/DurationCalculator.test.tsx` | `src/domain/recurrence.ts`, `src/components/RecurrenceSelect.tsx`, `src/components/DurationCalculator.tsx` |
| AC-14 | US-5 | Default currency is pounds sterling (£) | 5, 13 | `src/domain/currency.test.ts` (domain only; UI in task 13) | `src/domain/currency.ts` |
| AC-15 | US-5 | Changing currency changes the symbol only, not the numbers | 5, 13 | `src/domain/currency.test.ts` (domain only; UI in task 13) | `src/domain/currency.ts` |
| AC-16 | US-5 | Displayed costs rounded to 2 dp; no intermediate rounding | 5, 13 | `src/domain/currency.test.ts` (domain only; UI in task 13) | `src/domain/currency.ts` |
| AC-17 | US-6 | Roles, salaries and currency persist across reopen | 6, 13, 14 | `src/storage/storage.test.ts`, `src/hooks/usePersistedState.test.ts` (storage layer only; currency wiring in task 13) | `src/storage/storage.ts`, `src/hooks/usePersistedState.ts` |
| AC-18 | US-6 | No salary, role or meeting data sent to any server | 6, 14 | `src/storage/storage.test.ts` (no network calls from storage; privacy statement in task 14) | `src/storage/storage.ts` |
| AC-19 | US-6 | Storage unavailable: app works with empty list and says so | 6, 14 | `src/storage/storage.test.ts`, `src/hooks/usePersistedState.test.ts` (fail-soft and `storageFailed` flag; visible notice in task 14) | `src/storage/storage.ts`, `src/hooks/usePersistedState.ts` |
| AC-20 | US-7 | Phone-sized screen: all tasks without horizontal scrolling | 15, 16 | | |
| AC-21 | US-2 | 2 × £20.00 for 1h 30m = £60.00 | 2, 10 | `src/domain/meeting.test.ts`, `src/components/DurationCalculator.test.tsx`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/components/DurationCalculator.tsx` |
| AC-22 | US-2 | Adding an existing role merges into one line (3 + 2 = 5) | 9 | `src/domain/meeting.test.ts`, `src/App.test.tsx` | `src/domain/meeting.ts`, `src/App.tsx` |
| AC-23 | US-5 | Currency selector offers exactly GBP, USD, CAD, EUR | 5, 13 | `src/domain/currency.test.ts` (domain only; UI in task 13) | `src/domain/currency.ts` |
| AC-24 | US-6 | Meeting lines, duration and recurrence cleared on reopen | 14 | | |

## Accessibility baseline (spec section 5)

| ID | Requirement | Task | Test | Code |
|----|-------------|------|------|------|
| A11Y-1 | Visible, programmatically linked labels | 7, 16 | `src/components/RoleForm.test.tsx` (role fields only) | `src/components/RoleForm.tsx` |
| A11Y-2 | Full keyboard operation, sensible tab order, no traps | 16 | | |
| A11Y-3 | Visible focus; default outlines not removed | 16 | | |
| A11Y-4 | Contrast 4.5:1 text, 3:1 large text, borders, focus | 16 | | |
| A11Y-5 | Errors as text next to field, linked, not colour alone | 7, 10, 16 | `src/components/RoleForm.test.tsx`, `src/components/DurationCalculator.test.tsx` (role and duration forms) | `src/components/RoleForm.tsx`, `src/components/DurationCalculator.tsx` |
| A11Y-6 | Results and errors announced (`aria-live="polite"`) | 10, 16 | `src/components/DurationCalculator.test.tsx` (total and error status; screen reader check in task 16) | `src/components/DurationCalculator.tsx` |
| A11Y-7 | `lang`, one `h1`, `main`, real buttons, breakdown as `<table>` | 1, 11, 16 | `src/App.test.tsx` (skeleton: `lang`, one `h1`, `main`), `src/components/CostBreakdown.test.tsx` (breakdown table with header cells; buttons audited in task 16) | `index.html`, `src/App.tsx`, `src/components/CostBreakdown.tsx` |
| A11Y-8 | Usable at 200% zoom | 15, 16 | | |
| A11Y-9 | Touch targets at least 24 × 24 CSS px | 15, 16 | | |
