import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, RefObject } from 'react'
import type { CurrencyCode } from '../domain/currency'
import type { Recurrence } from '../domain/recurrence'
import { findMeetingByName, normaliseName, resolveLines } from '../domain/savedMeetings'
import type { SavedLine, SavedMeeting } from '../domain/savedMeetings'
import type { Duration, MeetingLine, Role } from '../domain/types'
import { validateDuration } from '../domain/validation'
import { NO_LINES_MESSAGE } from './DurationCalculator'
import type { MeetingSetup } from './DurationCalculator'
import styles from './SavedMeetings.module.css'

// What the working meeting becomes when a saved meeting is loaded (AC-31). Lines for deleted
// roles are already left out (AC-33).
export interface LoadedMeeting {
  lines: MeetingLine[]
  duration: Duration
  recurrence: Recurrence
  currency: CurrencyCode
}

interface SavedMeetingsProps {
  meetings: SavedMeeting[]
  roles: Role[]
  lines: MeetingLine[]
  currency: CurrencyCode
  // Read when Save is pressed, so the latest duration and recurrence are saved.
  readSetup: () => MeetingSetup
  onSave: (meeting: SavedMeeting) => void
  onLoad: (meeting: LoadedMeeting) => void
  onDelete: (name: string) => void
}

type MeetingCheck = { ok: true; meeting: SavedMeeting } | { ok: false; messages: string[] }

// A question waiting for the user's answer: replace a saved meeting with the same name (AC-30),
// replace a working meeting that has lines with a loaded one (AC-34), or delete a saved
// meeting (AC-36).
type Pending =
  | { kind: 'replace'; meeting: SavedMeeting; existingName: string }
  | { kind: 'load'; meeting: SavedMeeting }
  | { kind: 'delete'; meeting: SavedMeeting }

const NAME_ERROR = 'Enter a meeting name.'

function savedLines(lines: MeetingLine[], roles: Role[]): SavedLine[] {
  return lines.map((line) => {
    const role = roles.find((candidate) => candidate.id === line.roleId)
    return { roleId: line.roleId, roleName: role?.name ?? '', headcount: line.headcount }
  })
}

// The AC-26 message when there are no lines, otherwise the AC-9 duration messages (AC-29).
function checkMeeting(name: string, props: SavedMeetingsProps): MeetingCheck {
  if (props.lines.length === 0) {
    return { ok: false, messages: [NO_LINES_MESSAGE] }
  }
  const setup = props.readSetup()
  const duration = validateDuration(setup)
  if (!duration.ok) {
    return { ok: false, messages: Object.values(duration.errors) }
  }
  const meeting: SavedMeeting = {
    name,
    lines: savedLines(props.lines, props.roles),
    duration: duration.value,
    recurrence: setup.recurrence,
    currency: props.currency,
  }
  return { ok: true, meeting }
}

function droppedLineMessage(roleName: string): string {
  return `The ${roleName} line was left out because that role has been deleted.`
}

function question(pending: Pending): string {
  if (pending.kind === 'replace') {
    return `A saved meeting named "${pending.existingName}" already exists. Replace it?`
  }
  if (pending.kind === 'load') {
    return `Loading "${pending.meeting.name}" replaces the current meeting. Load it anyway?`
  }
  return `Delete the saved meeting "${pending.meeting.name}"?`
}

function confirmLabel(pending: Pending): string {
  if (pending.kind === 'replace') {
    return 'Replace'
  }
  if (pending.kind === 'load') {
    return 'Load and replace'
  }
  return 'Delete'
}

// The confirm button for a delete uses the destructive style (UX-4).
function confirmClassName(pending: Pending): string | undefined {
  return pending.kind === 'delete' ? 'destructive' : undefined
}

export function SavedMeetings(props: SavedMeetingsProps) {
  const { meetings, roles, lines, onSave, onLoad, onDelete } = props
  const idPrefix = useId()
  const nameId = `${idPrefix}-name`
  const nameErrorId = `${nameId}-error`
  const savedMeetingId = `${idPrefix}-saved-meeting`
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [pending, setPending] = useState<Pending | undefined>()
  const [chosenName, setChosenName] = useState('')
  const saveButton = useRef<HTMLButtonElement>(null)
  const loadButton = useRef<HTMLButtonElement>(null)
  const deleteButton = useRef<HTMLButtonElement>(null)
  const nameField = useRef<HTMLInputElement>(null)
  const confirmButton = useRef<HTMLButtonElement>(null)

  // Falls back to the first meeting until one is chosen, or if the chosen one is gone.
  const chosen = findMeetingByName(meetings, chosenName) ?? meetings[0]

  // Focus moves into the confirmation when it opens (A11Y-2).
  useEffect(() => {
    if (pending) {
      confirmButton.current?.focus()
    }
  }, [pending])

  function save(meeting: SavedMeeting) {
    onSave(meeting)
    setMessages([`Saved meeting "${meeting.name}".`])
    setName('')
  }

  // Saved salaries are never used: lines refer to the current roles (AC-32).
  function load(meeting: SavedMeeting) {
    const resolved = resolveLines(meeting, roles)
    onLoad({
      lines: resolved.lines,
      duration: meeting.duration,
      recurrence: meeting.recurrence,
      currency: meeting.currency,
    })
    setMessages([
      `Loaded meeting "${meeting.name}".`,
      ...resolved.droppedRoleNames.map(droppedLineMessage),
    ])
  }

  // Only the saved-meetings list changes; the working meeting is left alone (AC-36).
  function remove(meeting: SavedMeeting) {
    onDelete(meeting.name)
    setMessages([`Deleted meeting "${meeting.name}".`])
  }

  function handleSave(event: FormEvent) {
    event.preventDefault()
    const trimmed = normaliseName(name)
    setNameError(trimmed === '' ? NAME_ERROR : '')
    const check = checkMeeting(trimmed, props)
    setMessages(check.ok ? [] : check.messages)
    if (trimmed === '' || !check.ok) {
      return
    }

    const existing = findMeetingByName(meetings, trimmed)
    if (existing) {
      setPending({ kind: 'replace', meeting: check.meeting, existingName: existing.name })
      return
    }
    save(check.meeting)
  }

  // Asks first when the working meeting has lines that loading would replace (AC-34).
  function handleLoad(event: FormEvent) {
    event.preventDefault()
    if (!chosen) {
      return
    }
    if (lines.length > 0) {
      setMessages([])
      setPending({ kind: 'load', meeting: chosen })
      return
    }
    load(chosen)
  }

  // Always asks, whatever the working meeting holds (AC-36).
  function handleDelete() {
    if (!chosen) {
      return
    }
    setMessages([])
    setPending({ kind: 'delete', meeting: chosen })
  }

  // Focus goes back to the button that opened the question (A11Y-7).
  function returnFocusFor(closed: Pending): RefObject<HTMLButtonElement | null> {
    if (closed.kind === 'replace') {
      return saveButton
    }
    return closed.kind === 'load' ? loadButton : deleteButton
  }

  function closeConfirmation() {
    if (!pending) {
      return
    }
    setPending(undefined)
    returnFocusFor(pending).current?.focus()
  }

  // Deleting the last saved meeting removes the Delete button, so focus goes to the meeting
  // name field instead (A11Y-7).
  function confirmDelete(meeting: SavedMeeting) {
    const wasLast = meetings.length === 1
    remove(meeting)
    setPending(undefined)
    if (wasLast) {
      nameField.current?.focus()
    } else {
      deleteButton.current?.focus()
    }
  }

  function confirm() {
    if (pending?.kind === 'delete') {
      confirmDelete(pending.meeting)
      return
    }
    if (pending?.kind === 'replace') {
      save(pending.meeting)
    }
    if (pending?.kind === 'load') {
      load(pending.meeting)
    }
    closeConfirmation()
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSave} aria-label="Save meeting" noValidate>
        <div className={styles.field}>
          <label htmlFor={nameId}>Meeting name</label>
          <input
            id={nameId}
            ref={nameField}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? nameErrorId : undefined}
          />
          <div aria-live="polite">
            {nameError && (
              <p id={nameErrorId} className={styles.error}>
                {nameError}
              </p>
            )}
          </div>
        </div>
        <button type="submit" ref={saveButton}>
          Save meeting
        </button>
      </form>
      {chosen ? (
        <form className={styles.form} onSubmit={handleLoad} aria-label="Load meeting">
          <div className={styles.field}>
            <label htmlFor={savedMeetingId}>Saved meeting</label>
            <select
              id={savedMeetingId}
              value={chosen.name}
              onChange={(event) => setChosenName(event.target.value)}
            >
              {meetings.map((meeting) => (
                <option key={meeting.name} value={meeting.name}>
                  {meeting.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" ref={loadButton}>
            Load
          </button>
          <button type="button" className="destructive" ref={deleteButton} onClick={handleDelete}>
            Delete saved meeting
          </button>
        </form>
      ) : (
        // No load or delete action until something is saved (AC-35).
        <p className={styles.empty}>No saved meetings yet.</p>
      )}
      {/* Stays mounted so outcomes, problems and questions are announced (A11Y-6). */}
      <div
        role="status"
        aria-live="polite"
        aria-label="Saved meetings notice"
        className={styles.status}
      >
        {pending ? (
          <p>{question(pending)}</p>
        ) : (
          messages.map((message, index) => <p key={index}>{message}</p>)
        )}
      </div>
      {pending && (
        <div className={styles.confirmation}>
          <button
            type="button"
            className={confirmClassName(pending)}
            ref={confirmButton}
            onClick={confirm}
          >
            {confirmLabel(pending)}
          </button>
          <button type="button" onClick={closeConfirmation}>
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
