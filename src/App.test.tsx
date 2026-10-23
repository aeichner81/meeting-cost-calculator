import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import indexHtml from '../index.html?raw'

describe('page skeleton (A11Y-7)', () => {
  it('has exactly one h1', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('has a main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('sets the document language in index.html', () => {
    expect(indexHtml).toMatch(/<html[^>]*\slang="en"/)
  })
})

describe('roles (AC-1, AC-4)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a role and shows it in the role list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Role name'), 'Developer')
    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(within(screen.getByRole('list')).getByText('Developer')).toBeInTheDocument()
    expect(screen.getByText('£36,400.00')).toBeInTheDocument()
  })

  it('does not add a role with a blank name', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(screen.queryByRole('list')).not.toBeInTheDocument()
    expect(screen.getByText('Enter a role name.')).toBeInTheDocument()
  })

  it('keeps headings in order under the single h1', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 2, name: 'Roles' })).toBeInTheDocument()
  })
})

describe('meeting builder (AC-5, AC-8, AC-22)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  async function addRole(user: ReturnType<typeof userEvent.setup>, name: string, salary: string) {
    await user.type(screen.getByLabelText('Role name'), name)
    await user.type(screen.getByLabelText('Annual salary'), salary)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
  }

  async function addToMeeting(
    user: ReturnType<typeof userEvent.setup>,
    role: string,
    headcount: string,
  ) {
    await user.selectOptions(screen.getByLabelText('Role'), role)
    await user.clear(screen.getByLabelText('Headcount'))
    await user.type(screen.getByLabelText('Headcount'), headcount)
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
  }

  it('asks for a role first when none exist, then offers the builder once one is added', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByText(/add a role first/i)).toBeInTheDocument()

    await addRole(user, 'Developer', '36400')

    expect(screen.queryByText(/add a role first/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Headcount')).toBeInTheDocument()
  })

  it('merges a repeated role into a single line (AC-22)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')

    await addToMeeting(user, 'Developer', '3')
    await addToMeeting(user, 'Developer', '2')

    const list = screen.getByRole('list', { name: 'Meeting lines' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Developer')
    expect(items[0]).toHaveTextContent('5')
  })

  it('drops meeting lines for a role that is deleted', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '3')

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    expect(screen.queryByRole('list', { name: 'Meeting lines' })).not.toBeInTheDocument()
    expect(screen.getByText(/add a role first/i)).toBeInTheDocument()
  })

  it('shows a renamed role in the meeting line', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '3')

    await user.click(screen.getByRole('button', { name: 'Edit Developer' }))
    const form = screen.getByRole('form', { name: 'Edit Developer' })
    await user.clear(within(form).getByLabelText('Role name'))
    await user.type(within(form).getByLabelText('Role name'), 'Engineer')
    await user.click(within(form).getByRole('button', { name: 'Save' }))

    const list = screen.getByRole('list', { name: 'Meeting lines' })
    expect(within(list).getByText('Engineer')).toBeInTheDocument()
  })
})

describe('duration and calculate (AC-5, AC-6, AC-21)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  async function addRole(user: ReturnType<typeof userEvent.setup>, name: string, salary: string) {
    await user.type(screen.getByLabelText('Role name'), name)
    await user.type(screen.getByLabelText('Annual salary'), salary)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
  }

  async function addToMeeting(
    user: ReturnType<typeof userEvent.setup>,
    role: string,
    headcount: string,
  ) {
    await user.selectOptions(screen.getByLabelText('Role'), role)
    await user.clear(screen.getByLabelText('Headcount'))
    await user.type(screen.getByLabelText('Headcount'), headcount)
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
  }

  it('hides the duration fields until a role exists', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByLabelText('Hours')).not.toBeInTheDocument()

    await addRole(user, 'Developer', '36400')
    expect(screen.getByLabelText('Hours')).toBeInTheDocument()
  })

  it('calculates the total for a meeting of two roles (AC-6)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addRole(user, 'Manager', '72800')
    await addToMeeting(user, 'Developer', '3')
    await addToMeeting(user, 'Manager', '1')

    await user.type(screen.getByLabelText('Hours'), '2')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByText('Total cost: £200.00')).toBeInTheDocument()
  })

  it('uses a role salary edited after the calculation (AC-3)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.type(screen.getByLabelText('Minutes'), '30')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('Total cost: £60.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit Developer' }))
    const form = screen.getByRole('form', { name: 'Edit Developer' })
    await user.clear(within(form).getByLabelText('Annual salary'))
    await user.type(within(form).getByLabelText('Annual salary'), '72800')
    await user.click(within(form).getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Total cost: £120.00')).toBeInTheDocument()
  })
})

describe('currency selector (AC-14, AC-15, AC-16, AC-17)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  async function addRole(user: ReturnType<typeof userEvent.setup>, name: string, salary: string) {
    await user.type(screen.getByLabelText('Role name'), name)
    await user.type(screen.getByLabelText('Annual salary'), salary)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
  }

  it('defaults to pounds sterling (AC-14)', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByLabelText('Currency')).toHaveValue('GBP')

    await addRole(user, 'Developer', '36400')
    expect(screen.getByText('£36,400.00')).toBeInTheDocument()
  })

  it('changes the symbol but not the numbers (AC-15, AC-16)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.selectOptions(screen.getByLabelText('Role'), 'Developer')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('Total cost: £20.00')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Currency'), 'EUR')

    expect(screen.queryByText('£36,400.00')).not.toBeInTheDocument()
    expect(screen.getByText('€36,400.00')).toBeInTheDocument()
    expect(screen.getByText('Total cost: €20.00')).toBeInTheDocument()
  })

  it('keeps the chosen currency after a reload (AC-17)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.selectOptions(screen.getByLabelText('Currency'), 'USD')

    unmount()
    render(<App />)

    expect(screen.getByLabelText('Currency')).toHaveValue('USD')
  })
})

describe('edit and delete roles (AC-3)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  async function addRole(user: ReturnType<typeof userEvent.setup>, name: string, salary: string) {
    await user.type(screen.getByLabelText('Role name'), name)
    await user.type(screen.getByLabelText('Annual salary'), salary)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
  }

  it('shows an edited role in the list and keeps it after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addRole(user, 'Developer', '36400')

    await user.click(screen.getByRole('button', { name: 'Edit Developer' }))
    const form = screen.getByRole('form', { name: 'Edit Developer' })
    await user.clear(within(form).getByLabelText('Annual salary'))
    await user.type(within(form).getByLabelText('Annual salary'), '40000')
    await user.click(within(form).getByRole('button', { name: 'Save' }))

    expect(screen.getByText('£40,000.00')).toBeInTheDocument()
    expect(screen.queryByText('£36,400.00')).not.toBeInTheDocument()

    unmount()
    render(<App />)
    expect(screen.getByText('£40,000.00')).toBeInTheDocument()
  })

  it('removes a deleted role from the list and from storage', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addRole(user, 'Developer', '36400')
    await addRole(user, 'Manager', '52000')

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    const list = screen.getByRole('list')
    expect(within(list).queryByText('Developer')).not.toBeInTheDocument()
    expect(within(list).getByText('Manager')).toBeInTheDocument()

    unmount()
    render(<App />)
    expect(screen.queryByText('Developer')).not.toBeInTheDocument()
    expect(within(screen.getByRole('list')).getByText('Manager')).toBeInTheDocument()
  })

  it('shows the empty state after the last role is deleted', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))
    expect(screen.getByText('No roles yet.')).toBeInTheDocument()
  })
})
