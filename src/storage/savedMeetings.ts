import { CURRENCIES } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import type { Recurrence } from '../domain/recurrence'
import { sortByName } from '../domain/savedMeetings'
import type { SavedLine, SavedMeeting } from '../domain/savedMeetings'
import type { Duration } from '../domain/types'

// Kept apart from roles and currency (`mcc:v1`), so unreadable or unsaveable
// meeting data can never wipe them (AC-39).
export const SAVED_MEETINGS_KEY = 'mcc:meetings:v1'

export type LoadMeetingsResult = { ok: boolean; meetings: SavedMeeting[] }

export type SaveMeetingsResult = { ok: true } | { ok: false }

const RECURRENCES: readonly Recurrence[] = ['once', 'daily', 'weekly', 'fortnightly', 'monthly']

const MAX_MINUTES = 59

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWholeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function isSavedLine(value: unknown): value is SavedLine {
  return (
    isRecord(value) &&
    typeof value.roleId === 'string' &&
    typeof value.roleName === 'string' &&
    isWholeNumber(value.headcount) &&
    value.headcount >= 1
  )
}

function isDuration(value: unknown): value is Duration {
  return (
    isRecord(value) &&
    isWholeNumber(value.hours) &&
    isWholeNumber(value.minutes) &&
    value.minutes <= MAX_MINUTES
  )
}

function isRecurrence(value: unknown): value is Recurrence {
  return RECURRENCES.some((recurrence) => recurrence === value)
}

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return CURRENCIES.some((currency) => currency.code === value)
}

function isSavedMeeting(value: unknown): value is SavedMeeting {
  return (
    isRecord(value) &&
    isNonEmptyText(value.name) &&
    Array.isArray(value.lines) &&
    value.lines.every(isSavedLine) &&
    isDuration(value.duration) &&
    isRecurrence(value.recurrence) &&
    isCurrencyCode(value.currency)
  )
}

function isSavedMeetingList(value: unknown): value is SavedMeeting[] {
  return Array.isArray(value) && value.every(isSavedMeeting)
}

// Never throws. Nothing stored yet is a normal first run, not a failure.
// The list comes back sorted by name, A to Z, ignoring case (AC-37).
export function loadSavedMeetings(): LoadMeetingsResult {
  try {
    const text = localStorage.getItem(SAVED_MEETINGS_KEY)
    if (text === null) {
      return { ok: true, meetings: [] }
    }
    const parsed: unknown = JSON.parse(text)
    if (!isSavedMeetingList(parsed)) {
      return { ok: false, meetings: [] }
    }
    return { ok: true, meetings: sortByName(parsed) }
  } catch {
    return { ok: false, meetings: [] }
  }
}

// Never throws. Meetings go to this browser's local storage only (AC-38).
export function saveSavedMeetings(meetings: SavedMeeting[]): SaveMeetingsResult {
  try {
    localStorage.setItem(SAVED_MEETINGS_KEY, JSON.stringify(meetings))
    return { ok: true }
  } catch {
    return { ok: false }
  }
}
