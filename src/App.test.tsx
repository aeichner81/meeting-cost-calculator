import { render, screen } from '@testing-library/react'
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
