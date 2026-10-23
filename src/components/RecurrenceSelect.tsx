import { useId } from 'react'
import type { Recurrence } from '../domain/recurrence'
import styles from './MeetingBuilder.module.css'

interface RecurrenceSelectProps {
  value: Recurrence
  onChange: (recurrence: Recurrence) => void
}

const OPTIONS: Array<{ value: Recurrence; label: string }> = [
  { value: 'once', label: 'Once' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
]

export function RecurrenceSelect({ value, onChange }: RecurrenceSelectProps) {
  const selectId = useId()

  return (
    <div className={styles.field}>
      <label htmlFor={selectId}>Recurrence</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as Recurrence)}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
