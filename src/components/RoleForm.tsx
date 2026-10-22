import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { validateRoleName, validateSalary } from '../domain/validation'
import styles from './RoleForm.module.css'

interface RoleFormProps {
  onAdd: (name: string, annualSalary: number) => void
  // The props below turn the add form into an edit form (AC-3).
  initialName?: string
  initialSalary?: number
  submitLabel?: string
  onCancel?: () => void
  // Names the form as a landmark; needed when several forms share a page.
  label?: string
}

interface FieldErrors {
  name?: string
  salary?: string
}

export function RoleForm({
  onAdd,
  initialName = '',
  initialSalary,
  submitLabel = 'Add role',
  onCancel,
  label,
}: RoleFormProps) {
  const idPrefix = useId()
  const nameId = `${idPrefix}-name`
  const salaryId = `${idPrefix}-salary`
  const [name, setName] = useState(initialName)
  const [salary, setSalary] = useState(initialSalary === undefined ? '' : String(initialSalary))
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nameResult = validateRoleName(name)
    const salaryResult = validateSalary(salary)

    if (!nameResult.ok || !salaryResult.ok) {
      setErrors({
        name: nameResult.ok ? undefined : nameResult.error,
        salary: salaryResult.ok ? undefined : salaryResult.error,
      })
      return
    }

    onAdd(nameResult.value, salaryResult.value)
    setName('')
    setSalary('')
    setErrors({})
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label={label} noValidate>
      <div className={styles.field}>
        <label htmlFor={nameId}>Role name</label>
        <input
          id={nameId}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
        />
        {errors.name && (
          <p id={`${nameId}-error`} className={styles.error}>
            {errors.name}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor={salaryId}>Annual salary</label>
        <input
          id={salaryId}
          type="text"
          inputMode="decimal"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
          aria-invalid={errors.salary ? true : undefined}
          aria-describedby={errors.salary ? `${salaryId}-error` : undefined}
        />
        {errors.salary && (
          <p id={`${salaryId}-error`} className={styles.error}>
            {errors.salary}
          </p>
        )}
      </div>
      <button type="submit">{submitLabel}</button>
      {onCancel && (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  )
}
