import { occurrencesPerYear, recurringCost } from './recurrence'

describe('occurrencesPerYear', () => {
  it('is 260, 52, 26 and 12 for daily, weekly, fortnightly and monthly (AC-11)', () => {
    expect(occurrencesPerYear('daily')).toBe(260)
    expect(occurrencesPerYear('weekly')).toBe(52)
    expect(occurrencesPerYear('fortnightly')).toBe(26)
    expect(occurrencesPerYear('monthly')).toBe(12)
  })

  it('counts daily as weekdays only: 52 weeks x 5 days (AC-12)', () => {
    expect(occurrencesPerYear('daily')).toBe(52 * 5)
  })

  it('has no occurrences for a meeting that happens once (AC-13)', () => {
    expect(occurrencesPerYear('once')).toBeNull()
  })
})

describe('recurringCost', () => {
  it('costs a weekly 200 meeting as 10400 a year and 866.67 a month (AC-10)', () => {
    const result = recurringCost(200, 'weekly')
    expect(result?.yearly).toBe(10400)
    expect(result?.monthly).toBeCloseTo(866.67, 2)
  })

  it('does not round the monthly figure (AC-16)', () => {
    expect(recurringCost(200, 'weekly')?.monthly).toBe(10400 / 12)
  })

  it('sets monthly to yearly divided by 12 for every recurrence (AC-11)', () => {
    for (const recurrence of ['daily', 'weekly', 'fortnightly', 'monthly'] as const) {
      const result = recurringCost(50, recurrence)
      expect(result?.monthly).toBe((result?.yearly ?? 0) / 12)
    }
  })

  it('multiplies the per-occurrence cost by the occurrences per year', () => {
    expect(recurringCost(10, 'daily')?.yearly).toBe(2600)
    expect(recurringCost(10, 'fortnightly')?.yearly).toBe(260)
    expect(recurringCost(10, 'monthly')?.yearly).toBe(120)
  })

  it('returns no figures for a meeting that happens once (AC-13)', () => {
    expect(recurringCost(200, 'once')).toBeNull()
  })
})
