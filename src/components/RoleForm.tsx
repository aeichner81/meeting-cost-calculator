import { useState } from 'react'
import type { FormEvent } from 'react'
import { validateRoleName, validateSalary } from '../domain/validation'
import styles from './RoleForm.module.css'

interface RoleFormProps {
  onAdd: (name: string, annualSalary: number) => void
}

interface FieldErrors {
  name?: string
  salary?: string
}

export function RoleForm({ onAdd }: RoleFormProps) {
  const [name, setName] = useState('')
  const [salary, setSalary] = useState('')
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
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="role-name">Role name</label>
        <input
          id="role-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'role-name-error' : undefined}
        />
        {errors.name && (
          <p id="role-name-error" className={styles.error}>
            {errors.name}
          </p>
        )}
      </div>
      <div className={styles.field}>
        <label htmlFor="role-salary">Annual salary</label>
        <input
          id="role-salary"
          type="text"
          inputMode="decimal"
          value={salary}
          onChange={(event) => setSalary(event.target.value)}
          aria-invalid={errors.salary ? true : undefined}
          aria-describedby={errors.salary ? 'role-salary-error' : undefined}
        />
        {errors.salary && (
          <p id="role-salary-error" className={styles.error}>
            {errors.salary}
          </p>
        )}
      </div>
      <button type="submit">Add role</button>
    </form>
  )
}
