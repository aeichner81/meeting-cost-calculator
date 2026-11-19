# Spec 002: Persistent Meetings
Status: Approved
Amends: Spec 001 (revision 2). Everything in spec 001 still applies unless section 6 of this spec says otherwise.

Summary: the user can save the current meeting under a name in their browser and load it again later. Data stays in the browser (local storage); nothing is sent to a server.

## 1. Problem
A manager reviewing their calendar meets the same meetings again and again: the weekly team sync, the monthly review. In spec 001 meetings are throwaway (AC-24), so the manager rebuilds each meeting from scratch on every visit. Saving a meeting setup removes that repetition and makes it easy to re-check a meeting's cost after salaries change.

## 2. Users
- **Primary: a manager reviewing their calendar**, as in spec 001. No new users.

## 3. User stories
- US-9: As a manager, I want to save the current meeting (attendees, roles, duration, recurrence and currency) under a name, so that I don't have to rebuild it on my next visit.
- US-10: As a manager, I want to load a saved meeting, so that I can see what it costs with my current roles and salaries.
- US-11: As a manager, I want to delete a saved meeting I no longer need, so that my list stays short and relevant.

## 4. Acceptance criteria
Numbering continues from spec 001.

**Saving (US-9)**
- AC-27 (US-9): Given the meeting has at least one line and a valid duration, when I enter a name and choose Save meeting, then the meeting appears in my saved-meetings list under that name, and the saved copy holds its lines (role and headcount), duration (hours and minutes), recurrence and currency.
- AC-28 (US-9): Given I enter a meeting name that is empty or contains only spaces, when I try to save, then the app shows a clear error next to the name field and nothing is saved. Leading and trailing spaces are removed from any name that is saved.
- AC-29 (US-9): Given the meeting has no lines, or its duration is invalid under AC-9, when I try to save, then the app shows the same message it shows for AC-26 or AC-9 and nothing is saved.
- AC-30 (US-9): Given a saved meeting named "Weekly sync" exists, when I save a meeting as "weekly sync" (names are compared ignoring case and surrounding spaces), then the app asks whether to replace the existing meeting. If I confirm, the saved meeting is replaced. If I cancel, the existing saved meeting is unchanged and nothing new is saved.

**Loading (US-10)**
- AC-31 (US-10): Given a saved meeting, when I load it, then the working meeting's lines, duration and recurrence are replaced by the saved ones, the app currency changes to the saved currency, and any previously shown cost, breakdown and recurring figures are cleared until I calculate again.
- AC-32 (US-10): Given the meeting in AC-6 was saved, and role A's salary was then changed from £36,400 to £72,800 (£40.00/h), when I load the saved meeting and calculate, then the total cost is £320.00 ((3 × 40 + 1 × 40) × 2). Loading always uses current salaries.
- AC-33 (US-10): Given a saved meeting has a line for a role that has since been deleted, when I load it, then that line is left out of the working meeting, the app tells me (in text, announced to screen readers) which role's line was left out, and the saved meeting itself is not changed. If no lines remain, AC-26 applies when I calculate.
- AC-34 (US-10): Given the working meeting has at least one line, when I choose to load a saved meeting, then the app asks me to confirm replacing the current meeting. If I cancel, the working meeting, currency and any shown cost are unchanged.
- AC-35 (US-10): Given no meetings are saved, when I view the saved-meetings section, then it says there are no saved meetings yet and offers no load or delete action.

**Deleting (US-11)**
- AC-36 (US-11): Given a saved meeting, when I choose to delete it, then the app asks me to confirm. If I confirm, the meeting is removed from the saved-meetings list; if I cancel, it stays. Either way, the working meeting is unchanged.

**Persistence and privacy (US-9, US-10, US-11)**
- AC-37 (US-9): Given I have saved meetings, when I close and reopen the app in the same browser, then they are still in my saved-meetings list, sorted by name (A to Z, ignoring case). The working meeting is still cleared on reopen (AC-24).
- AC-38 (US-9): Given I save, load or delete meetings, then no meeting data is sent to any server.
- AC-39 (US-9): Given browser storage is unavailable or full, or the saved-meeting data cannot be read, when I open the app or save a meeting, then the app still works, my roles and currency are unaffected, and the app tells me saved meetings could not be loaded or saved.

**Responsive use (US-9, US-10, US-11)**
- AC-40 (US-10): Given a phone-sized screen, when I save, load or delete a meeting, then I can complete it without horizontal scrolling.

## 5. Non-functional requirements
- **Storage:** saved meetings are kept in the browser's local storage only, kept separately from roles and currency so that unreadable meeting data can never wipe roles or currency (AC-39).
- **Accessibility:** A11Y-1 to A11Y-9 from spec 001 apply to the new section. See section 6 for the specific additions.
- **Visual design:** UX-1 to UX-6 from spec 001 apply to the new section.
- **Calculation rules:** unchanged from spec 001.
- **Dependencies:** no new dependencies.
- **Limits:** no maximum number of saved meetings and no maximum name length in this version.

## 6. Changes to spec 001
| Spec 001 item | Change | Why |
|---|---|---|
| Section 6, "Saving, naming or reloading individual meetings" | Removed from out of scope. Now in scope via US-9 to US-11. | This is the change request. |
| Section 7, resolved question "Saving meetings" | Superseded by this spec. | Meetings are no longer throwaway. |
| AC-24 | **Behaviour unchanged**, wording clarified: the *working* meeting is still cleared on reopen. Saved meetings persist (AC-37) and come back only when loaded. | Keep a clear line between the working meeting and saved ones. |
| AC-17 | Unchanged, but the currency can now also change by loading a saved meeting (AC-31). The changed currency persists as before. | Currency is saved with each meeting. |
| AC-15 | Unchanged. A saved currency is a display label only; loading never converts amounts. | Clarification. |
| AC-18 and the Privacy NFR | Extended by AC-38 to cover saved meetings. The notice that says where data is stored must also mention saved meetings. | New kind of stored data. |
| AC-19 | Extended by AC-39. A failure with saved meetings must not affect roles or currency. | New storage failure cases. |
| AC-20 | Extended by AC-40. | New section must work on a phone. |
| AC-25 | Unchanged for the working meeting. Deleting a role does not change saved meetings; their lines for that role are handled on load (AC-33). | Saved meetings refer to roles; they don't copy them. |
| A11Y-1 | Adds two labelled fields: meeting name and saved-meeting choice. | New form fields. |
| A11Y-2, A11Y-7 | Confirmations (replace, load over, delete) use real buttons, work with the keyboard alone, and return focus to a sensible place after closing. | New interactions. |
| A11Y-5 | Applies to the meeting name error (AC-28). | New validation. |
| A11Y-6 | Save, load and delete outcomes, the dropped-line notice (AC-33), storage errors (AC-39) and confirmations are announced to screen readers. | New messages. |
| UX-4 | Save meeting and Load are primary actions; Delete uses the destructive style. | Keep action hierarchy consistent. |
| UX-6 | No-regression rule covers the new section. | Clarification. |

## 7. Out of scope
- Renaming a saved meeting (save under the new name and delete the old one instead)
- Editing a saved meeting without loading it
- Export, import or sharing of saved meetings
- Cross-device sync or server storage
- Version history of saved meetings
- Restoring the last working meeting automatically on reopen (AC-24 still holds)

## 8. Open questions for review
These were assumed while drafting. Confirm or change them before approval.
- **Saving needs a valid meeting:** a meeting can be saved only with at least one line and a valid, non-zero duration (AC-29).
- **Name matching:** names are trimmed and compared ignoring case (AC-28, AC-30).
- **Loading over unsaved work:** the app asks before replacing a working meeting that has lines (AC-34).
- **Delete confirmation:** deleting a saved meeting asks for confirmation (AC-36).
- **Cost after loading:** loading clears any shown cost; the user presses Calculate, matching spec 001's Calculate model (AC-31).
- **List order and size:** sorted by name, A to Z, ignoring case; no limit on how many (AC-37, section 5).
