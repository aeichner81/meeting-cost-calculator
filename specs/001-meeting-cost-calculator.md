# Spec 001: Meeting Cost Calculator
Status: Approved
Revision 2 (2026-11-08): adds AC-25 and AC-26 (meeting behaviour found by the audit), US-8 and the visual design requirements UX-1 to UX-6. Nothing in revision 1 changes.

## 1. Problem
Managers rarely see what their meetings cost. Without that, it is hard to judge which meetings are worth having and which are not. The app makes the cost of a meeting visible, in money, based on who attends and how long it lasts, so the manager can make that decision. The app supplies cost data only. The manager decides whether a meeting is worth it.

## 2. Users
- **Primary: a manager reviewing their calendar.** They go through the meetings on it and judge which are worth keeping. They enter roles and salaries themselves.
- No secondary users in the prototype. Teams-based use (roles pulled automatically) is planned for v2.

## 3. User stories
- US-1: As a manager, I want to define roles with an annual salary, so that the app can work out an hourly cost for each role.
- US-2: As a manager, I want to describe a meeting by its roles, headcount per role and duration (in hours and minutes), so that I can see what it costs.
- US-3: As a manager, I want to see the cost broken down by role, so that I can see where the cost comes from.
- US-4: As a manager, I want to mark a meeting as recurring (once, daily, weekly, fortnightly or monthly), so that I can see its monthly and yearly cost.
- US-5: As a manager, I want to choose a currency (pounds sterling, US dollars, Canadian dollars or euros; default pounds sterling), so that costs are shown in the currency I think in.
- US-6: As a manager, I want my roles, salaries and currency saved in my browser, so that I don't have to re-enter them each visit.
- US-7: As a manager, I want the app to work on a phone or tablet as well as a desktop, so that I can check a meeting's cost wherever I am.
- US-8: As a manager, I want a clean, minimal and good-looking interface in which fields and results line up neatly, so that I can read a meeting's cost at a glance and the tool feels pleasant to use.


## 4. Acceptance criteria

**Roles and salaries (US-1)**
- AC-1 (US-1): Given I have no roles, when I add a role with a name and an annual salary, then the role appears in my role list.
- AC-2 (US-1): Given a role with an annual salary of £36,400, when the hourly rate is calculated, then it is £20.00 (salary ÷ 1,820, where 1,820 = 52 weeks × 35 hours).
- AC-3 (US-1): Given an existing role, when I edit its name or salary or delete it, then the role list reflects the change and later calculations use the new values.
- AC-4 (US-1): Given I enter a role name that is empty or contains only spaces, or a salary that is empty, zero, negative or not a number, when I try to save the role, then the app shows a clear error next to the invalid field and does not save it. Any non-blank name is accepted. Any positive salary is accepted; there is no upper limit.

**Meeting cost (US-2, US-3)**
- AC-5 (US-2): Given roles exist, when I add a meeting line with a role and a headcount (any whole number of at least 1, with no upper limit) and enter a duration in hours and minutes, then the app shows the total cost of the meeting.
- AC-6 (US-2): Given role A at £20.00/h with 3 attendees and role B at £40.00/h with 1 attendee, when the meeting lasts 2 hours 0 minutes, then the total cost is £200.00 ((3 × 20 + 1 × 40) × 2).
- AC-21 (US-2): Given role A at £20.00/h with 2 attendees, when the meeting lasts 1 hour 30 minutes, then the total cost is £60.00 (2 × 20 × 1.5).
- AC-22 (US-2): Given a meeting already has a line for role A with 3 attendees, when I add role A again with 2 attendees, then the meeting shows a single line for role A with 5 attendees.
- AC-7 (US-3): Given the meeting in AC-6, when the cost is shown, then the breakdown lists role A £120.00 and role B £80.00, which add up to the total.
- AC-8 (US-2): Given no roles are defined, when I open the meeting calculator, then the app tells me to add a role first and offers a way to do so.
- AC-9 (US-2): Given I enter a headcount below 1 or a non-whole headcount, hours that are negative or not a whole number, minutes outside 0–59 or not a whole number, or a total duration of zero, when the cost is calculated, then the app shows a clear error and no cost. An empty hours or minutes field counts as 0.

- AC-25 (US-2): Given a meeting has a line for role A and other lines, when I delete role A from the role list, then the meeting no longer has a line for role A, any cost already shown no longer includes role A, and the app tells me (in text, announced to screen readers) that role A's line was removed from the meeting. If no lines remain, any shown cost, breakdown and recurring figures are cleared.
- AC-26 (US-2): Given the meeting has no lines, when I calculate, then the app shows a clear message that I need to add attendees to the meeting first, shows no cost, and announces the message to screen readers. This applies even when the duration is valid.

**Recurring meetings (US-4)**
- AC-10 (US-4): Given a meeting costing £200.00 per occurrence, when I set it to repeat weekly, then the app shows a monthly cost of £866.67 (52 ÷ 12 occurrences) and a yearly cost of £10,400.00 (52 occurrences).
- AC-11 (US-4): Given a recurring meeting, when I choose daily, weekly, fortnightly or monthly, then the occurrences per year are 260, 52, 26 and 12 respectively, and the monthly cost is the yearly cost ÷ 12.
- AC-12 (US-4): Given daily recurrence, when the cost is calculated, then only weekdays (Monday to Friday) count and holidays are ignored.
- AC-13 (US-4): Given a meeting is not recurring, when the cost is shown, then only the per-occurrence cost is shown, with no monthly or yearly figures.

**Currency and formatting (US-5)**
- AC-14 (US-5): Given I have not chosen a currency, when I use the app, then costs are shown in pounds sterling (£).
- AC-23 (US-5): Given I open the currency selector, then it offers exactly four options: pounds sterling (£, GBP), US dollars (US$, USD), Canadian dollars (CA$, CAD) and euros (€, EUR, for Belgium).
- AC-15 (US-5): Given I choose another currency, when costs are shown, then the symbol changes and the numbers do not (display label only, no conversion). Salaries are assumed to be entered in the chosen currency.
- AC-16 (US-5): Given any cost is displayed, then it is rounded to two decimal places. Rounding happens only on the final displayed values, not on intermediate hourly rates.

**Persistence and privacy (US-6)**
- AC-17 (US-6): Given I have added roles and chosen a currency, when I close and reopen the app in the same browser, then my roles, salaries and currency are still there.
- AC-24 (US-6): Given I have entered a meeting, when I close and reopen the app, then the meeting lines, duration and recurrence are cleared. Meetings are not saved in v1.
- AC-18 (US-6): Given I use the app, then no salary, role or meeting data is sent to any server.
- AC-19 (US-6): Given browser storage is unavailable or cleared, when I open the app, then it still works with an empty role list and tells me the data could not be loaded or saved.

**Responsive use (US-7)**
- AC-20 (US-7): Given a phone-sized screen, when I use the app, then I can complete every task above without horizontal scrolling.

## 5. Non-functional requirements
- **Accessibility (lighter baseline for the prototype):** full WCAG 2.2 AA conformance is not required for v1, but each of the following must pass:
  - A11Y-1 **Labels:** every form field (role name, salary, role choice, headcount, hours, minutes, recurrence, currency) has a visible text label that is programmatically linked to it. Placeholder text is not used as a label.
  - A11Y-2 **Keyboard:** every task in section 4 can be completed with the keyboard alone (Tab, Shift+Tab, Enter, Space, arrow keys in selects). Tab order follows the visual order and focus never gets trapped.
  - A11Y-3 **Visible focus:** the focused element always has a clearly visible focus indicator. Browser default focus outlines are not removed.
  - A11Y-4 **Contrast:** normal text has a contrast ratio of at least 4.5:1, and large text, input borders and focus indicators have at least 3:1.
  - A11Y-5 **Errors:** each validation error is shown as text next to the field it applies to and is linked to that field (for example with `aria-describedby`). Errors are not shown by colour alone.
  - A11Y-6 **Results announced:** when a cost is calculated or an error appears, the change is announced to screen readers (for example through an `aria-live="polite"` region).
  - A11Y-7 **Structure:** the page has `lang` set, one `h1`, headings in logical order and a `main` landmark. Actions use real `<button>` elements, and the cost breakdown is a `<table>` with header cells.
  - A11Y-8 **Zoom:** at 200% browser zoom, all content and controls remain usable without loss of content.
  - A11Y-9 **Touch targets:** buttons and other interactive controls are at least 24 × 24 CSS pixels.
  - **How it is tested:** an automated check (for example axe DevTools) reports no serious or critical issues; a keyboard-only walkthrough of the core flow (add a role, build a meeting, calculate, change currency); and a short screen reader smoke test of the same flow with NVDA (Windows) or VoiceOver (Mac/iOS).
- **Visual design (US-8):** the interface is minimal and polished rather than decorated. UX-1 to UX-6 must hold. Taste is subjective, so acceptance is the owner's review of screenshots at desktop and phone width, plus the automated checks listed below.
  - UX-1 **Alignment of fields:** within each form, labels sit in one consistent position relative to their fields (above, left-aligned), fields and buttons share common left edges and a common row height, and fields of the same kind have the same width. Related fields (hours and minutes; role and headcount) sit side by side on a desktop and stack on a phone.
  - UX-2 **Alignment of results:** money amounts in the breakdown and recurring figures are right-aligned with tabular figures, so decimal points line up in a column. The total is the most prominent figure on screen. The per-occurrence, monthly and yearly figures sit together in one results block with consistent labels.
  - UX-3 **Minimal palette and type:** one accent colour plus neutrals, one system font stack with no web fonts or other external requests (privacy, AC-18), and a small fixed set of sizes and spacing steps defined once as CSS variables.
  - UX-4 **Hierarchy and grouping:** each section (currency, roles, meeting, results) is clearly grouped with consistent spacing and heading sizes. The primary action in each form (Add role, Add to meeting, Calculate) looks different from secondary actions (Edit, Cancel) and from destructive ones (Delete).
  - UX-5 **Consistent states:** buttons, inputs and selects share one style for rest, hover, focus, disabled and error states. Errors stay as text, as A11Y-5 requires.
  - UX-6 **No regression:** the redesign must not break any AC, A11Y-1 to A11Y-9 (including contrast, visible default focus, 24 × 24 px targets and no horizontal scrolling at phone width) or the privacy rule of no external requests.
  - **How it is tested:** automated stylesheet checks (design tokens defined once, no external fonts or URLs, right-aligned numeric columns with tabular figures, the existing layout and accessibility tests unchanged and passing), then the owner reviews desktop and phone-width screenshots against UX-1 to UX-5.
- **Performance:** the app should feel quick and responsive. There are no formal targets. It has no required "update as you type" behaviour, so a Calculate action is acceptable.
- **Privacy:** all data stays in the user's browser (local storage). There are no accounts, no server calls with user data and no analytics that capture salary or role data. Salary data is sensitive, so the app should say clearly where it is stored.
- **Compatibility:** latest versions of the major browsers (Chrome, Edge, Firefox, Safari). Designed desktop-first, with a layout that works well on mobile devices where possible.
- **Calculation rules (fixed):** hourly rate = annual salary ÷ 1,820. Duration in hours = hours + minutes ÷ 60. Occurrences per year: daily 260, weekly 52, fortnightly 26, monthly 12. Monthly cost = yearly cost ÷ 12.
- **Input limits:** v1 has no maximum for salary or headcount. Minutes must be 0–59; hours have no maximum.

## 6. Out of scope
- Teams or any calendar integration (planned for v2)
- Server-side accounts, sign-in and cross-device sync (later version)
- Saving, naming or reloading individual meetings (planned for a later version; v1 meetings are throwaway)
- Currencies other than GBP, USD, CAD and EUR
- Overhead multipliers (benefits, tax) and an editable working-hours figure
- Calendar-accurate occurrences and public holiday or leave handling
- Value or ROI scoring, and thresholds or flags for whether a meeting is "worth it" (the manager judges)
- Currency conversion (currency is a display label only)
- Export and import of the role table
- Full WCAG 2.2 AA conformance
- Dark mode or theming, a logo or branding, custom or web fonts, illustrations and animations (the redesign is layout, spacing, colour and type only)

## 7. Resolved questions
- **Duration units:** entered as hours and minutes (two fields). See AC-5, AC-9, AC-21.
- **Same role more than once:** a meeting can have any number of attendees in each role. Adding a role that is already in the meeting merges into its existing line. See AC-5, AC-22.
- **Currencies:** a fixed list of GBP, USD, CAD and EUR (Belgium). Salaries are assumed to be entered in the chosen currency. See AC-23, AC-15.
- **Maximum values:** no maximum for salary or headcount in v1. See AC-4, AC-5.
- **Saving meetings:** meetings are throwaway in v1; only roles and currency persist. Saved meetings are planned for a later version. See AC-24.
- **Lighter accessibility baseline:** defined as A11Y-1 to A11Y-9 in section 5, with a test method.
- **Deleting a role used in the meeting (revision 2):** its line is removed from the meeting and the user is told. Silent removal was rejected. See AC-25.
- **Calculating an empty meeting (revision 2):** a clear "add attendees first" message, no cost. See AC-26.
- **Look and feel (revision 2):** minimal, aligned, one accent colour, system fonts only. Defined as UX-1 to UX-6 in section 5.
- **Still open (not decided in revision 2):** whether the shown total updates by itself when lines change after Calculate, and whether the duration section stays hidden until a role exists. Current behaviour stays but is not specified.
