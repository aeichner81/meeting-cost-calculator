import type { Duration } from './types'

export type SalaryResult = { ok: true; value: number } | { ok: false; error: string }

export type MeetingField = 'headcount' | 'hours' | 'minutes' | 'duration'

export type MeetingErrors = Partial<Record<MeetingField, string>>

export interface MeetingInput {
  headcount: string
  hours: string
  minutes: string
}

export interface ValidMeeting {
  headcount: number
  duration: Duration
}

export type MeetingResult =
  | { ok: true; value: ValidMeeting }
  | { ok: false; errors: MeetingErrors }

const MAX_MINUTES = 59

const SALARY_ERROR = 'Enter an annual salary greater than 0.'
const HEADCOUNT_ERROR = 'Enter a whole number of attendees, 1 or more.'
const HOURS_ERROR = 'Enter hours as a whole number, 0 or more.'
const MINUTES_ERROR = 'Enter minutes as a whole number from 0 to 59.'
const DURATION_ERROR = 'Enter a duration longer than 0 minutes.'

const DECIMAL_PATTERN = /^\d+(\.\d+)?$/
const WHOLE_NUMBER_PATTERN = /^\d+$/

// Strict on purpose: Number() would accept "1e3", "0x10" and "Infinity".
function parseDecimal(text: string): number | null {
  const trimmed = text.trim()
  if (!DECIMAL_PATTERN.test(trimmed)) {
    return null
  }
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

function parseWholeNumber(text: string): number | null {
  const trimmed = text.trim()
  if (!WHOLE_NUMBER_PATTERN.test(trimmed)) {
    return null
  }
  const value = Number(trimmed)
  return Number.isSafeInteger(value) ? value : null
}

// Any positive salary is accepted, with no upper limit (AC-4).
export function validateSalary(text: string): SalaryResult {
  const salary = parseDecimal(text)
  if (salary === null || salary <= 0) {
    return { ok: false, error: SALARY_ERROR }
  }
  return { ok: true, value: salary }
}

// An empty hours or minutes field counts as 0 (AC-9).
function parseOptionalWholeNumber(text: string): number | null {
  return text.trim() === '' ? 0 : parseWholeNumber(text)
}

export function validateMeetingInput(input: MeetingInput): MeetingResult {
  const errors: MeetingErrors = {}

  const headcount = parseWholeNumber(input.headcount)
  if (headcount === null || headcount < 1) {
    errors.headcount = HEADCOUNT_ERROR
  }

  const hours = parseOptionalWholeNumber(input.hours)
  if (hours === null) {
    errors.hours = HOURS_ERROR
  }

  const minutes = parseOptionalWholeNumber(input.minutes)
  if (minutes === null || minutes > MAX_MINUTES) {
    errors.minutes = MINUTES_ERROR
  }

  // A zero duration only makes sense to report once hours and minutes are valid.
  if (hours !== null && minutes !== null && minutes <= MAX_MINUTES && hours === 0 && minutes === 0) {
    errors.duration = DURATION_ERROR
  }

  if (Object.keys(errors).length > 0 || headcount === null || hours === null || minutes === null) {
    return { ok: false, errors }
  }
  return { ok: true, value: { headcount, duration: { hours, minutes } } }
}
