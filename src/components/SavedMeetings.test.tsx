import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CurrencyCode } from '../domain/currency'
import type { SavedMeeting } from '../domain/savedMeetings'
import type { MeetingLine, Role } from '../domain/types'
import type { MeetingSetup } from './DurationCalculator'
import { SavedMeetings } from './SavedMeetings'

const ROLES: Role[] = [
  { id: 'a', name: 'Developer', annualSalary: 36400 },
  { id: 'b', name: 'Manager', annualSalary: 72800 },
]

const LINES: MeetingLine[] = [
  { roleId: 'a', headcount: 3 },
  { roleId: 'b', headcount: 1 },
]

const VALID_SETUP: MeetingSetup = { hours: '2', minutes: '0', recurrence: 'weekly' }

const WEEKLY_SYNC: SavedMeeting = {
  name: 'Weekly sync',
  lines: [{ roleId: 'a', roleName: 'Developer', headcount: 1 }],
  duration: { hours: 0, minutes: 30 },
  recurrence: 'weekly',
  currency: 'GBP',
}

interface SetupOptions {
  meetings?: SavedMeeting[]
  lines?: MeetingLine[]
  setup?: MeetingSetup
  currency?: CurrencyCode
}

function renderSaved(options: SetupOptions = {}) {
  const onSave = vi.fn()
  const onLoad = vi.fn()
  const setup = options.setup ?? VALID_SETUP
  render(
    <SavedMeetings
      meetings={options.meetings ?? []}
      roles={ROLES}
      lines={options.lines ?? LINES}
      currency={options.currency ?? 'USD'}
      readSetup={() => setup}
      onSave={onSave}
      onLoad={onLoad}
    />,
  )
  return { onSave, onLoad, user: userEvent.setup() }
}

function notice() {
  return screen.getByRole('status', { name: 'Saved meetings notice' })
}

async function saveAs(user: ReturnType<typeof userEvent.setup>, name: string) {
  if (name !== '') {
    await user.type(screen.getByLabelText('Meeting name'), name)
  }
  await user.click(screen.getByRole('button', { name: 'Save meeting' }))
}

describe('saving a meeting (AC-27)', () => {
  it('saves the lines, duration, recurrence and currency under the name', async () => {
    const { onSave, user } = renderSaved()
    await saveAs(user, 'Weekly sync')

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith({
      name: 'Weekly sync',
      lines: [
        { roleId: 'a', roleName: 'Developer', headcount: 3 },
        { roleId: 'b', roleName: 'Manager', headcount: 1 },
      ],
      duration: { hours: 2, minutes: 0 },
      recurrence: 'weekly',
      currency: 'USD',
    })
  })

  it('treats an empty minutes field as 0, as Calculate does', async () => {
    const { onSave, user } = renderSaved({ setup: { hours: '1', minutes: '', recurrence: 'once' } })
    await saveAs(user, 'Standup')

    expect(onSave.mock.calls[0][0].duration).toEqual({ hours: 1, minutes: 0 })
  })

  it('announces the save and clears the name field (A11Y-6)', async () => {
    const { user } = renderSaved()
    const region = notice()
    await saveAs(user, 'Weekly sync')

    expect(region).toHaveTextContent('Saved meeting "Weekly sync".')
    expect(screen.getByLabelText('Meeting name')).toHaveValue('')
  })

  it('has a visible label on the name field (A11Y-1)', () => {
    renderSaved()
    expect(screen.getByLabelText('Meeting name')).toHaveAttribute('type', 'text')
  })
})

describe('meeting name (AC-28, A11Y-5)', () => {
  it('shows an error next to an empty name and saves nothing', async () => {
    const { onSave, user } = renderSaved()
    await saveAs(user, '')

    const field = screen.getByLabelText('Meeting name')
    expect(onSave).not.toHaveBeenCalled()
    expect(field).toBeInvalid()
    const errorId = field.getAttribute('aria-describedby') as string
    expect(document.getElementById(errorId)).toHaveTextContent('Enter a meeting name.')
  })

  it('treats a name of only spaces as empty', async () => {
    const { onSave, user } = renderSaved()
    await saveAs(user, '   ')

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Enter a meeting name.')).toBeInTheDocument()
  })

  it('announces the name error through a live region that was already there (A11Y-6)', async () => {
    const { user } = renderSaved()
    const form = screen.getByRole('form', { name: 'Save meeting' })
    const region = form.querySelector('[aria-live="polite"]')
    expect(region).not.toBeNull()

    await saveAs(user, '')

    expect(region).toHaveTextContent('Enter a meeting name.')
  })

  it('removes leading and trailing spaces from the saved name', async () => {
    const { onSave, user } = renderSaved()
    await saveAs(user, '  Weekly sync  ')

    expect(onSave.mock.calls[0][0].name).toBe('Weekly sync')
  })

  it('clears the name error after a successful save', async () => {
    const { user } = renderSaved()
    await saveAs(user, '')
    await saveAs(user, 'Weekly sync')

    expect(screen.queryByText('Enter a meeting name.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Meeting name')).not.toBeInvalid()
  })
})

describe('a meeting that cannot be saved (AC-29)', () => {
  it('shows the AC-26 message when the meeting has no lines, even with a valid duration', async () => {
    const { onSave, user } = renderSaved({ lines: [] })
    const region = notice()
    await saveAs(user, 'Weekly sync')

    expect(onSave).not.toHaveBeenCalled()
    expect(region).toHaveTextContent('Add attendees to the meeting first.')
  })

  it('shows the AC-9 message for invalid minutes', async () => {
    const { onSave, user } = renderSaved({
      setup: { hours: '1', minutes: '75', recurrence: 'once' },
    })
    const region = notice()
    await saveAs(user, 'Weekly sync')

    expect(onSave).not.toHaveBeenCalled()
    expect(region).toHaveTextContent('Enter minutes as a whole number from 0 to 59.')
  })

  it('shows the AC-9 message for invalid hours', async () => {
    const { onSave, user } = renderSaved({
      setup: { hours: '1.5', minutes: '', recurrence: 'once' },
    })
    await saveAs(user, 'Weekly sync')

    expect(onSave).not.toHaveBeenCalled()
    expect(notice()).toHaveTextContent('Enter hours as a whole number, 0 or more.')
  })

  it('shows the AC-9 message for a zero duration', async () => {
    const { onSave, user } = renderSaved({ setup: { hours: '', minutes: '', recurrence: 'once' } })
    await saveAs(user, 'Weekly sync')

    expect(onSave).not.toHaveBeenCalled()
    expect(notice()).toHaveTextContent('Enter a duration longer than 0 minutes.')
  })

  it('keeps the name so the user can fix the meeting and save again', async () => {
    const { user } = renderSaved({ lines: [] })
    await saveAs(user, 'Weekly sync')

    expect(screen.getByLabelText('Meeting name')).toHaveValue('Weekly sync')
  })

  it('also shows a name error when the name is empty', async () => {
    const { user } = renderSaved({ lines: [] })
    await saveAs(user, '')

    expect(screen.getByText('Enter a meeting name.')).toBeInTheDocument()
    expect(notice()).toHaveTextContent('Add attendees to the meeting first.')
  })
})

describe('replacing a saved meeting (AC-30, A11Y-6)', () => {
  it('asks before replacing a meeting with the same name, ignoring case and spaces', async () => {
    const { onSave, user } = renderSaved({ meetings: [WEEKLY_SYNC] })
    const region = notice()
    await saveAs(user, ' weekly SYNC ')

    expect(onSave).not.toHaveBeenCalled()
    expect(region).toHaveTextContent('A saved meeting named "Weekly sync" already exists. Replace it?')
    expect(screen.getByRole('button', { name: 'Replace' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('replaces the saved meeting when confirmed and returns focus to Save meeting', async () => {
    const { onSave, user } = renderSaved({ meetings: [WEEKLY_SYNC] })
    await saveAs(user, 'weekly sync')
    await user.click(screen.getByRole('button', { name: 'Replace' }))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][0]).toMatchObject({
      name: 'weekly sync',
      duration: { hours: 2, minutes: 0 },
      currency: 'USD',
    })
    expect(screen.queryByRole('button', { name: 'Replace' })).not.toBeInTheDocument()
    expect(notice()).toHaveTextContent('Saved meeting "weekly sync".')
    expect(screen.getByRole('button', { name: 'Save meeting' })).toHaveFocus()
  })

  it('saves nothing when cancelled and returns focus to Save meeting', async () => {
    const { onSave, user } = renderSaved({ meetings: [WEEKLY_SYNC] })
    await saveAs(user, 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Replace' })).not.toBeInTheDocument()
    expect(notice()).not.toHaveTextContent('Replace it?')
    expect(screen.getByRole('button', { name: 'Save meeting' })).toHaveFocus()
    expect(screen.getByLabelText('Meeting name')).toHaveValue('Weekly sync')
  })

  it('can be confirmed with the keyboard alone (A11Y-2)', async () => {
    const { onSave, user } = renderSaved({ meetings: [WEEKLY_SYNC] })
    await user.type(screen.getByLabelText('Meeting name'), 'Weekly sync{Enter}')
    await user.keyboard('{Enter}')

    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('does not ask when the name is new', async () => {
    const { onSave, user } = renderSaved({ meetings: [WEEKLY_SYNC] })
    await saveAs(user, 'Monthly review')

    expect(screen.queryByRole('button', { name: 'Replace' })).not.toBeInTheDocument()
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})

const MONTHLY_REVIEW: SavedMeeting = {
  name: 'Monthly review',
  lines: [
    { roleId: 'a', roleName: 'Developer', headcount: 3 },
    { roleId: 'b', roleName: 'Manager', headcount: 1 },
  ],
  duration: { hours: 2, minutes: 0 },
  recurrence: 'monthly',
  currency: 'EUR',
}

// Sorted A to Z, as the app passes them (AC-37).
const TWO_MEETINGS = [MONTHLY_REVIEW, WEEKLY_SYNC]

describe('saved meetings list (AC-35, A11Y-1)', () => {
  it('says there are no saved meetings yet and offers no load or delete action', () => {
    renderSaved({ meetings: [] })

    expect(screen.getByText('No saved meetings yet.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Saved meeting')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('lists the saved meetings in a labelled select, in the order given, with a Load button', () => {
    renderSaved({ meetings: TWO_MEETINGS })

    const select = screen.getByLabelText('Saved meeting')
    const options = within(select)
      .getAllByRole('option')
      .map((option) => option.textContent)
    expect(options).toEqual(['Monthly review', 'Weekly sync'])
    expect(screen.getByRole('button', { name: 'Load' })).toBeInTheDocument()
    expect(screen.queryByText('No saved meetings yet.')).not.toBeInTheDocument()
  })
})

describe('loading a saved meeting (AC-31, A11Y-6)', () => {
  it('loads the chosen meeting straight away when the working meeting has no lines', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS, lines: [] })
    await user.selectOptions(screen.getByLabelText('Saved meeting'), 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(onLoad).toHaveBeenCalledTimes(1)
    expect(onLoad).toHaveBeenCalledWith({
      lines: [{ roleId: 'a', headcount: 1 }],
      duration: { hours: 0, minutes: 30 },
      recurrence: 'weekly',
      currency: 'GBP',
    })
  })

  it('loads the first meeting in the list by default', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS, lines: [] })
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(onLoad).toHaveBeenCalledWith({
      lines: [
        { roleId: 'a', headcount: 3 },
        { roleId: 'b', headcount: 1 },
      ],
      duration: { hours: 2, minutes: 0 },
      recurrence: 'monthly',
      currency: 'EUR',
    })
  })

  it('announces the load through a live region that was already there', async () => {
    const { user } = renderSaved({ meetings: TWO_MEETINGS, lines: [] })
    const region = notice()
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(region).toHaveTextContent('Loaded meeting "Monthly review".')
  })
})

describe('lines for deleted roles (AC-33, A11Y-6)', () => {
  const WITH_DELETED_ROLE: SavedMeeting = {
    name: 'Design review',
    lines: [
      { roleId: 'a', roleName: 'Developer', headcount: 2 },
      { roleId: 'gone', roleName: 'Designer', headcount: 1 },
    ],
    duration: { hours: 1, minutes: 0 },
    recurrence: 'once',
    currency: 'GBP',
  }

  it('leaves out the line, says which role it was for and keeps the saved meeting unchanged', async () => {
    const saved = structuredClone(WITH_DELETED_ROLE)
    const { onLoad, user } = renderSaved({ meetings: [saved], lines: [] })
    const region = notice()
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(onLoad.mock.calls[0][0].lines).toEqual([{ roleId: 'a', headcount: 2 }])
    expect(region).toHaveTextContent(
      'The Designer line was left out because that role has been deleted.',
    )
    expect(saved).toEqual(WITH_DELETED_ROLE)
  })

  it('loads a meeting with no lines when every role in it has been deleted', async () => {
    const onlyDeleted: SavedMeeting = {
      ...WITH_DELETED_ROLE,
      lines: [{ roleId: 'gone', roleName: 'Designer', headcount: 1 }],
    }
    const { onLoad, user } = renderSaved({ meetings: [onlyDeleted], lines: [] })
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(onLoad.mock.calls[0][0].lines).toEqual([])
  })
})

describe('loading over a meeting with lines (AC-34, A11Y-2, A11Y-6)', () => {
  it('asks before replacing the current meeting and moves focus to the confirm button', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS })
    const region = notice()
    await user.selectOptions(screen.getByLabelText('Saved meeting'), 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Load' }))

    expect(onLoad).not.toHaveBeenCalled()
    expect(region).toHaveTextContent(
      'Loading "Weekly sync" replaces the current meeting. Load it anyway?',
    )
    expect(screen.getByRole('button', { name: 'Load and replace' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('loads when confirmed and returns focus to Load', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS })
    await user.selectOptions(screen.getByLabelText('Saved meeting'), 'Weekly sync')
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Load and replace' }))

    expect(onLoad).toHaveBeenCalledTimes(1)
    expect(onLoad.mock.calls[0][0]).toMatchObject({ currency: 'GBP', recurrence: 'weekly' })
    expect(screen.queryByRole('button', { name: 'Load and replace' })).not.toBeInTheDocument()
    expect(notice()).toHaveTextContent('Loaded meeting "Weekly sync".')
    expect(screen.getByRole('button', { name: 'Load' })).toHaveFocus()
  })

  it('loads nothing when cancelled and returns focus to Load', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS })
    await user.click(screen.getByRole('button', { name: 'Load' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onLoad).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Load and replace' })).not.toBeInTheDocument()
    expect(notice()).not.toHaveTextContent('Load it anyway?')
    expect(screen.getByRole('button', { name: 'Load' })).toHaveFocus()
  })

  it('can be confirmed with the keyboard alone (A11Y-2)', async () => {
    const { onLoad, user } = renderSaved({ meetings: TWO_MEETINGS })
    screen.getByRole('button', { name: 'Load' }).focus()
    await user.keyboard('{Enter}')
    await user.keyboard('{Enter}')

    expect(onLoad).toHaveBeenCalledTimes(1)
  })
})
