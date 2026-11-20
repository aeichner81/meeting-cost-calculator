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

  // Task 24 lifts the setup into App; this pins the existing behaviour so it stays unchanged.
  it('starts with empty duration fields and "Once" after the last role is deleted and a role is added again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.type(screen.getByLabelText('Hours'), '2')
    await user.type(screen.getByLabelText('Minutes'), '15')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly')

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))
    await addRole(user, 'Manager', '72800')

    expect(screen.getByLabelText('Hours')).toHaveValue('')
    expect(screen.getByLabelText('Minutes')).toHaveValue('')
    expect(screen.getByLabelText('Recurrence')).toHaveValue('once')
  })
})

describe('deleting a role used in the meeting (AC-25, A11Y-6)', () => {
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

  async function calculate(user: ReturnType<typeof userEvent.setup>, hours: string) {
    await user.type(screen.getByLabelText('Hours'), hours)
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
  }

  async function setUpTwoRoleMeeting(user: ReturnType<typeof userEvent.setup>) {
    await addRole(user, 'Developer', '36400')
    await addRole(user, 'Manager', '72800')
    await addToMeeting(user, 'Developer', '3')
    await addToMeeting(user, 'Manager', '1')
  }

  it('removes the role line and a shown cost no longer includes it', async () => {
    const user = userEvent.setup()
    render(<App />)
    await setUpTwoRoleMeeting(user)
    await calculate(user, '2')
    expect(screen.getByText('Total cost: £200.00')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    const list = screen.getByRole('list', { name: 'Meeting lines' })
    expect(within(list).queryByText('Developer')).not.toBeInTheDocument()
    expect(within(list).getByText('Manager')).toBeInTheDocument()
    expect(screen.queryByText('Total cost: £200.00')).not.toBeInTheDocument()
    expect(screen.getByText('Total cost: £80.00')).toBeInTheDocument()
  })

  it('says in a live region which role line was removed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await setUpTwoRoleMeeting(user)

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    const notice = screen.getByRole('status', { name: 'Meeting notice' })
    expect(notice).toHaveTextContent('Developer was removed from the meeting.')
  })

  it('clears the cost, breakdown and recurring figures when no lines remain', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addRole(user, 'Manager', '72800')
    await addToMeeting(user, 'Developer', '3')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly')
    await calculate(user, '2')
    expect(screen.getByText(/Yearly cost:/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    expect(screen.queryByText(/Total cost:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Monthly cost:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Yearly cost:/)).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByText(/add attendees/i)).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Meeting notice' })).toHaveTextContent(
      'Developer was removed from the meeting.',
    )
  })

  it('gives no notice when the deleted role was not in the meeting', async () => {
    const user = userEvent.setup()
    render(<App />)
    await setUpTwoRoleMeeting(user)
    await addRole(user, 'Designer', '50000')

    await user.click(screen.getByRole('button', { name: 'Delete Designer' }))

    expect(screen.getByRole('status', { name: 'Meeting notice' })).toBeEmptyDOMElement()
  })

  it('removes the notice once the meeting changes again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await setUpTwoRoleMeeting(user)
    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))

    await addToMeeting(user, 'Manager', '2')

    expect(screen.getByRole('status', { name: 'Meeting notice' })).toBeEmptyDOMElement()
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

describe('persistence behaviours (AC-17, AC-18, AC-19, AC-24)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function addRole(user: ReturnType<typeof userEvent.setup>, name: string, salary: string) {
    await user.type(screen.getByLabelText('Role name'), name)
    await user.type(screen.getByLabelText('Annual salary'), salary)
    await user.click(screen.getByRole('button', { name: 'Add role' }))
  }

  it('keeps roles and salaries but clears the meeting after a reload (AC-17, AC-24)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.selectOptions(screen.getByLabelText('Role'), 'Developer')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
    await user.type(screen.getByLabelText('Hours'), '2')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByRole('list', { name: 'Meeting lines' })).toBeInTheDocument()

    unmount()
    render(<App />)

    expect(screen.getByText('£36,400.00')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Meeting lines' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Hours')).toHaveValue('')
    expect(screen.getByLabelText('Recurrence')).toHaveValue('once')
    expect(screen.queryByText(/Total cost/)).not.toBeInTheDocument()
  })

  it('says where data is stored and that nothing is sent anywhere (AC-18)', () => {
    render(<App />)
    expect(screen.getByText(/stored only in this browser/i)).toBeInTheDocument()
    expect(screen.getByText(/never sent to a server/i)).toBeInTheDocument()
  })

  it('shows no storage notice when storage works (AC-19)', () => {
    render(<App />)
    expect(screen.queryByText(/could not be loaded or saved/i)).not.toBeInTheDocument()
  })

  it('still works and tells the user when storage cannot be read (AC-19)', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByRole('status', { name: 'Storage notice' })).toHaveTextContent(
      /could not be loaded or saved/i,
    )
    expect(screen.getByText('No roles yet.')).toBeInTheDocument()

    await addRole(user, 'Developer', '36400')
    expect(within(screen.getByRole('list')).getByText('Developer')).toBeInTheDocument()
  })

  it('tells the user when a save fails (AC-19)', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError')
    })
    const user = userEvent.setup()
    render(<App />)
    expect(screen.queryByText(/could not be loaded or saved/i)).not.toBeInTheDocument()

    await addRole(user, 'Developer', '36400')

    expect(screen.getByRole('status', { name: 'Storage notice' })).toHaveTextContent(
      /could not be loaded or saved/i,
    )
    expect(within(screen.getByRole('list')).getByText('Developer')).toBeInTheDocument()
  })
})

describe('saving a meeting (AC-27, AC-28, AC-29, AC-30)', () => {
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

  async function saveAs(user: ReturnType<typeof userEvent.setup>, name: string) {
    await user.type(screen.getByLabelText('Meeting name'), name)
    await user.click(screen.getByRole('button', { name: 'Save meeting' }))
  }

  function storedMeetings() {
    return JSON.parse(localStorage.getItem('mcc:meetings:v1') ?? '[]')
  }

  it('has a Saved meetings section after the Meeting section', () => {
    render(<App />)
    const headings = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(headings.indexOf('Saved meetings')).toBe(headings.indexOf('Meeting') + 1)
  })

  it('saves the working meeting with its lines, duration, recurrence and currency (AC-27)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(screen.getByLabelText('Currency'), 'USD')
    await addRole(user, 'Developer', '36400')
    await addRole(user, 'Manager', '72800')
    await addToMeeting(user, 'Developer', '3')
    await addToMeeting(user, 'Manager', '1')
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.type(screen.getByLabelText('Minutes'), '30')
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly')

    await saveAs(user, '  Weekly sync  ')

    const [saved] = storedMeetings()
    expect(saved).toMatchObject({
      name: 'Weekly sync',
      duration: { hours: 1, minutes: 30 },
      recurrence: 'weekly',
      currency: 'USD',
    })
    expect(saved.lines).toEqual([
      expect.objectContaining({ roleName: 'Developer', headcount: 3 }),
      expect.objectContaining({ roleName: 'Manager', headcount: 1 }),
    ])
    expect(screen.getByRole('status', { name: 'Saved meetings notice' })).toHaveTextContent(
      'Saved meeting "Weekly sync".',
    )
  })

  it('leaves the working meeting as it was after saving (AC-27)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Hours'), '1')
    await saveAs(user, 'Standup')

    expect(screen.getByRole('list', { name: 'Meeting lines' })).toBeInTheDocument()
    expect(screen.getByLabelText('Hours')).toHaveValue('1')
  })

  it('shows a name error and saves nothing for a blank name (AC-28)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Hours'), '1')
    await saveAs(user, '   ')

    expect(screen.getByText('Enter a meeting name.')).toBeInTheDocument()
    expect(storedMeetings()).toEqual([])
  })

  it('shows the add-attendees message and saves nothing when there are no lines (AC-29)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.type(screen.getByLabelText('Hours'), '1')
    await saveAs(user, 'Standup')

    expect(screen.getByRole('status', { name: 'Saved meetings notice' })).toHaveTextContent(
      'Add attendees to the meeting first.',
    )
    expect(storedMeetings()).toEqual([])
  })

  it('shows the duration message and saves nothing when the duration is invalid (AC-29)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Minutes'), '75')
    await saveAs(user, 'Standup')

    expect(screen.getByRole('status', { name: 'Saved meetings notice' })).toHaveTextContent(
      'Enter minutes as a whole number from 0 to 59.',
    )
    expect(storedMeetings()).toEqual([])
  })

  it('asks before replacing a meeting with the same name, and replaces it on confirm (AC-30)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Hours'), '1')
    await saveAs(user, 'Weekly sync')

    await user.clear(screen.getByLabelText('Hours'))
    await user.type(screen.getByLabelText('Hours'), '3')
    await saveAs(user, 'weekly sync')
    expect(storedMeetings()[0].duration).toEqual({ hours: 1, minutes: 0 })

    await user.click(screen.getByRole('button', { name: 'Replace' }))

    const meetings = storedMeetings()
    expect(meetings).toHaveLength(1)
    expect(meetings[0]).toMatchObject({ name: 'weekly sync', duration: { hours: 3, minutes: 0 } })
  })

  it('keeps the existing meeting when replacing is cancelled (AC-30)', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await addToMeeting(user, 'Developer', '2')
    await user.type(screen.getByLabelText('Hours'), '1')
    await saveAs(user, 'Weekly sync')

    await user.clear(screen.getByLabelText('Hours'))
    await user.type(screen.getByLabelText('Hours'), '3')
    await saveAs(user, 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    const meetings = storedMeetings()
    expect(meetings).toHaveLength(1)
    expect(meetings[0]).toMatchObject({ name: 'Weekly sync', duration: { hours: 1, minutes: 0 } })
  })
})

describe('loading a saved meeting (AC-31, AC-32, AC-33, AC-34, AC-35)', () => {
  // The AC-6 meeting, saved in US dollars: 3 of role A and 1 of role B for 2 hours, weekly.
  const AC6_MEETING = {
    name: 'Weekly sync',
    lines: [
      { roleId: 'a', roleName: 'Developer', headcount: 3 },
      { roleId: 'b', roleName: 'Manager', headcount: 1 },
    ],
    duration: { hours: 2, minutes: 0 },
    recurrence: 'weekly',
    currency: 'USD',
  }

  function seed(roles: Array<{ id: string; name: string; annualSalary: number }>, meetings: unknown[]) {
    localStorage.setItem('mcc:v1', JSON.stringify({ roles, currency: 'GBP' }))
    localStorage.setItem('mcc:meetings:v1', JSON.stringify(meetings))
  }

  const AC6_ROLES = [
    { id: 'a', name: 'Developer', annualSalary: 36400 },
    { id: 'b', name: 'Manager', annualSalary: 72800 },
  ]

  function meetingLineTexts() {
    const list = screen.getByRole('list', { name: 'Meeting lines' })
    return within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
  }

  function savedNotice() {
    return screen.getByRole('status', { name: 'Saved meetings notice' })
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

  // A different working meeting with a shown cost: 1 Developer for 1 hour, £20.00.
  async function buildAndCalculate(user: ReturnType<typeof userEvent.setup>) {
    await addToMeeting(user, 'Developer', '1')
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('Total cost: £20.00')).toBeInTheDocument()
  }

  beforeEach(() => {
    localStorage.clear()
  })

  it('says there are no saved meetings yet and offers no Load (AC-35)', () => {
    render(<App />)
    expect(screen.getByText('No saved meetings yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load' })).not.toBeInTheDocument()
  })

  it('replaces lines, duration and recurrence, switches the currency and clears the cost (AC-31)', async () => {
    seed(AC6_ROLES, [AC6_MEETING])
    const user = userEvent.setup()
    render(<App />)
    await buildAndCalculate(user)

    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Load and replace' }))

    expect(meetingLineTexts()).toEqual(['Developer 3', 'Manager 1'])
    expect(screen.getByLabelText('Hours')).toHaveValue('2')
    expect(screen.getByLabelText('Minutes')).toHaveValue('0')
    expect(screen.getByLabelText('Recurrence')).toHaveValue('weekly')
    expect(screen.getByLabelText('Currency')).toHaveValue('USD')
    expect(JSON.parse(localStorage.getItem('mcc:v1') ?? '{}').currency).toBe('USD')
    expect(screen.queryByText(/Total cost/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Yearly cost/)).not.toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('calculates the loaded AC-6 meeting as before when salaries are unchanged', async () => {
    seed(AC6_ROLES, [AC6_MEETING])
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByText('Total cost: US$200.00')).toBeInTheDocument()
  })

  it('uses current salaries: £320.00 after role A goes from £36,400 to £72,800 (AC-32)', async () => {
    // Saved in pounds with role A at £36,400; role A's salary has since changed to £72,800.
    seed(
      [
        { id: 'a', name: 'Developer', annualSalary: 72800 },
        { id: 'b', name: 'Manager', annualSalary: 72800 },
      ],
      [{ ...AC6_MEETING, currency: 'GBP' }],
    )
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByText('Total cost: £320.00')).toBeInTheDocument()
  })

  it('leaves out lines for deleted roles, says so and keeps the saved meeting (AC-33)', async () => {
    const withDeleted = {
      ...AC6_MEETING,
      lines: [...AC6_MEETING.lines, { roleId: 'gone', roleName: 'Designer', headcount: 2 }],
    }
    seed(AC6_ROLES, [withDeleted])
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(meetingLineTexts()).toEqual(['Developer 3', 'Manager 1'])
    expect(savedNotice()).toHaveTextContent(
      'The Designer line was left out because that role has been deleted.',
    )
    expect(JSON.parse(localStorage.getItem('mcc:meetings:v1') ?? '[]')).toEqual([withDeleted])
  })

  it('shows the add-attendees message on Calculate when no lines remain after loading (AC-33, AC-26)', async () => {
    seed(AC6_ROLES, [
      { ...AC6_MEETING, lines: [{ roleId: 'gone', roleName: 'Designer', headcount: 2 }] },
    ])
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    expect(screen.getByText('Add attendees to the meeting first.')).toBeInTheDocument()
    expect(screen.queryByText(/Total cost/)).not.toBeInTheDocument()
  })

  it('leaves the meeting, currency and cost alone when loading is cancelled (AC-34)', async () => {
    seed(AC6_ROLES, [AC6_MEETING])
    const user = userEvent.setup()
    render(<App />)
    await buildAndCalculate(user)

    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(meetingLineTexts()).toEqual(['Developer 1'])
    expect(screen.getByLabelText('Hours')).toHaveValue('1')
    expect(screen.getByLabelText('Currency')).toHaveValue('GBP')
    expect(screen.getByText('Total cost: £20.00')).toBeInTheDocument()
  })

  it('saves the loaded duration and recurrence when the loaded meeting is saved again (AC-27, AC-31)', async () => {
    seed(AC6_ROLES, [AC6_MEETING])
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.type(screen.getByLabelText('Meeting name'), 'Copy')
    await user.click(screen.getByRole('button', { name: 'Save meeting' }))

    const copy = JSON.parse(localStorage.getItem('mcc:meetings:v1') ?? '[]').find(
      (meeting: { name: string }) => meeting.name === 'Copy',
    )
    expect(copy).toMatchObject({
      duration: { hours: 2, minutes: 0 },
      recurrence: 'weekly',
      currency: 'USD',
    })
  })

  it('starts with empty duration fields after loading, deleting every role and adding one again', async () => {
    seed(AC6_ROLES, [AC6_MEETING])
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Delete Developer' }))
    await user.click(screen.getByRole('button', { name: 'Delete Manager' }))
    await user.type(screen.getByLabelText('Role name'), 'Tester')
    await user.type(screen.getByLabelText('Annual salary'), '36400')
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(screen.getByLabelText('Hours')).toHaveValue('')
    expect(screen.getByLabelText('Minutes')).toHaveValue('')
    expect(screen.getByLabelText('Recurrence')).toHaveValue('once')
  })
})

describe('deleting a saved meeting (AC-36)', () => {
  const ROLES = [
    { id: 'a', name: 'Developer', annualSalary: 36400 },
    { id: 'b', name: 'Manager', annualSalary: 72800 },
  ]

  function savedMeeting(name: string) {
    return {
      name,
      lines: [{ roleId: 'b', roleName: 'Manager', headcount: 2 }],
      duration: { hours: 2, minutes: 0 },
      recurrence: 'weekly',
      currency: 'USD',
    }
  }

  function storedNames() {
    const stored = JSON.parse(localStorage.getItem('mcc:meetings:v1') ?? '[]')
    return stored.map((meeting: { name: string }) => meeting.name)
  }

  function optionTexts() {
    return within(screen.getByLabelText('Saved meeting'))
      .getAllByRole('option')
      .map((option) => option.textContent)
  }

  // A working meeting with a shown cost: 1 Developer for 1 hour, £20.00.
  async function buildAndCalculate(user: ReturnType<typeof userEvent.setup>) {
    await user.selectOptions(screen.getByLabelText('Role'), 'Developer')
    await user.clear(screen.getByLabelText('Headcount'))
    await user.type(screen.getByLabelText('Headcount'), '1')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(screen.getByText('Total cost: £20.00')).toBeInTheDocument()
  }

  function expectWorkingMeetingUnchanged() {
    const list = screen.getByRole('list', { name: 'Meeting lines' })
    const lines = within(list)
      .getAllByRole('listitem')
      .map((item) => item.textContent)
    expect(lines).toEqual(['Developer 1'])
    expect(screen.getByLabelText('Hours')).toHaveValue('1')
    expect(screen.getByLabelText('Currency')).toHaveValue('GBP')
    expect(screen.getByText('Total cost: £20.00')).toBeInTheDocument()
  }

  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('mcc:v1', JSON.stringify({ roles: ROLES, currency: 'GBP' }))
    localStorage.setItem(
      'mcc:meetings:v1',
      JSON.stringify([savedMeeting('Monthly review'), savedMeeting('Weekly sync')]),
    )
  })

  it('removes the meeting from the list and storage when confirmed; working meeting unchanged', async () => {
    const user = userEvent.setup()
    render(<App />)
    await buildAndCalculate(user)

    await user.selectOptions(screen.getByLabelText('Saved meeting'), 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Delete saved meeting' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(optionTexts()).toEqual(['Monthly review'])
    expect(storedNames()).toEqual(['Monthly review'])
    expectWorkingMeetingUnchanged()
  })

  it('keeps the meeting when cancelled; working meeting unchanged', async () => {
    const user = userEvent.setup()
    render(<App />)
    await buildAndCalculate(user)

    await user.selectOptions(screen.getByLabelText('Saved meeting'), 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Delete saved meeting' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(optionTexts()).toEqual(['Monthly review', 'Weekly sync'])
    expect(storedNames()).toEqual(['Monthly review', 'Weekly sync'])
    expectWorkingMeetingUnchanged()
  })

  it('shows the empty state once the last saved meeting is deleted', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (let count = 0; count < 2; count += 1) {
      await user.click(screen.getByRole('button', { name: 'Delete saved meeting' }))
      await user.click(screen.getByRole('button', { name: 'Delete' }))
    }

    expect(screen.getByText('No saved meetings yet.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete saved meeting' })).not.toBeInTheDocument()
    expect(storedNames()).toEqual([])
  })
})
