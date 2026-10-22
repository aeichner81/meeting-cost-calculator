export type CurrencyCode = 'GBP' | 'USD' | 'CAD' | 'EUR'

export interface Currency {
  code: CurrencyCode
  symbol: string
  name: string
}

// Display labels only; there is no conversion between currencies (AC-15).
export const CURRENCIES: readonly Currency[] = [
  { code: 'GBP', symbol: '£', name: 'Pounds sterling' },
  { code: 'USD', symbol: 'US$', name: 'US dollars' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian dollars' },
  { code: 'EUR', symbol: '€', name: 'Euros' },
]

export const DEFAULT_CURRENCY: CurrencyCode = 'GBP'

function symbolFor(code: CurrencyCode): string {
  const currency = CURRENCIES.find((c) => c.code === code)
  return currency ? currency.symbol : ''
}

// Rounds to 2 dp here and only here, so intermediate values stay exact (AC-16).
// The number format is fixed so the figures are the same for every currency.
export function formatMoney(amount: number, code: CurrencyCode): string {
  const digits = amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${symbolFor(code)}${digits}`
}
