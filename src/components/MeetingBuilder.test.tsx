import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MeetingBuilder } from './MeetingBuilder'
import type { Role } from '../domain/types'

const roles: Role[] = [
  { id: 'a', name: 'Developer', annualSalary: 36400 },
  { id: 'b', name: 'Manager', annualSalary: 72800 },
]

describe('MeetingBuilder', () => {
  // AC-8
  it('tells the manager to add a role first and links to the roles section', () => {
    render(<MeetingBuilder roles={[]} lines={[]} onAddLine={() => {}} />)
    expect(screen.getByText(/add a role first/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add a role/i })).toHaveAttribute(
      'href',
      '#roles-heading',
    )
    expect(screen.queryByLabelText('Headcount')).not.toBeInTheDocument()
  })

  // A11Y-1
  it('has labelled role and headcount fields', () => {
    render(<MeetingBuilder roles={roles} lines={[]} onAddLine={() => {}} />)
    const role = screen.getByLabelText('Role')
    expect(within(role).getByRole('option', { name: 'Developer' })).toBeInTheDocument()
    expect(within(role).getByRole('option', { name: 'Manager' })).toBeInTheDocument()
    expect(screen.getByLabelText('Headcount')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add to meeting' })).toBeInTheDocument()
  })

  // AC-5
  it('passes the chosen role and headcount to onAddLine', async () => {
    const onAddLine = vi.fn()
    const user = userEvent.setup()
    render(<MeetingBuilder roles={roles} lines={[]} onAddLine={onAddLine} />)

    await user.selectOptions(screen.getByLabelText('Role'), 'Manager')
    await user.clear(screen.getByLabelText('Headcount'))
    await user.type(screen.getByLabelText('Headcount'), '3')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))

    expect(onAddLine).toHaveBeenCalledWith('b', 3)
  })

  it('adds the first role with a headcount of 1 by default', async () => {
    const onAddLine = vi.fn()
    const user = userEvent.setup()
    render(<MeetingBuilder roles={roles} lines={[]} onAddLine={onAddLine} />)
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
    expect(onAddLine).toHaveBeenCalledWith('a', 1)
  })

  // AC-9, A11Y-5
  it.each(['', '0', '-2', '1.5', 'abc'])(
    'rejects the headcount %j with a linked error',
    async (headcount) => {
      const onAddLine = vi.fn()
      const user = userEvent.setup()
      render(<MeetingBuilder roles={roles} lines={[]} onAddLine={onAddLine} />)

      await user.clear(screen.getByLabelText('Headcount'))
      if (headcount !== '') {
        await user.type(screen.getByLabelText('Headcount'), headcount)
      }
      await user.click(screen.getByRole('button', { name: 'Add to meeting' }))

      expect(onAddLine).not.toHaveBeenCalled()
      const field = screen.getByLabelText('Headcount')
      expect(field).toHaveAccessibleDescription('Enter a whole number of attendees, 1 or more.')
      expect(field).toHaveAttribute('aria-invalid', 'true')
    },
  )

  // AC-5
  it('lists each meeting line with its role name and headcount', () => {
    render(
      <MeetingBuilder
        roles={roles}
        lines={[
          { roleId: 'a', headcount: 5 },
          { roleId: 'b', headcount: 1 },
        ]}
        onAddLine={() => {}}
      />,
    )
    const list = screen.getByRole('list', { name: 'Meeting lines' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Developer')
    expect(items[0]).toHaveTextContent('5')
    expect(items[1]).toHaveTextContent('Manager')
  })

  it('shows no line list while the meeting is empty', () => {
    render(<MeetingBuilder roles={roles} lines={[]} onAddLine={() => {}} />)
    expect(screen.queryByRole('list', { name: 'Meeting lines' })).not.toBeInTheDocument()
  })
})
