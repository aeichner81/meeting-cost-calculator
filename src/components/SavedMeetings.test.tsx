import { render, screen } from '@testing-library/react'
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
  const setup = options.setup ?? VALID_SETUP
  render(
    <SavedMeetings
      meetings={options.meetings ?? []}
      roles={ROLES}
      lines={options.lines ?? LINES}
      currency={options.currency ?? 'USD'}
      readSetup={() => setup}
      onSave={onSave}
    />,
  )
  return { onSave, user: userEvent.setup() }
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
