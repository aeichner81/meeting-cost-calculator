import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DurationCalculator } from './DurationCalculator'
import type { MeetingLine, Role } from '../domain/types'

const roles: Role[] = [
  { id: 'a', name: 'Developer', annualSalary: 36400 },
  { id: 'b', name: 'Manager', annualSalary: 72800 },
]

const lines: MeetingLine[] = [
  { roleId: 'a', headcount: 3 },
  { roleId: 'b', headcount: 1 },
]

async function calculate(user: ReturnType<typeof userEvent.setup>, hours: string, minutes: string) {
  const hoursField = screen.getByLabelText('Hours')
  const minutesField = screen.getByLabelText('Minutes')
  await user.clear(hoursField)
  await user.clear(minutesField)
  if (hours !== '') {
    await user.type(hoursField, hours)
  }
  if (minutes !== '') {
    await user.type(minutesField, minutes)
  }
  await user.click(screen.getByRole('button', { name: 'Calculate' }))
}

describe('DurationCalculator', () => {
  // A11Y-1
  it('has labelled hours and minutes fields and a Calculate button', () => {
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    expect(screen.getByLabelText('Hours')).toBeInTheDocument()
    expect(screen.getByLabelText('Minutes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Calculate' })).toBeInTheDocument()
  })

  it('shows no cost before Calculate is pressed', () => {
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    expect(screen.queryByText(/total cost/i)).not.toBeInTheDocument()
  })

  // AC-5
  it('shows the total cost of the meeting', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '2', '0')
    expect(screen.getByText('Total cost: £200.00')).toBeInTheDocument()
  })

  // AC-6, AC-7
  it('shows the breakdown by role after calculating, and not before', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    await calculate(user, '2', '0')

    const table = screen.getByRole('table', { name: 'Cost by role' })
    expect(within(table).getByText('£120.00')).toBeInTheDocument()
    expect(within(table).getByText('£80.00')).toBeInTheDocument()
    expect(within(table).getByText('£200.00')).toBeInTheDocument()
  })

  it('removes the breakdown when the next calculation is invalid', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '2', '0')
    await calculate(user, '-1', '0')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  // AC-21
  it('handles hours and minutes together', async () => {
    const user = userEvent.setup()
    render(
      <DurationCalculator roles={roles} lines={[{ roleId: 'a', headcount: 2 }]} currency="GBP" />,
    )
    await calculate(user, '1', '30')
    expect(screen.getByText('Total cost: £60.00')).toBeInTheDocument()
  })

  // AC-9
  it('treats an empty hours or minutes field as 0', async () => {
    const user = userEvent.setup()
    render(
      <DurationCalculator roles={roles} lines={[{ roleId: 'a', headcount: 1 }]} currency="GBP" />,
    )
    await calculate(user, '', '30')
    expect(screen.getByText('Total cost: £10.00')).toBeInTheDocument()
  })

  // AC-9, A11Y-5
  it.each([
    ['-1', '0', 'Hours', 'Enter hours as a whole number, 0 or more.'],
    ['1.5', '0', 'Hours', 'Enter hours as a whole number, 0 or more.'],
    ['1', '60', 'Minutes', 'Enter minutes as a whole number from 0 to 59.'],
    ['1', 'abc', 'Minutes', 'Enter minutes as a whole number from 0 to 59.'],
  ])('rejects hours %j and minutes %j with a linked error', async (hours, minutes, label, message) => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, hours, minutes)

    const field = screen.getByLabelText(label)
    expect(field).toHaveAccessibleDescription(message)
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText(/total cost/i)).not.toBeInTheDocument()
  })

  // AC-9, A11Y-5
  it('rejects a duration of zero with an error linked to the hours field', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '0', '0')

    expect(screen.getByLabelText('Hours')).toHaveAccessibleDescription(
      'Enter a duration longer than 0 minutes.',
    )
    expect(screen.queryByText(/total cost/i)).not.toBeInTheDocument()
  })

  // AC-9
  it('removes an earlier cost when the next calculation is invalid', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '2', '0')
    await calculate(user, '-1', '0')
    expect(screen.queryByText(/total cost/i)).not.toBeInTheDocument()
  })

  it('clears the errors once a valid duration is calculated', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '-1', '0')
    await calculate(user, '2', '0')
    expect(screen.getByLabelText('Hours')).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Total cost: £200.00')).toBeInTheDocument()
  })

  // A11Y-6
  it('announces the total and the failure through a polite live region', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    const region = screen.getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')

    await calculate(user, '2', '0')
    expect(region).toHaveTextContent('Total cost: £200.00')

    await calculate(user, '-1', '0')
    expect(region).toHaveTextContent('No cost calculated')
    expect(region).not.toHaveTextContent('£200.00')
  })

  // Spec gap: no attendees to cost (flagged for review)
  it('asks for attendees instead of showing a cost when the meeting has no lines', async () => {
    const user = userEvent.setup()
    render(<DurationCalculator roles={roles} lines={[]} currency="GBP" />)
    await calculate(user, '1', '0')
    expect(screen.getByRole('status')).toHaveTextContent('Add attendees to the meeting first.')
    expect(screen.queryByText(/total cost/i)).not.toBeInTheDocument()
  })

  it('keeps the total current when the meeting lines change', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DurationCalculator roles={roles} lines={lines} currency="GBP" />)
    await calculate(user, '2', '0')
    rerender(
      <DurationCalculator roles={roles} lines={[{ roleId: 'a', headcount: 1 }]} currency="GBP" />,
    )
    expect(screen.getByText('Total cost: £40.00')).toBeInTheDocument()
  })
})
