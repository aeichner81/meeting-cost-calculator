import { formatMoney } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import type { Role } from '../domain/types'
import styles from './RolesPanel.module.css'

interface RolesPanelProps {
  roles: Role[]
  currency: CurrencyCode
}

export function RolesPanel({ roles, currency }: RolesPanelProps) {
  if (roles.length === 0) {
    return <p>No roles yet.</p>
  }

  return (
    <ul className={styles.list}>
      {roles.map((role) => (
        <li key={role.id}>
          <span>{role.name}</span> <span>{formatMoney(role.annualSalary, currency)}</span>
        </li>
      ))}
    </ul>
  )
}
