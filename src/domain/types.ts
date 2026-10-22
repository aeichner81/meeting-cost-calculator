export interface Role {
  id: string
  name: string
  annualSalary: number
}

export interface MeetingLine {
  roleId: string
  headcount: number
}

export interface Duration {
  hours: number
  minutes: number
}
