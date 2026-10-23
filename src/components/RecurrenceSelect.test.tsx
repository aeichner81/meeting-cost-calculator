import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecurrenceSelect } from './RecurrenceSelect'

describe('RecurrenceSelect', () => {
  // A11Y-1
  it('has a visible label linked to the select', () => {
    render(<RecurrenceSelect value="once" onChange={() => {}} />)
    expect(screen.getByLabelText('Recurrence')).toBeInTheDocument()
  })

  // AC-11
  it('offers once, daily, weekly, fortnightly and monthly', () => {
    render(<RecurrenceSelect value="once" onChange={() => {}} />)
    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(['Once', 'Daily', 'Weekly', 'Fortnightly', 'Monthly'])
  })

  it('reports the chosen recurrence', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RecurrenceSelect value="once" onChange={onChange} />)
    await user.selectOptions(screen.getByLabelText('Recurrence'), 'weekly')
    expect(onChange).toHaveBeenCalledWith('weekly')
  })
})
