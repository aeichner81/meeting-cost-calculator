import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { formatMoney } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import { meetingCost } from '../domain/meeting'
import { recurringCost } from '../domain/recurrence'
import type { Recurrence } from '../domain/recurrence'
import type { Duration, MeetingLine, Role } from '../domain/types'
import { validateDuration } from '../domain/validation'
import type { MeetingErrors } from '../domain/validation'
import { CostBreakdown } from './CostBreakdown'
import { RecurrenceSelect } from './RecurrenceSelect'
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
  const [recurrence, setRecurrence] = useState<Recurrence>('once')

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

  // Only present when a valid duration was calculated and the meeting has attendees.
  const cost = duration && lines.length > 0 ? meetingCost(lines, roles, duration) : undefined

  // Monthly and yearly figures exist only for recurring meetings (AC-13).
  const recurring = cost ? recurringCost(cost.total, recurrence) : null

  function statusMessages(): string[] {
    if (hasErrors) {
      return [INVALID_MESSAGE]
    }
    if (cost) {
      const messages = [`Total cost: ${formatMoney(cost.total, currency)}`]
      if (recurring) {
        messages.push(`Monthly cost: ${formatMoney(recurring.monthly, currency)}`)
        messages.push(`Yearly cost: ${formatMoney(recurring.yearly, currency)}`)
      }
      return messages
    }
    return duration ? [NO_LINES_MESSAGE] : []
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
        <RecurrenceSelect value={recurrence} onChange={setRecurrence} />
        <button type="submit">Calculate</button>
      </form>
      <div role="status" aria-live="polite">
        {statusMessages().map((message) => (
          <p key={message}>{message}</p>
        ))}
      </div>
      {!hasErrors && cost && <CostBreakdown cost={cost} currency={currency} />}
    </>
  )
}
