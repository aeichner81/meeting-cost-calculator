import { validateMeetingInput, validateRoleName, validateSalary } from './validation'

describe('validateRoleName', () => {
  it('accepts a non-blank name and returns it trimmed (AC-4)', () => {
    expect(validateRoleName('Engineer')).toEqual({ ok: true, value: 'Engineer' })
    expect(validateRoleName('  Senior Engineer  ')).toEqual({ ok: true, value: 'Senior Engineer' })
  })

  it('accepts any non-blank name, such as digits or symbols (AC-4)', () => {
    expect(validateRoleName('L5 / Staff')).toEqual({ ok: true, value: 'L5 / Staff' })
  })

  it.each([
    ['empty', ''],
    ['spaces only', '   '],
    ['tabs and newlines only', '\t\n '],
  ])('rejects a name that is %s with an error (AC-4)', (_label, input) => {
    expect(validateRoleName(input)).toEqual({ ok: false, error: 'Enter a role name.' })
  })
})

describe('validateSalary', () => {
  it('accepts a positive salary and returns it as a number (AC-4)', () => {
    expect(validateSalary('36400')).toEqual({ ok: true, value: 36400 })
    expect(validateSalary('36400.50')).toEqual({ ok: true, value: 36400.5 })
    expect(validateSalary(' 36400 ')).toEqual({ ok: true, value: 36400 })
  })

  it('accepts a very large salary: there is no upper limit (AC-4)', () => {
    expect(validateSalary('999999999999')).toEqual({ ok: true, value: 999999999999 })
  })

  it('accepts a tiny positive salary (AC-4)', () => {
    expect(validateSalary('0.01')).toEqual({ ok: true, value: 0.01 })
  })

  it.each([
    ['empty', ''],
    ['blank', '   '],
    ['zero', '0'],
    ['decimal zero', '0.00'],
    ['negative', '-100'],
    ['text', 'abc'],
    ['exponent', '1e3'],
    ['mixed text', '100k'],
    ['thousands separator', '36,400'],
    ['currency symbol', '£36400'],
    ['infinity', 'Infinity'],
    ['NaN', 'NaN'],
    ['hex', '0x10'],
    ['two decimal points', '1.2.3'],
  ])('rejects a salary that is %s with an error (AC-4)', (_label, input) => {
    const result = validateSalary(input)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).not.toBe('')
    }
  })

  it('rejects a number too large to represent', () => {
    expect(validateSalary('9'.repeat(400)).ok).toBe(false)
  })

  it('gives a clear message that says what is wrong (AC-4)', () => {
    const result = validateSalary('')
    expect(result).toEqual({ ok: false, error: 'Enter an annual salary greater than 0.' })
  })
})

describe('validateMeetingInput', () => {
  const valid = { headcount: '3', hours: '2', minutes: '0' }

  it('accepts valid input and returns numbers (AC-9)', () => {
    expect(validateMeetingInput(valid)).toEqual({
      ok: true,
      value: { headcount: 3, duration: { hours: 2, minutes: 0 } },
    })
  })

  it('accepts hours and minutes together (AC-21)', () => {
    const result = validateMeetingInput({ headcount: '2', hours: '1', minutes: '30' })
    expect(result).toEqual({
      ok: true,
      value: { headcount: 2, duration: { hours: 1, minutes: 30 } },
    })
  })

  it('treats empty hours or minutes as 0 (AC-9)', () => {
    expect(validateMeetingInput({ headcount: '1', hours: '', minutes: '45' })).toEqual({
      ok: true,
      value: { headcount: 1, duration: { hours: 0, minutes: 45 } },
    })
    expect(validateMeetingInput({ headcount: '1', hours: '2', minutes: '  ' })).toEqual({
      ok: true,
      value: { headcount: 1, duration: { hours: 2, minutes: 0 } },
    })
  })

  it('accepts a large headcount and many hours: no upper limit (AC-5, AC-9)', () => {
    const result = validateMeetingInput({ headcount: '100000', hours: '500', minutes: '59' })
    expect(result.ok).toBe(true)
  })

  it('accepts minutes at both ends of 0 to 59 (AC-9)', () => {
    expect(validateMeetingInput({ headcount: '1', hours: '1', minutes: '0' }).ok).toBe(true)
    expect(validateMeetingInput({ headcount: '1', hours: '1', minutes: '59' }).ok).toBe(true)
  })

  describe('headcount', () => {
    it.each([
      ['empty', ''],
      ['zero', '0'],
      ['negative', '-1'],
      ['fractional', '1.5'],
      ['text', 'two'],
      ['exponent', '1e2'],
    ])('rejects a headcount that is %s (AC-9)', (_label, headcount) => {
      const result = validateMeetingInput({ ...valid, headcount })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.headcount).toBe('Enter a whole number of attendees, 1 or more.')
        expect(Object.keys(result.errors)).toEqual(['headcount'])
      }
    })
  })

  describe('hours', () => {
    it.each([
      ['negative', '-1'],
      ['fractional', '1.5'],
      ['text', 'one'],
    ])('rejects hours that are %s (AC-9)', (_label, hours) => {
      const result = validateMeetingInput({ ...valid, hours })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.hours).toBe('Enter hours as a whole number, 0 or more.')
        expect(Object.keys(result.errors)).toEqual(['hours'])
      }
    })
  })

  describe('minutes', () => {
    it.each([
      ['negative', '-1'],
      ['60', '60'],
      ['above 59', '90'],
      ['fractional', '30.5'],
      ['text', 'half'],
    ])('rejects minutes that are %s (AC-9)', (_label, minutes) => {
      const result = validateMeetingInput({ ...valid, minutes })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.minutes).toBe('Enter minutes as a whole number from 0 to 59.')
        expect(Object.keys(result.errors)).toEqual(['minutes'])
      }
    })
  })

  describe('zero duration', () => {
    it.each([
      ['both 0', '0', '0'],
      ['both empty', '', ''],
    ])('rejects a total duration of zero when %s (AC-9)', (_label, hours, minutes) => {
      const result = validateMeetingInput({ headcount: '1', hours, minutes })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.duration).toBe('Enter a duration longer than 0 minutes.')
        expect(Object.keys(result.errors)).toEqual(['duration'])
      }
    })

    it('does not also report a duration error when hours or minutes are already invalid', () => {
      const result = validateMeetingInput({ headcount: '1', hours: '-1', minutes: '0' })
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.errors.duration).toBeUndefined()
      }
    })
  })

  it('reports every invalid field at once, keyed by field (AC-9)', () => {
    const result = validateMeetingInput({ headcount: '0', hours: '-2', minutes: '75' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['headcount', 'hours', 'minutes'])
    }
  })

  it('returns no value when there are errors, so no cost can be calculated (AC-9)', () => {
    const result = validateMeetingInput({ ...valid, headcount: '0' })
    expect(result).not.toHaveProperty('value')
  })
})
