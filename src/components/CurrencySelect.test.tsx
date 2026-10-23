import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencySelect } from './CurrencySelect'

describe('CurrencySelect', () => {
  // A11Y-1
  it('has a visible label linked to the select', () => {
    render(<CurrencySelect value="GBP" onChange={() => {}} />)
    expect(screen.getByLabelText('Currency')).toBeInTheDocument()
  })

  // AC-23
  it('offers exactly pounds, US dollars, Canadian dollars and euros', () => {
    render(<CurrencySelect value="GBP" onChange={() => {}} />)
    const options = screen.getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual([
      'Pounds sterling (£, GBP)',
      'US dollars (US$, USD)',
      'Canadian dollars (CA$, CAD)',
      'Euros (€, EUR)',
    ])
  })

  it('shows the current value as selected', () => {
    render(<CurrencySelect value="EUR" onChange={() => {}} />)
    expect(screen.getByLabelText('Currency')).toHaveValue('EUR')
  })

  it('reports the chosen currency code', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencySelect value="GBP" onChange={onChange} />)
    await user.selectOptions(screen.getByLabelText('Currency'), 'CAD')
    expect(onChange).toHaveBeenCalledWith('CAD')
  })
})
