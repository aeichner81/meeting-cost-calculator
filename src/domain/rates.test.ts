import { hourlyRate, HOURS_PER_YEAR } from './rates'

describe('hourlyRate (AC-2)', () => {
  it('uses 1,820 working hours a year (52 weeks x 35 hours)', () => {
    expect(HOURS_PER_YEAR).toBe(1820)
  })

  it('turns a salary of 36,400 into 20 an hour', () => {
    expect(hourlyRate(36400)).toBe(20)
  })

  it('does not round the rate', () => {
    expect(hourlyRate(50000)).toBeCloseTo(27.472527, 6)
  })
})
