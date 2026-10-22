import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RolesPanel } from './RolesPanel'

describe('RolesPanel', () => {
  it('says there are no roles yet when the list is empty', () => {
    render(<RolesPanel roles={[]} currency="GBP" onEdit={() => {}} onDelete={() => {}} />)
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
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    )
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Developer')
    expect(items[0]).toHaveTextContent('US$36,400.00')
    expect(items[1]).toHaveTextContent('Manager')
    expect(items[1]).toHaveTextContent('US$52,000.50')
  })

  // AC-3
  describe('editing and deleting', () => {
    const roles = [
      { id: 'a', name: 'Developer', annualSalary: 36400 },
      { id: 'b', name: 'Manager', annualSalary: 52000 },
    ]

    function renderPanel() {
      const onEdit = vi.fn()
      const onDelete = vi.fn()
      render(<RolesPanel roles={roles} currency="GBP" onEdit={onEdit} onDelete={onDelete} />)
      return { onEdit, onDelete, user: userEvent.setup() }
    }

    it('gives each role named Edit and Delete buttons', () => {
      renderPanel()
      expect(screen.getByRole('button', { name: 'Edit Developer' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Delete Manager' })).toBeInTheDocument()
    })

    it('opens an edit form prefilled with the role values', async () => {
      const { user } = renderPanel()
      await user.click(screen.getByRole('button', { name: 'Edit Developer' }))

      const form = screen.getByRole('form', { name: 'Edit Developer' })
      expect(within(form).getByLabelText('Role name')).toHaveValue('Developer')
      expect(within(form).getByLabelText('Annual salary')).toHaveValue('36400')
    })

    it('saves an edit and closes the form', async () => {
      const { onEdit, user } = renderPanel()
      await user.click(screen.getByRole('button', { name: 'Edit Developer' }))

      const form = screen.getByRole('form', { name: 'Edit Developer' })
      await user.clear(within(form).getByLabelText('Role name'))
      await user.type(within(form).getByLabelText('Role name'), 'Engineer')
      await user.clear(within(form).getByLabelText('Annual salary'))
      await user.type(within(form).getByLabelText('Annual salary'), '40000')
      await user.click(within(form).getByRole('button', { name: 'Save' }))

      expect(onEdit).toHaveBeenCalledWith('a', 'Engineer', 40000)
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
    })

    // AC-4 applies to edits too
    it('rejects an invalid edit with an error and keeps the form open', async () => {
      const { onEdit, user } = renderPanel()
      await user.click(screen.getByRole('button', { name: 'Edit Developer' }))

      const form = screen.getByRole('form', { name: 'Edit Developer' })
      await user.clear(within(form).getByLabelText('Role name'))
      await user.click(within(form).getByRole('button', { name: 'Save' }))

      expect(onEdit).not.toHaveBeenCalled()
      expect(within(form).getByLabelText('Role name')).toHaveAccessibleDescription(
        'Enter a role name.',
      )
    })

    it('cancels an edit without calling onEdit', async () => {
      const { onEdit, user } = renderPanel()
      await user.click(screen.getByRole('button', { name: 'Edit Developer' }))
      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onEdit).not.toHaveBeenCalled()
      expect(screen.queryByRole('form')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Edit Developer' })).toBeInTheDocument()
    })

    it('deletes a role by id', async () => {
      const { onDelete, user } = renderPanel()
      await user.click(screen.getByRole('button', { name: 'Delete Manager' }))
      expect(onDelete).toHaveBeenCalledWith('b')
    })
  })
})
