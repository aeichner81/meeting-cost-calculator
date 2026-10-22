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
