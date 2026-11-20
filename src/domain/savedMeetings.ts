import type { CurrencyCode } from './currency'
import type { Recurrence } from './recurrence'
import type { Duration, MeetingLine, Role } from './types'

// A saved line refers to a role by id. The name is kept only so a notice can
// name a role that has since been deleted (AC-33); salaries are never copied (AC-32).
export interface SavedLine {
  roleId: string
  roleName: string
  headcount: number
}

export interface SavedMeeting {
  name: string
  lines: SavedLine[]
  duration: Duration
  recurrence: Recurrence
  currency: CurrencyCode
}

export interface ResolvedLines {
  lines: MeetingLine[]
  droppedRoleNames: string[]
}

// Saved names never keep leading or trailing spaces (AC-28).
export function normaliseName(name: string): string {
  return name.trim()
}

function nameKey(name: string): string {
  return normaliseName(name).toLowerCase()
}

// Names match ignoring case and surrounding spaces (AC-30).
export function sameName(first: string, second: string): boolean {
  return nameKey(first) === nameKey(second)
}

export function findMeetingByName(
  meetings: SavedMeeting[],
  name: string,
): SavedMeeting | undefined {
  return meetings.find((meeting) => sameName(meeting.name, name))
}

// A to Z, ignoring case (AC-37). Returns a new array.
export function sortByName(meetings: SavedMeeting[]): SavedMeeting[] {
  return [...meetings].sort((first, second) => nameKey(first.name).localeCompare(nameKey(second.name)))
}

// Adds the meeting, or replaces one with a matching name (AC-30). The caller
// asks the user before replacing. The result is sorted by name (AC-37).
export function upsertMeeting(meetings: SavedMeeting[], meeting: SavedMeeting): SavedMeeting[] {
  const toSave = { ...meeting, name: normaliseName(meeting.name) }
  const others = meetings.filter((existing) => !sameName(existing.name, toSave.name))
  return sortByName([...others, toSave])
}

export function removeMeeting(meetings: SavedMeeting[], name: string): SavedMeeting[] {
  return meetings.filter((meeting) => !sameName(meeting.name, name))
}

// Keeps lines whose role still exists and names the ones left out (AC-33).
// Costs come from the current roles, so current salaries apply (AC-32).
export function resolveLines(meeting: SavedMeeting, roles: Role[]): ResolvedLines {
  const lines: MeetingLine[] = []
  const droppedRoleNames: string[] = []

  for (const line of meeting.lines) {
    const roleExists = roles.some((role) => role.id === line.roleId)
    if (roleExists) {
      lines.push({ roleId: line.roleId, headcount: line.headcount })
    } else {
      droppedRoleNames.push(line.roleName)
    }
  }

  return { lines, droppedRoleNames }
}
