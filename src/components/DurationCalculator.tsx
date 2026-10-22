import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { formatMoney } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import { meetingCost } from '../domain/meeting'
import type { Duration, MeetingLine, Role } from '../domain/types'
import { validateDuration } from '../domain/validation'
import type { MeetingErrors } from '../domain/validation'
import styles from './MeetingBuilder.module.css'

interface DurationCalculatorProps {
  roles: Role[]
  lines: MeetingLine[]
  currency: CurrencyCode
}

const NO_LINES_MESSAGE = 'Add attendees to the meeting first.'
const INVALID_MESSAGE = 'No cost calculated. Check the duration fields.'

// Space-separated ids for aria-describedby, or undefined when there is nothing to describe.
function joinIds(...ids: Array<string | undefined | false | ''>): string | undefined {
  const present = ids.filter(Boolean)
  return present.length > 0 ? present.join(' ') : undefined
}

export function DurationCalculator({ roles, lines, currency }: DurationCalculatorProps) {
  const idPrefix = useId()
  const hoursId = `${idPrefix}-hours`
  const minutesId = `${idPrefix}-minutes`
  const hoursErrorId = `${hoursId}-error`
  const durationErrorId = `${hoursId}-duration-error`
  const minutesErrorId = `${minutesId}-error`
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [errors, setErrors] = useState<MeetingErrors>({})
  // The duration that was last calculated; the total is derived from it so it follows later changes.
  const [duration, setDuration] = useState<Duration | undefined>()

  const hasErrors = Object.keys(errors).length > 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const result = validateDuration({ hours, minutes })
    if (!result.ok) {
      setErrors(result.errors)
      setDuration(undefined)
      return
    }
    setErrors({})
    setDuration(result.value)
  }

  function statusMessage(): string {
    if (hasErrors) {
      return INVALID_MESSAGE
    }
    if (duration && lines.length === 0) {
      return NO_LINES_MESSAGE
    }
    if (duration) {
      return `Total cost: ${formatMoney(meetingCost(lines, roles, duration).total, currency)}`
    }
    return ''
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit} aria-label="Meeting duration" noValidate>
        <div className={styles.field}>
          <label htmlFor={hoursId}>Hours</label>
          <input
            id={hoursId}
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            aria-invalid={errors.hours || errors.duration ? true : undefined}
            aria-describedby={joinIds(errors.hours && hoursErrorId, errors.duration && durationErrorId)}
          />
          {errors.hours && (
            <p id={hoursErrorId} className={styles.error}>
              {errors.hours}
            </p>
          )}
          {errors.duration && (
            <p id={durationErrorId} className={styles.error}>
              {errors.duration}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor={minutesId}>Minutes</label>
          <input
            id={minutesId}
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            aria-invalid={errors.minutes ? true : undefined}
            aria-describedby={errors.minutes ? minutesErrorId : undefined}
          />
          {errors.minutes && (
            <p id={minutesErrorId} className={styles.error}>
              {errors.minutes}
            </p>
          )}
        </div>
        <button type="submit">Calculate</button>
      </form>
      <p role="status" aria-live="polite">
        {statusMessage()}
      </p>
    </>
  )
}
