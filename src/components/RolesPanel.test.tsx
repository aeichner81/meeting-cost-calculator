import { render, screen, within } from '@testing-library/react'
import { RolesPanel } from './RolesPanel'

describe('RolesPanel', () => {
  it('says there are no roles yet when the list is empty', () => {
    render(<RolesPanel roles={[]} currency="GBP" />)
    expect(screen.getByText('No roles yet.')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  // AC-1, AC-16
  it('lists each role with its salary in the chosen currency', () => {
    render(
      <RolesPanel
        roles={[
          { id: 'a', name: 'Developer', annualSalary: 36400 },
          { id: 'b', name: 'Manager', annualSalary: 52000.5 },
        ]}
        currency="USD"
      />,
    )
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Developer')
    expect(items[0]).toHaveTextContent('US$36,400.00')
    expect(items[1]).toHaveTextContent('Manager')
    expect(items[1]).toHaveTextContent('US$52,000.50')
  })
})
