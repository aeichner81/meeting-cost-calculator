import { hourlyRate } from './rates'
import type { Duration, MeetingLine, Role } from './types'

export interface LineCost {
  roleId: string
  roleName: string
  headcount: number
  cost: number
}

export interface MeetingCost {
  lines: LineCost[]
  total: number
}

export function durationInHours(duration: Duration): number {
  return duration.hours + duration.minutes / 60
}

function costOfLine(role: Role, line: MeetingLine, hours: number): LineCost {
  return {
    roleId: role.id,
    roleName: role.name,
    headcount: line.headcount,
    cost: hourlyRate(role.annualSalary) * line.headcount * hours,
  }
}

// Costs are left unrounded; rounding happens only when displaying (AC-16).
export function meetingCost(
  lines: MeetingLine[],
  roles: Role[],
  duration: Duration,
): MeetingCost {
  const hours = durationInHours(duration)
  const costs: LineCost[] = []

  for (const line of lines) {
    const role = roles.find((r) => r.id === line.roleId)
    if (role) {
      costs.push(costOfLine(role, line, hours))
    }
  }

  const total = costs.reduce((sum, line) => sum + line.cost, 0)
  return { lines: costs, total }
}
