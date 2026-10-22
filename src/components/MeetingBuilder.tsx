import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { validateHeadcount } from '../domain/validation'
import type { MeetingLine, Role } from '../domain/types'
import styles from './MeetingBuilder.module.css'

interface MeetingBuilderProps {
  roles: Role[]
  lines: MeetingLine[]
  onAddLine: (roleId: string, headcount: number) => void
}

export function MeetingBuilder({ roles, lines, onAddLine }: MeetingBuilderProps) {
  const idPrefix = useId()
  const roleId = `${idPrefix}-role`
  const headcountId = `${idPrefix}-headcount`
  const [chosenRoleId, setChosenRoleId] = useState('')
  const [headcount, setHeadcount] = useState('1')
  const [error, setError] = useState<string | undefined>()

  if (roles.length === 0) {
    return (
      <p>
        Add a role first. <a href="#roles-heading">Add a role</a> to start building a meeting.
      </p>
    )
  }

  // The chosen role may have been deleted since it was picked.
  const selectedRoleId = roles.some((role) => role.id === chosenRoleId) ? chosenRoleId : roles[0].id

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateHeadcount(headcount)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onAddLine(selectedRoleId, result.value)
    setHeadcount('1')
    setError(undefined)
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} aria-label="Add to meeting" noValidate>
        <div className={styles.field}>
          <label htmlFor={roleId}>Role</label>
          <select
            id={roleId}
            value={selectedRoleId}
            onChange={(event) => setChosenRoleId(event.target.value)}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor={headcountId}>Headcount</label>
          <input
            id={headcountId}
            type="text"
            inputMode="numeric"
            value={headcount}
            onChange={(event) => setHeadcount(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${headcountId}-error` : undefined}
          />
          {error && (
            <p id={`${headcountId}-error`} className={styles.error}>
              {error}
            </p>
          )}
        </div>
        <button type="submit">Add to meeting</button>
      </form>
      <MeetingLines roles={roles} lines={lines} />
    </>
  )
}

function MeetingLines({ roles, lines }: Pick<MeetingBuilderProps, 'roles' | 'lines'>) {
  if (lines.length === 0) {
    return null
  }

  return (
    <ul aria-label="Meeting lines">
      {lines.map((line) => (
        <li key={line.roleId}>
          <span>{roles.find((role) => role.id === line.roleId)?.name}</span>{' '}
          <span>{line.headcount}</span>
        </li>
      ))}
    </ul>
  )
}
