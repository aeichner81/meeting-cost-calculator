import { describe, expect, it } from 'vitest'
import { CURRENCIES, DEFAULT_CURRENCY, formatMoney } from './currency'

describe('currency list', () => {
  it('offers exactly GBP, USD, CAD and EUR (AC-23)', () => {
    expect(CURRENCIES.map((c) => c.code)).toEqual(['GBP', 'USD', 'CAD', 'EUR'])
  })

  it('uses the specified symbols (AC-23)', () => {
    const symbols = CURRENCIES.map((c) => c.symbol)
    expect(symbols).toEqual(['£', 'US$', 'CA$', '€'])
  })

  it('names each currency for the selector (AC-23)', () => {
    expect(CURRENCIES.map((c) => c.name)).toEqual([
      'Pounds sterling',
      'US dollars',
      'Canadian dollars',
      'Euros',
    ])
  })

  it('defaults to pounds sterling (AC-14)', () => {
    expect(DEFAULT_CURRENCY).toBe('GBP')
    expect(formatMoney(200, DEFAULT_CURRENCY)).toBe('£200.00')
  })
})

describe('formatMoney', () => {
  it('shows a leading symbol, thousands separators and two decimals', () => {
    expect(formatMoney(10400, 'GBP')).toBe('£10,400.00')
  })

  it('rounds to two decimal places for display (AC-16)', () => {
    expect(formatMoney((200 * 52) / 12, 'GBP')).toBe('£866.67')
    expect(formatMoney(0.004, 'GBP')).toBe('£0.00')
    expect(formatMoney(1.005 + 0.0001, 'GBP')).toBe('£1.01')
  })

  it('does not round the input value itself (AC-16)', () => {
    const hourly = 30000 / 1820
    const total = hourly * 3 * 2
    expect(formatMoney(total, 'GBP')).toBe('£98.90')
  })

  it('changes the symbol but not the numbers across currencies (AC-15)', () => {
    expect(formatMoney(1234.5, 'GBP')).toBe('£1,234.50')
    expect(formatMoney(1234.5, 'USD')).toBe('US$1,234.50')
    expect(formatMoney(1234.5, 'CAD')).toBe('CA$1,234.50')
    expect(formatMoney(1234.5, 'EUR')).toBe('€1,234.50')
  })
})
