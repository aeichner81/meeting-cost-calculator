import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import globalCss from './index.css?raw'
import roleFormCss from './components/RoleForm.module.css?raw'
import meetingBuilderCss from './components/MeetingBuilder.module.css?raw'
import breakdownCss from './components/CostBreakdown.module.css?raw'
import appCss from './App.module.css?raw'

type User = ReturnType<typeof userEvent.setup>

async function addRole(user: User, name: string, salary: string) {
  await user.type(screen.getByLabelText('Role name'), name)
  await user.type(screen.getByLabelText('Annual salary'), salary)
  await user.click(screen.getByRole('button', { name: 'Add role' }))
}

// The accessibility audit (task 16) over the whole app: structure, labels, errors, keyboard, CSS.
describe('labels (A11Y-1)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('gives every form field a visible, linked label and no placeholder', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await addRole(user, 'Developer', '36400')

    const fields = container.querySelectorAll('input, select, textarea')
    expect(fields.length).toBeGreaterThanOrEqual(8)
    fields.forEach((field) => {
      const label = field.id ? container.querySelector(`label[for="${field.id}"]`) : null
      expect(label, `label for ${field.outerHTML}`).not.toBeNull()
      expect(label?.textContent?.trim()).not.toBe('')
      expect(field).not.toHaveAttribute('placeholder')
    })
  })

  it('uses every label the spec names', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    for (const name of [
      'Role name',
      'Annual salary',
      'Role',
      'Headcount',
      'Hours',
      'Minutes',
      'Recurrence',
      'Currency',
    ]) {
      expect(screen.getByLabelText(name)).toBeInTheDocument()
    }
  })
})

describe('structure (A11Y-7)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps one h1 and never skips a heading level', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')

    const levels = screen.getAllByRole('heading').map((heading) => Number(heading.tagName[1]))
    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
    levels.slice(1).forEach((level, index) => {
      expect(level - levels[index]).toBeLessThanOrEqual(1)
    })
  })

  it('uses real buttons for every action and no clickable non-controls', async () => {
    const user = userEvent.setup()
    const { container } = render(<App />)
    await addRole(user, 'Developer', '36400')

    expect(container.querySelectorAll('[role="button"]')).toHaveLength(0)
    expect(container.querySelectorAll('div[onclick], span[onclick]')).toHaveLength(0)
    screen.getAllByRole('button').forEach((button) => {
      expect(button.tagName).toBe('BUTTON')
      expect(button).toHaveAttribute('type')
    })
  })

  it('shows the breakdown as a table with column and row headers', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))
    await user.type(screen.getByLabelText('Hours'), '1')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))

    const table = screen.getByRole('table')
    expect(within(table).getAllByRole('columnheader').length).toBeGreaterThan(0)
    expect(within(table).getAllByRole('rowheader').length).toBeGreaterThan(0)
  })
})

describe('errors (A11Y-5, A11Y-6)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('links each role-form error to its field and spells it out in text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Add role' }))

    const name = screen.getByLabelText('Role name')
    const salary = screen.getByLabelText('Annual salary')
    for (const field of [name, salary]) {
      expect(field).toBeInvalid()
      const errorId = field.getAttribute('aria-describedby')
      expect(errorId).toBeTruthy()
      const message = document.getElementById(errorId as string)
      expect(message?.textContent?.trim()).not.toBe('')
    }
  })

  it('marks errors with text as well as colour', () => {
    // The "Error: " prefix is generated content, so it must be in the stylesheets.
    expect(roleFormCss).toMatch(/\.error::before\s*\{[^}]*content:\s*'Error: '/)
    expect(meetingBuilderCss).toMatch(/\.error::before\s*\{[^}]*content:\s*'Error: '/)
  })

  it('announces a role-form error through a live region that was already on the page', async () => {
    const user = userEvent.setup()
    render(<App />)
    const regionBefore = screen.getByLabelText('Role name').closest('form')?.querySelector('[aria-live="polite"]')
    expect(regionBefore).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Add role' }))

    expect(regionBefore).toHaveTextContent('Enter a role name.')
  })

  it('announces a headcount error through a live region that was already on the page', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    const form = screen.getByRole('form', { name: 'Add to meeting' })
    const regionBefore = form.querySelector('[aria-live="polite"]')
    expect(regionBefore).not.toBeNull()

    await user.clear(screen.getByLabelText('Headcount'))
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))

    expect(regionBefore).not.toBeEmptyDOMElement()
  })

  it('announces the calculated total and the duration error', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addRole(user, 'Developer', '36400')
    await user.click(screen.getByRole('button', { name: 'Add to meeting' }))

    const status = screen
      .getAllByRole('status')
      .find((region) => region.getAttribute('aria-live') === 'polite') as HTMLElement
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(status).not.toBeEmptyDOMElement()

    await user.type(screen.getByLabelText('Hours'), '1')
    await user.click(screen.getByRole('button', { name: 'Calculate' }))
    expect(status).toHaveTextContent('Total cost: £20.00')
  })
})

describe('keyboard (A11Y-2)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('completes the core flow with the keyboard alone', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(document.body)
    await user.tab() // currency
    expect(screen.getByLabelText('Currency')).toHaveFocus()
    // Arrow keys in a select are native browser behaviour that jsdom cannot simulate; see the manual walkthrough.

    await user.tab()
    expect(screen.getByLabelText('Role name')).toHaveFocus()
    await user.keyboard('Developer')
    await user.tab()
    expect(screen.getByLabelText('Annual salary')).toHaveFocus()
    await user.keyboard('36400{Enter}')
    expect(within(screen.getByRole('list')).getByText('Developer')).toBeInTheDocument()

    await user.tab() // Add role
    await user.tab() // Edit Developer
    await user.tab() // Delete Developer
    await user.tab() // role select
    expect(screen.getByLabelText('Role')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Headcount')).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('list', { name: 'Meeting lines' })).toBeInTheDocument()

    await user.tab() // Add to meeting
    await user.tab()
    expect(screen.getByLabelText('Hours')).toHaveFocus()
    await user.keyboard('2')
    await user.tab()
    expect(screen.getByLabelText('Minutes')).toHaveFocus()
    await user.tab()
    expect(screen.getByLabelText('Recurrence')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Calculate' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('Total cost: £40.00')).toBeInTheDocument()
  })

  it('does not trap focus: Shift+Tab walks back out of the form', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByLabelText('Annual salary'))
    await user.tab({ shift: true })
    expect(screen.getByLabelText('Role name')).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByLabelText('Currency')).toHaveFocus()
  })

  it('has no positive tabindex that would reorder focus', () => {
    const { container } = render(<App />)
    container.querySelectorAll('[tabindex]').forEach((element) => {
      expect(Number(element.getAttribute('tabindex'))).toBeLessThanOrEqual(0)
    })
  })
})

// Vitest runs with css: false, so focus and contrast are checked from the stylesheet source.
const allCss = [globalCss, roleFormCss, meetingBuilderCss, breakdownCss, appCss].join('\n')

describe('visible focus (A11Y-3)', () => {
  it('never removes the browser focus outline', () => {
    expect(allCss).not.toMatch(/outline\s*:\s*(none|0)\b/)
    expect(allCss).not.toMatch(/outline-style\s*:\s*none/)
    expect(allCss).not.toMatch(/:focus(-visible)?\s*\{[^}]*outline/)
  })
})

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255)
  const [red, green, blue] = channels.map((value) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(foreground: string, background: string): number {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('contrast (A11Y-4)', () => {
  const white = '#ffffff'

  it('has the helper right on known values', () => {
    expect(contrast('#000000', white)).toBeCloseTo(21, 0)
    expect(contrast('#777777', white)).toBeLessThan(4.5)
  })

  it('keeps every hard-coded text colour at 4.5:1 on a white page', () => {
    // Colours are chosen once, as --color-* tokens in index.css (task 20), so those count as text colours.
    const textColours = [
      ...allCss.matchAll(
        /(?<![-\w])(?:--color-(?:text|muted|accent|error)|color):\s*(#[0-9a-fA-F]{6})\b/g,
      ),
    ].map((match) => match[1])
    expect(textColours.length).toBeGreaterThan(0)
    textColours.forEach((colour) => {
      expect(contrast(colour, white), colour).toBeGreaterThanOrEqual(4.5)
    })
  })

  it('keeps every hard-coded border colour at 3:1 on a white page', () => {
    const borderColours = [...allCss.matchAll(/border[\w-]*:[^;}]*?(#[0-9a-fA-F]{6})\b/g)].map(
      (match) => match[1],
    )
    expect(borderColours.length).toBeGreaterThan(0)
    borderColours.forEach((colour) => {
      expect(contrast(colour, white), colour).toBeGreaterThanOrEqual(3)
    })
  })

  it('leaves page, input and focus colours to the browser defaults', () => {
    // Default black on white text and the default focus ring both pass; overriding them needs a re-check.
    expect(allCss).not.toMatch(/background(-color)?\s*:/)
  })
})
