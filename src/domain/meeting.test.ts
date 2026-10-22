import { addMeetingLine, durationInHours, meetingCost } from './meeting'
import type { MeetingLine, Role } from './types'

const roleA: Role = { id: 'a', name: 'Role A', annualSalary: 36400 }
const roleB: Role = { id: 'b', name: 'Role B', annualSalary: 72800 }

describe('durationInHours', () => {
  it('adds minutes as a fraction of an hour', () => {
    expect(durationInHours({ hours: 1, minutes: 30 })).toBe(1.5)
  })

  it('handles hours only and minutes only', () => {
    expect(durationInHours({ hours: 2, minutes: 0 })).toBe(2)
    expect(durationInHours({ hours: 0, minutes: 15 })).toBe(0.25)
  })
})

describe('addMeetingLine', () => {
  it('adds a new line for a role not yet in the meeting (AC-5)', () => {
    expect(addMeetingLine([], 'a', 3)).toEqual([{ roleId: 'a', headcount: 3 }])
  })

  it('merges a role already in the meeting into its existing line (AC-22)', () => {
    const lines: MeetingLine[] = [{ roleId: 'a', headcount: 3 }]
    expect(addMeetingLine(lines, 'a', 2)).toEqual([{ roleId: 'a', headcount: 5 }])
  })

  it('keeps other lines and their order when merging (AC-22)', () => {
    const lines: MeetingLine[] = [
      { roleId: 'a', headcount: 3 },
      { roleId: 'b', headcount: 1 },
    ]
    expect(addMeetingLine(lines, 'a', 2)).toEqual([
      { roleId: 'a', headcount: 5 },
      { roleId: 'b', headcount: 1 },
    ])
  })

  it('does not change the lines it was given', () => {
    const lines: MeetingLine[] = [{ roleId: 'a', headcount: 3 }]
    addMeetingLine(lines, 'a', 2)
    expect(lines).toEqual([{ roleId: 'a', headcount: 3 }])
  })
})

describe('meetingCost', () => {
  it('costs 2 x 20/h for 1h 30m as 60 (AC-21)', () => {
    const lines: MeetingLine[] = [{ roleId: 'a', headcount: 2 }]
    const result = meetingCost(lines, [roleA], { hours: 1, minutes: 30 })
    expect(result.total).toBe(60)
  })

  it('costs (3 x 20 + 1 x 40) x 2h as 200 (AC-6)', () => {
    const lines: MeetingLine[] = [
      { roleId: 'a', headcount: 3 },
      { roleId: 'b', headcount: 1 },
    ]
    const result = meetingCost(lines, [roleA, roleB], { hours: 2, minutes: 0 })
    expect(result.total).toBe(200)
  })

  it('breaks the cost down by role and the parts add up to the total (AC-7)', () => {
    const lines: MeetingLine[] = [
      { roleId: 'a', headcount: 3 },
      { roleId: 'b', headcount: 1 },
    ]
    const result = meetingCost(lines, [roleA, roleB], { hours: 2, minutes: 0 })
    expect(result.lines).toEqual([
      { roleId: 'a', roleName: 'Role A', headcount: 3, cost: 120 },
      { roleId: 'b', roleName: 'Role B', headcount: 1, cost: 80 },
    ])
    const sum = result.lines.reduce((acc, line) => acc + line.cost, 0)
    expect(sum).toBe(result.total)
  })

  it('has no lines and a zero total for an empty meeting', () => {
    const result = meetingCost([], [roleA], { hours: 1, minutes: 0 })
    expect(result).toEqual({ lines: [], total: 0 })
  })

  it('leaves out lines whose role no longer exists', () => {
    const lines: MeetingLine[] = [{ roleId: 'gone', headcount: 4 }]
    const result = meetingCost(lines, [roleA], { hours: 1, minutes: 0 })
    expect(result).toEqual({ lines: [], total: 0 })
  })
})
