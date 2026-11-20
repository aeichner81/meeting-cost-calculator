import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { CurrencyCode } from '../domain/currency'
import { findMeetingByName, normaliseName } from '../domain/savedMeetings'
import type { SavedLine, SavedMeeting } from '../domain/savedMeetings'
import type { MeetingLine, Role } from '../domain/types'
import { validateDuration } from '../domain/validation'
import { NO_LINES_MESSAGE } from './DurationCalculator'
import type { MeetingSetup } from './DurationCalculator'
// Shares the form grid and error style until the section gets its own stylesheet (task 29).
import styles from './MeetingBuilder.module.css'

interface SavedMeetingsProps {
  meetings: SavedMeeting[]
  roles: Role[]
  lines: MeetingLine[]
  currency: CurrencyCode
  // Read when Save is pressed, so the latest duration and recurrence are saved.
  readSetup: () => MeetingSetup
  onSave: (meeting: SavedMeeting) => void
}

type MeetingCheck = { ok: true; meeting: SavedMeeting } | { ok: false; messages: string[] }

// A replace waiting for the user's answer (AC-30).
interface PendingReplace {
  meeting: SavedMeeting
  existingName: string
}

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

export function SavedMeetings(props: SavedMeetingsProps) {
  const { meetings, onSave } = props
  const idPrefix = useId()
  const nameId = `${idPrefix}-name`
  const nameErrorId = `${nameId}-error`
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [pending, setPending] = useState<PendingReplace | undefined>()
  const saveButton = useRef<HTMLButtonElement>(null)
  const replaceButton = useRef<HTMLButtonElement>(null)

  // Focus moves into the confirmation when it opens (A11Y-2).
  useEffect(() => {
    if (pending) {
      replaceButton.current?.focus()
    }
  }, [pending])

  function save(meeting: SavedMeeting) {
    onSave(meeting)
    setMessages([`Saved meeting "${meeting.name}".`])
    setName('')
  }

  function handleSubmit(event: FormEvent) {
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
      setPending({ meeting: check.meeting, existingName: existing.name })
      return
    }
    save(check.meeting)
  }

  function closeConfirmation() {
    setPending(undefined)
    saveButton.current?.focus()
  }

  function confirmReplace() {
    if (pending) {
      save(pending.meeting)
    }
    closeConfirmation()
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} aria-label="Save meeting" noValidate>
        <div className={styles.field}>
          <label htmlFor={nameId}>Meeting name</label>
          <input
            id={nameId}
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
      {/* Stays mounted so outcomes, problems and the replace question are announced (A11Y-6). */}
      <div role="status" aria-live="polite" aria-label="Saved meetings notice">
        {pending ? (
          <p>A saved meeting named "{pending.existingName}" already exists. Replace it?</p>
        ) : (
          messages.map((message) => <p key={message}>{message}</p>)
        )}
      </div>
      {pending && (
        <div>
          <button type="button" ref={replaceButton} onClick={confirmReplace}>
            Replace
          </button>
          <button type="button" onClick={closeConfirmation}>
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
