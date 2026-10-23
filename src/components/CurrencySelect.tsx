import { useId } from 'react'
import { CURRENCIES } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import styles from './MeetingBuilder.module.css'

interface CurrencySelectProps {
  value: CurrencyCode
  onChange: (currency: CurrencyCode) => void
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const selectId = useId()

  return (
    <div className={styles.field}>
      <label htmlFor={selectId}>Currency</label>
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange(event.target.value as CurrencyCode)}
      >
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {`${currency.name} (${currency.symbol}, ${currency.code})`}
          </option>
        ))}
      </select>
    </div>
  )
}
