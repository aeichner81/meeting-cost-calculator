import { formatMoney } from '../domain/currency'
import type { CurrencyCode } from '../domain/currency'
import type { MeetingCost } from '../domain/meeting'
import styles from './CostBreakdown.module.css'

interface CostBreakdownProps {
  cost: MeetingCost
  currency: CurrencyCode
}

export function CostBreakdown({ cost, currency }: CostBreakdownProps) {
  return (
    <table className={styles.table}>
      <caption>Cost by role</caption>
      <thead>
        <tr>
          <th scope="col">Role</th>
          <th scope="col">Attendees</th>
          <th scope="col">Cost</th>
        </tr>
      </thead>
      <tbody>
        {cost.lines.map((line) => (
          <tr key={line.roleId}>
            <th scope="row">{line.roleName}</th>
            <td>{line.headcount}</td>
            <td>{formatMoney(line.cost, currency)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          <td />
          <td>{formatMoney(cost.total, currency)}</td>
        </tr>
      </tfoot>
    </table>
  )
}
