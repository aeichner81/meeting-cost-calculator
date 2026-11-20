import { meetingCost } from './meeting'
import {
  findMeetingByName,
  normaliseName,
  removeMeeting,
  resolveLines,
  sameName,
  sortByName,
  upsertMeeting,
} from './savedMeetings'
import type { SavedMeeting } from './savedMeetings'
import type { Role } from './types'

const roleA: Role = { id: 'a', name: 'Role A', annualSalary: 36400 }
const roleB: Role = { id: 'b', name: 'Role B', annualSalary: 72800 }

// The AC-6 meeting: 3 × Role A and 1 × Role B for 2 hours.
function weeklySync(name = 'Weekly sync'): SavedMeeting {
  return {
    name,
    lines: [
      { roleId: 'a', roleName: 'Role A', headcount: 3 },
      { roleId: 'b', roleName: 'Role B', headcount: 1 },
    ],
    duration: { hours: 2, minutes: 0 },
    recurrence: 'weekly',
    currency: 'GBP',
  }
}

function named(name: string): SavedMeeting {
  return { ...weeklySync(), name }
}

function names(meetings: SavedMeeting[]): string[] {
  return meetings.map((meeting) => meeting.name)
}

describe('normaliseName', () => {
  it('removes leading and trailing spaces (AC-28)', () => {
    expect(normaliseName('  Weekly sync  ')).toBe('Weekly sync')
  })

  it('keeps spaces inside the name (AC-28)', () => {
    expect(normaliseName(' Weekly  team sync ')).toBe('Weekly  team sync')
  })

  it('turns a spaces-only name into an empty one (AC-28)', () => {
    expect(normaliseName('   ')).toBe('')
  })
})

describe('sameName', () => {
  it('matches names ignoring case (AC-30)', () => {
    expect(sameName('Weekly sync', 'weekly SYNC')).toBe(true)
  })

  it('matches names ignoring surrounding spaces (AC-30)', () => {
    expect(sameName('Weekly sync', '  weekly sync ')).toBe(true)
  })

  it('does not match different names (AC-30)', () => {
    expect(sameName('Weekly sync', 'Weekly sync 2')).toBe(false)
    expect(sameName('Weekly sync', 'Weeklysync')).toBe(false)
  })
})

describe('findMeetingByName', () => {
  it('finds a saved meeting whose name matches ignoring case and spaces (AC-30)', () => {
    const meetings = [named('Monthly review'), named('Weekly sync')]
    expect(findMeetingByName(meetings, ' weekly sync ')?.name).toBe('Weekly sync')
  })

  it('returns undefined when no name matches (AC-30)', () => {
    expect(findMeetingByName([named('Weekly sync')], 'Daily stand-up')).toBeUndefined()
  })
})

describe('upsertMeeting', () => {
  it('adds a meeting with all its parts (AC-27)', () => {
    const meeting = weeklySync()
    expect(upsertMeeting([], meeting)).toEqual([meeting])
  })

  it('saves the name without leading and trailing spaces (AC-28)', () => {
    const result = upsertMeeting([], named('  Weekly sync  '))
    expect(names(result)).toEqual(['Weekly sync'])
  })

  it('replaces a meeting whose name matches ignoring case and spaces (AC-30)', () => {
    const existing = weeklySync('Weekly sync')
    const replacement: SavedMeeting = { ...weeklySync(' weekly sync '), recurrence: 'monthly' }

    const result = upsertMeeting([existing, named('Monthly review')], replacement)

    expect(result).toHaveLength(2)
    const replaced = findMeetingByName(result, 'Weekly sync')
    expect(replaced?.name).toBe('weekly sync')
    expect(replaced?.recurrence).toBe('monthly')
  })

  it('keeps the list sorted by name (AC-37)', () => {
    const result = upsertMeeting([named('Alpha'), named('Charlie')], named('bravo'))
    expect(names(result)).toEqual(['Alpha', 'bravo', 'Charlie'])
  })

  it('does not change the list it was given', () => {
    const meetings = [named('Weekly sync')]
    upsertMeeting(meetings, named('Alpha'))
    expect(names(meetings)).toEqual(['Weekly sync'])
  })
})

describe('removeMeeting', () => {
  it('removes the meeting with the given name (AC-36)', () => {
    const meetings = [named('Monthly review'), named('Weekly sync')]
    expect(names(removeMeeting(meetings, 'Weekly sync'))).toEqual(['Monthly review'])
  })

  it('matches the name ignoring case and spaces (AC-36)', () => {
    expect(removeMeeting([named('Weekly sync')], ' WEEKLY SYNC ')).toEqual([])
  })

  it('leaves the list unchanged when no name matches (AC-36)', () => {
    const meetings = [named('Weekly sync')]
    expect(removeMeeting(meetings, 'Daily stand-up')).toEqual(meetings)
  })

  it('does not change the list it was given', () => {
    const meetings = [named('Weekly sync')]
    removeMeeting(meetings, 'Weekly sync')
    expect(names(meetings)).toEqual(['Weekly sync'])
  })
})

describe('sortByName', () => {
  it('sorts A to Z ignoring case (AC-37)', () => {
    const meetings = [named('weekly sync'), named('Daily stand-up'), named('alpha'), named('Monthly review')]
    expect(names(sortByName(meetings))).toEqual(['alpha', 'Daily stand-up', 'Monthly review', 'weekly sync'])
  })

  it('does not change the list it was given', () => {
    const meetings = [named('b'), named('a')]
    sortByName(meetings)
    expect(names(meetings)).toEqual(['b', 'a'])
  })
})

describe('resolveLines', () => {
  it('turns saved lines into meeting lines for the current roles', () => {
    expect(resolveLines(weeklySync(), [roleA, roleB])).toEqual({
      lines: [
        { roleId: 'a', headcount: 3 },
        { roleId: 'b', headcount: 1 },
      ],
      droppedRoleNames: [],
    })
  })

  it('uses current salaries: the AC-6 meeting costs £320.00 after A becomes £72,800 (AC-32)', () => {
    const raisedA: Role = { ...roleA, annualSalary: 72800 }
    const meeting = weeklySync()

    const { lines } = resolveLines(meeting, [raisedA, roleB])
    const cost = meetingCost(lines, [raisedA, roleB], meeting.duration)

    expect(cost.total).toBeCloseTo(320, 10)
  })

  it('leaves out lines for deleted roles and names them (AC-33)', () => {
    expect(resolveLines(weeklySync(), [roleB])).toEqual({
      lines: [{ roleId: 'b', headcount: 1 }],
      droppedRoleNames: ['Role A'],
    })
  })

  it('returns no lines when every role has been deleted (AC-33)', () => {
    expect(resolveLines(weeklySync(), [])).toEqual({
      lines: [],
      droppedRoleNames: ['Role A', 'Role B'],
    })
  })

  it('does not change the saved meeting (AC-33)', () => {
    const meeting = weeklySync()
    resolveLines(meeting, [])
    expect(meeting).toEqual(weeklySync())
  })
})
