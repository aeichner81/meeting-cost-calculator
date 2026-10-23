import { render, screen, within } from '@testing-library/react'
import { CostBreakdown } from './CostBreakdown'
import type { MeetingCost } from '../domain/meeting'

const cost: MeetingCost = {
  lines: [
    { roleId: 'a', roleName: 'Developer', headcount: 3, cost: 120 },
    { roleId: 'b', roleName: 'Manager', headcount: 1, cost: 80 },
  ],
  total: 200,
}

describe('CostBreakdown', () => {
  // A11Y-7
  it('is a table with a caption and column header cells', () => {
    render(<CostBreakdown cost={cost} currency="GBP" />)
    const table = screen.getByRole('table', { name: 'Cost by role' })
    const headers = within(table).getAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual(['Role', 'Attendees', 'Cost'])
  })

  // AC-7
  it('lists each role with its cost and a total that matches', () => {
    render(<CostBreakdown cost={cost} currency="GBP" />)
    const rows = within(screen.getByRole('table')).getAllByRole('row')
    // header, two roles, total
    expect(rows).toHaveLength(4)
    expect(within(rows[1]).getByRole('rowheader')).toHaveTextContent('Developer')
    expect(rows[1]).toHaveTextContent('3')
    expect(rows[1]).toHaveTextContent('£120.00')
    expect(within(rows[2]).getByRole('rowheader')).toHaveTextContent('Manager')
    expect(rows[2]).toHaveTextContent('£80.00')
    expect(within(rows[3]).getByRole('rowheader')).toHaveTextContent('Total')
    expect(rows[3]).toHaveTextContent('£200.00')
  })

  // AC-15
  it('uses the chosen currency symbol', () => {
    render(<CostBreakdown cost={cost} currency="EUR" />)
    expect(screen.getByText('€120.00')).toBeInTheDocument()
    expect(screen.getByText('€200.00')).toBeInTheDocument()
  })

  // AC-16
  it('rounds to two decimal places for display only', () => {
    const uneven: MeetingCost = {
      lines: [{ roleId: 'a', roleName: 'Developer', headcount: 1, cost: 10 / 3 }],
      total: 10 / 3,
    }
    render(<CostBreakdown cost={uneven} currency="GBP" />)
    expect(screen.getAllByText('£3.33')).toHaveLength(2)
  })
})
