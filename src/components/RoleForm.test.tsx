import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoleForm } from './RoleForm'

describe('RoleForm', () => {
  // A11Y-1
  it('has labelled name and salary fields', () => {
    render(<RoleForm onAdd={() => {}} />)
    expect(screen.getByLabelText('Role name')).toBeInTheDocument()
    expect(screen.getByLabelText('Annual salary')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add role' })).toBeInTheDocument()
  })

  // AC-1
  it('passes a valid role to onAdd and clears the fields', async () => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<RoleForm onAdd={onAdd} />)

    await user.type(screen.getByLabelText('Role name'), '  Developer ')
    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(onAdd).toHaveBeenCalledWith('Developer', 36400)
    expect(screen.getByLabelText('Role name')).toHaveValue('')
    expect(screen.getByLabelText('Annual salary')).toHaveValue('')
  })

  // AC-4, A11Y-5
  it.each(['', '   '])('rejects the blank role name %j with a linked error', async (name) => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<RoleForm onAdd={onAdd} />)

    if (name !== '') {
      await user.type(screen.getByLabelText('Role name'), name)
    }
    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(onAdd).not.toHaveBeenCalled()
    const field = screen.getByLabelText('Role name')
    expect(field).toHaveAccessibleDescription('Enter a role name.')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Annual salary')).not.toHaveAttribute('aria-invalid', 'true')
  })

  // AC-4, A11Y-5
  it.each(['', '0', '-5', 'abc'])('rejects the salary %j with a linked error', async (salary) => {
    const onAdd = vi.fn()
    const user = userEvent.setup()
    render(<RoleForm onAdd={onAdd} />)

    await user.type(screen.getByLabelText('Role name'), 'Developer')
    if (salary !== '') {
      await user.type(screen.getByLabelText('Annual salary'), salary)
    }
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByLabelText('Annual salary')).toHaveAccessibleDescription(
      'Enter an annual salary greater than 0.',
    )
    expect(screen.getByLabelText('Role name')).toHaveValue('Developer')
  })

  it('shows both errors when both fields are invalid', async () => {
    const user = userEvent.setup()
    render(<RoleForm onAdd={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
    expect(screen.getByLabelText('Role name')).toHaveAccessibleDescription('Enter a role name.')
    expect(screen.getByLabelText('Annual salary')).toHaveAccessibleDescription(
      'Enter an annual salary greater than 0.',
    )
  })

  it('clears errors after a valid submit', async () => {
    const user = userEvent.setup()
    render(<RoleForm onAdd={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
    await user.type(screen.getByLabelText('Role name'), 'Developer')
    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))
    expect(screen.getByLabelText('Role name')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByText('Enter a role name.')).not.toBeInTheDocument()
  })
})
