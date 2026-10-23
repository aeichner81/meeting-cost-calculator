import { useState } from 'react'
import { addMeetingLine } from './domain/meeting'
import type { CurrencyCode } from './domain/currency'
import type { MeetingLine } from './domain/types'
import { CurrencySelect } from './components/CurrencySelect'
import { DurationCalculator } from './components/DurationCalculator'
import { MeetingBuilder } from './components/MeetingBuilder'
import { RoleForm } from './components/RoleForm'
import { RolesPanel } from './components/RolesPanel'
import { usePersistedState } from './hooks/usePersistedState'
import styles from './App.module.css'

export function App() {
  const { data, setData } = usePersistedState()
  // Meetings are not saved in v1, so this stays in memory only (AC-24).
  const [lines, setLines] = useState<MeetingLine[]>([])

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
    setData((previous) => ({ ...previous, roles: previous.roles.filter((role) => role.id !== id) }))
    setLines((previous) => previous.filter((line) => line.roleId !== id))
  }

  function changeCurrency(currency: CurrencyCode) {
    setData((previous) => ({ ...previous, currency }))
  }

  function addLine(roleId: string, headcount: number) {
    setLines((previous) => addMeetingLine(previous, roleId, headcount))
  }

  return (
    <main className={styles.main}>
      <h1>Meeting Cost Calculator</h1>
      <CurrencySelect value={data.currency} onChange={changeCurrency} />
      <section aria-labelledby="roles-heading">
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
      <section aria-labelledby="meeting-heading">
        <h2 id="meeting-heading">Meeting</h2>
        <MeetingBuilder roles={data.roles} lines={lines} onAddLine={addLine} />
        {data.roles.length > 0 && (
          <DurationCalculator roles={data.roles} lines={lines} currency={data.currency} />
        )}
      </section>
    </main>
  )
}
