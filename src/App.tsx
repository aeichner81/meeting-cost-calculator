import { useRef, useState } from 'react'
import { addMeetingLine } from './domain/meeting'
import { removeMeeting, upsertMeeting } from './domain/savedMeetings'
import type { SavedMeeting } from './domain/savedMeetings'
import type { CurrencyCode } from './domain/currency'
import type { MeetingLine } from './domain/types'
import { CurrencySelect } from './components/CurrencySelect'
import { DurationCalculator } from './components/DurationCalculator'
import type { MeetingSetup } from './components/DurationCalculator'
import { MeetingBuilder } from './components/MeetingBuilder'
import { RoleForm } from './components/RoleForm'
import { RolesPanel } from './components/RolesPanel'
import { SavedMeetings } from './components/SavedMeetings'
import type { LoadedMeeting } from './components/SavedMeetings'
import { usePersistedState } from './hooks/usePersistedState'
import { useSavedMeetings } from './hooks/useSavedMeetings'
import styles from './App.module.css'

const EMPTY_SETUP: MeetingSetup = { hours: '', minutes: '', recurrence: 'once' }

export function App() {
  const { data, setData, storageFailed } = usePersistedState()
  // Kept under their own storage key, apart from roles and currency (spec 002, AC-39).
  const { meetings, setMeetings } = useSavedMeetings()
  // The working meeting stays in memory only and is cleared on reload (AC-24); saved
  // meetings are separate copies (spec 002).
  const [lines, setLines] = useState<MeetingLine[]>([])
  // Tells the user when deleting a role removed its line from the meeting (AC-25).
  const [meetingNotice, setMeetingNotice] = useState('')
  // The duration and recurrence as the calculator last reported them, so Save can read them
  // (spec 002, AC-27). A ref, because nothing on screen depends on it and Save reads it in its
  // click handler. Starts at the calculator's defaults; in memory only (AC-24).
  const setupRef = useRef<MeetingSetup>(EMPTY_SETUP)
  // The calculator's starting values. Loading a meeting sets them and changes the key, so the
  // calculator remounts with the loaded duration and recurrence and no shown cost (AC-31).
  const [initialSetup, setInitialSetup] = useState<MeetingSetup>(EMPTY_SETUP)
  const [calculatorKey, setCalculatorKey] = useState(0)

  function addRole(name: string, annualSalary: number) {
    const role = { id: crypto.randomUUID(), name, annualSalary }
    setData((previous) => ({ ...previous, roles: [...previous.roles, role] }))
  }

  function editRole(id: string, name: string, annualSalary: number) {
    setData((previous) => ({
      ...previous,
      roles: previous.roles.map((role) => (role.id === id ? { ...role, name, annualSalary } : role)),
    }))
  }

  function deleteRole(id: string) {
    const role = data.roles.find((candidate) => candidate.id === id)
    const hadLine = lines.some((line) => line.roleId === id)
    setMeetingNotice(role && hadLine ? `${role.name} was removed from the meeting.` : '')
    setData((previous) => ({ ...previous, roles: previous.roles.filter((role) => role.id !== id) }))
    setLines((previous) => previous.filter((line) => line.roleId !== id))
    resetSetupIfNoRolesRemain(id)
  }

  function keepSetup(setup: MeetingSetup) {
    setupRef.current = setup
  }

  // With no roles the calculator is removed, and it comes back with empty fields. Keep the
  // setup in step with that so Save never reads values the user can no longer see.
  function resetSetupIfNoRolesRemain(deletedId: string) {
    const remaining = data.roles.filter((role) => role.id !== deletedId)
    if (remaining.length === 0) {
      keepSetup(EMPTY_SETUP)
      setInitialSetup(EMPTY_SETUP)
    }
  }

  function readSetup(): MeetingSetup {
    return setupRef.current
  }

  // The component has already asked before replacing a matching name (AC-30).
  function saveMeeting(meeting: SavedMeeting) {
    setMeetings((previous) => upsertMeeting(previous, meeting))
  }

  // The component has already asked before replacing a meeting with lines (AC-34) and left out
  // lines for deleted roles (AC-33).
  function loadMeeting(loaded: LoadedMeeting) {
    const setup: MeetingSetup = {
      hours: String(loaded.duration.hours),
      minutes: String(loaded.duration.minutes),
      recurrence: loaded.recurrence,
    }
    setMeetingNotice('')
    setLines(loaded.lines)
    keepSetup(setup)
    setInitialSetup(setup)
    setCalculatorKey((previous) => previous + 1)
    changeCurrency(loaded.currency)
  }

  // The component has already asked for confirmation; the working meeting is left alone (AC-36).
  function deleteMeeting(name: string) {
    setMeetings((previous) => removeMeeting(previous, name))
  }

  function changeCurrency(currency: CurrencyCode) {
    setData((previous) => ({ ...previous, currency }))
  }

  function addLine(roleId: string, headcount: number) {
    setMeetingNotice('')
    setLines((previous) => addMeetingLine(previous, roleId, headcount))
  }

  return (
    <main className={styles.main}>
      <h1>Meeting Cost Calculator</h1>
      <p className={styles.privacy}>
        Roles, salaries and your currency are stored only in this browser and are never sent to a
        server. Meetings are not saved.
      </p>
      <div role="status" aria-label="Storage notice">
        {storageFailed && (
          <p className={styles.notice}>
            Your data could not be loaded or saved in this browser. The calculator still works, but
            roles will not be kept after you close it.
          </p>
        )}
      </div>
      <div className={styles.currency}>
        <CurrencySelect value={data.currency} onChange={changeCurrency} />
      </div>
      <section aria-labelledby="roles-heading" className={styles.section}>
        <h2 id="roles-heading" tabIndex={-1}>
          Roles
        </h2>
        <RoleForm onAdd={addRole} />
        <RolesPanel
          roles={data.roles}
          currency={data.currency}
          onEdit={editRole}
          onDelete={deleteRole}
        />
      </section>
      <section aria-labelledby="meeting-heading" className={styles.section}>
        <h2 id="meeting-heading">Meeting</h2>
        <div role="status" aria-label="Meeting notice">
          {meetingNotice && <p className={styles.notice}>{meetingNotice}</p>}
        </div>
        <MeetingBuilder roles={data.roles} lines={lines} onAddLine={addLine} />
        {data.roles.length > 0 && (
          <DurationCalculator
            key={calculatorKey}
            initialHours={initialSetup.hours}
            initialMinutes={initialSetup.minutes}
            initialRecurrence={initialSetup.recurrence}
            roles={data.roles}
            lines={lines}
            currency={data.currency}
            onSetupChange={keepSetup}
          />
        )}
      </section>
      <section aria-labelledby="saved-heading" className={styles.section}>
        <h2 id="saved-heading">Saved meetings</h2>
        <SavedMeetings
          meetings={meetings}
          roles={data.roles}
          lines={lines}
          currency={data.currency}
          readSetup={readSetup}
          onSave={saveMeeting}
          onLoad={loadMeeting}
          onDelete={deleteMeeting}
        />
      </section>
    </main>
  )
}
