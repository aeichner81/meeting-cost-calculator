# Traceability

Acceptance criteria from `specs/001-meeting-cost-calculator.md`. "Task" is pre-filled from `TASKS.md`; "Test" and "Code" are filled in as tasks are completed.

| AC | Story | Summary | Task | Test | Code |
|----|-------|---------|------|------|------|
| AC-1 | US-1 | Add a role with name and annual salary; it appears in the list | 7 | | |
| AC-2 | US-1 | Hourly rate = salary ÷ 1,820 (£36,400 → £20.00) | 2 | | |
| AC-3 | US-1 | Edit or delete a role; later calculations use new values | 8 | | |
| AC-4 | US-1 | Invalid salary shows an error and is not saved | 4, 7 | | |
| AC-5 | US-2 | Add meeting line (role, headcount) and duration; total cost shown | 9, 10 | | |
| AC-6 | US-2 | 3×£20 + 1×£40 for 2h = £200.00 | 2, 11 | | |
| AC-7 | US-3 | Breakdown by role (£120.00 + £80.00) adds up to total | 2, 11 | | |
| AC-8 | US-2 | No roles: prompt to add a role first | 9 | | |
| AC-9 | US-2 | Invalid headcount, hours, minutes or zero duration shows error, no cost | 4, 10 | | |
| AC-10 | US-4 | Weekly £200.00 → £866.67 monthly, £10,400.00 yearly | 3, 12 | | |
| AC-11 | US-4 | Occurrences per year 260 / 52 / 26 / 12; monthly = yearly ÷ 12 | 3, 12 | | |
| AC-12 | US-4 | Daily counts weekdays only; holidays ignored | 3, 12 | | |
| AC-13 | US-4 | Non-recurring shows per-occurrence cost only | 3, 12 | | |
| AC-14 | US-5 | Default currency is pounds sterling (£) | 5, 13 | | |
| AC-15 | US-5 | Changing currency changes the symbol only, not the numbers | 5, 13 | | |
| AC-16 | US-5 | Displayed costs rounded to 2 dp; no intermediate rounding | 5, 13 | | |
| AC-17 | US-6 | Roles, salaries and currency persist across reopen | 6, 13, 14 | | |
| AC-18 | US-6 | No salary, role or meeting data sent to any server | 6, 14 | | |
| AC-19 | US-6 | Storage unavailable: app works with empty list and says so | 6, 14 | | |
| AC-20 | US-7 | Phone-sized screen: all tasks without horizontal scrolling | 15, 16 | | |
| AC-21 | US-2 | 2 × £20.00 for 1h 30m = £60.00 | 2, 10 | | |
| AC-22 | US-2 | Adding an existing role merges into one line (3 + 2 = 5) | 9 | | |
| AC-23 | US-5 | Currency selector offers exactly GBP, USD, CAD, EUR | 5, 13 | | |
| AC-24 | US-6 | Meeting lines, duration and recurrence cleared on reopen | 14 | | |

## Accessibility baseline (spec section 5)

| ID | Requirement | Task | Test | Code |
|----|-------------|------|------|------|
| A11Y-1 | Visible, programmatically linked labels | 7, 16 | | |
| A11Y-2 | Full keyboard operation, sensible tab order, no traps | 16 | | |
| A11Y-3 | Visible focus; default outlines not removed | 16 | | |
| A11Y-4 | Contrast 4.5:1 text, 3:1 large text, borders, focus | 16 | | |
| A11Y-5 | Errors as text next to field, linked, not colour alone | 7, 10, 16 | | |
| A11Y-6 | Results and errors announced (`aria-live="polite"`) | 10, 16 | | |
| A11Y-7 | `lang`, one `h1`, `main`, real buttons, breakdown as `<table>` | 1, 11, 16 | | |
| A11Y-8 | Usable at 200% zoom | 15, 16 | | |
| A11Y-9 | Touch targets at least 24 × 24 CSS px | 15, 16 | | |
