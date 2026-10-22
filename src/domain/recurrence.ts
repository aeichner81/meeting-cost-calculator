export type Recurrence = 'once' | 'daily' | 'weekly' | 'fortnightly' | 'monthly'

export interface RecurringCost {
  yearly: number
  monthly: number
}

const MONTHS_PER_YEAR = 12

// Daily means weekdays only (52 weeks x 5 days); holidays are ignored (AC-12).
const OCCURRENCES_PER_YEAR = {
  daily: 260,
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
} as const

export function occurrencesPerYear(recurrence: Recurrence): number | null {
  if (recurrence === 'once') {
    return null
  }
  return OCCURRENCES_PER_YEAR[recurrence]
}

// A meeting that happens once has no yearly or monthly figures (AC-13).
// Figures are left unrounded; rounding happens only when displaying (AC-16).
export function recurringCost(
  costPerOccurrence: number,
  recurrence: Recurrence,
): RecurringCost | null {
  const occurrences = occurrencesPerYear(recurrence)
  if (occurrences === null) {
    return null
  }
  const yearly = costPerOccurrence * occurrences
  return { yearly, monthly: yearly / MONTHS_PER_YEAR }
}
