import type { Duration } from './types'

export type RoleNameResult = { ok: true; value: string } | { ok: false; error: string }

export type SalaryResult = { ok: true; value: number } | { ok: false; error: string }

export type HeadcountResult = { ok: true; value: number } | { ok: false; error: string }

export type MeetingField = 'headcount' | 'hours' | 'minutes' | 'duration'

export type MeetingErrors = Partial<Record<MeetingField, string>>

export interface DurationInput {
  hours: string
  minutes: string
}

export interface MeetingInput extends DurationInput {
  headcount: string
}

export type DurationResult =
  | { ok: true; value: Duration }
  | { ok: false; errors: MeetingErrors }

export interface ValidMeeting {
  headcount: number
  duration: Duration
}

export type MeetingResult =
  | { ok: true; value: ValidMeeting }
  | { ok: false; errors: MeetingErrors }

const MAX_MINUTES = 59

const ROLE_NAME_ERROR = 'Enter a role name.'
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

// Any name with at least one non-space character is accepted (AC-4).
export function validateRoleName(text: string): RoleNameResult {
  const name = text.trim()
  if (name === '') {
    return { ok: false, error: ROLE_NAME_ERROR }
  }
  return { ok: true, value: name }
}

// Any positive salary is accepted, with no upper limit (AC-4).
export function validateSalary(text: string): SalaryResult {
  const salary = parseDecimal(text)
  if (salary === null || salary <= 0) {
    return { ok: false, error: SALARY_ERROR }
  }
  return { ok: true, value: salary }
}

// Any whole number of at least 1, with no upper limit (AC-5, AC-9).
export function validateHeadcount(text: string): HeadcountResult {
  const headcount = parseWholeNumber(text)
  if (headcount === null || headcount < 1) {
    return { ok: false, error: HEADCOUNT_ERROR }
  }
  return { ok: true, value: headcount }
}

// An empty hours or minutes field counts as 0 (AC-9).
function parseOptionalWholeNumber(text: string): number | null {
  return text.trim() === '' ? 0 : parseWholeNumber(text)
}

export function validateDuration(input: DurationInput): DurationResult {
  const errors: MeetingErrors = {}

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

  if (hours === null || minutes === null || Object.keys(errors).length > 0) {
    return { ok: false, errors }
  }
  return { ok: true, value: { hours, minutes } }
}

export function validateMeetingInput(input: MeetingInput): MeetingResult {
  const headcountResult = validateHeadcount(input.headcount)
  const durationResult = validateDuration(input)

  const errors: MeetingErrors = {}
  if (!headcountResult.ok) {
    errors.headcount = headcountResult.error
  }
  if (!durationResult.ok) {
    Object.assign(errors, durationResult.errors)
  }

  if (!headcountResult.ok || !durationResult.ok) {
    return { ok: false, errors }
  }
  return { ok: true, value: { headcount: headcountResult.value, duration: durationResult.value } }
}
