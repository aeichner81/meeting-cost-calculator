import globalCss from './index.css?raw'
import html from '../index.html?raw'
import breakdownCss from './components/CostBreakdown.module.css?raw'

// Vitest runs with css: false, so layout rules cannot be measured in jsdom.
// These tests read the stylesheet source and assert the rules that deliver the criteria.

// Comments would otherwise end up in the next rule's selector.
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

// The declarations of the first rule whose selector list contains `selector`.
function rule(css: string, selector: string): string {
  const rules = [...stripComments(css).matchAll(/([^{}]+)\{([^}]*)\}/g)]
  const match = rules.find(([, selectors]) =>
    selectors.split(',').some((part) => part.trim() === selector),
  )
  if (!match) {
    throw new Error(`No rule for ${selector}`)
  }
  return match[2]
}

// A length in rem or px, as CSS pixels (1rem = 16px).
function declaredPixels(declarations: string, property: string): number {
  const match = declarations.match(new RegExp(`(?:^|[;\\s])${property}:\\s*([\\d.]+)(rem|px)`))
  if (!match) {
    throw new Error(`No ${property} declared`)
  }
  return Number(match[1]) * (match[2] === 'rem' ? 16 : 1)
}

describe('responsive layout', () => {
  // AC-20, A11Y-8
  it('sets a device-width viewport that does not block zooming', () => {
    expect(html).toMatch(/<meta name="viewport" content="[^"]*width=device-width/)
    expect(html).not.toMatch(/user-scalable\s*=\s*no|maximum-scale/)
  })

  // AC-20
  it('sizes every box to include padding and borders', () => {
    expect(rule(globalCss, '*')).toMatch(/box-sizing:\s*border-box/)
  })

  // AC-20
  it('lets form fields shrink to the screen width', () => {
    const fieldRule = rule(globalCss, 'input')
    expect(fieldRule).toMatch(/max-width:\s*100%/)
  })

  // AC-20, A11Y-8
  it('wraps long words instead of widening the page', () => {
    expect(rule(globalCss, 'body')).toMatch(/overflow-wrap:\s*anywhere/)
  })

  // AC-20
  it('keeps the cost table inside a wrapper that never widens the page', () => {
    expect(rule(breakdownCss, '.wrapper')).toMatch(/overflow-x:\s*auto/)
    expect(rule(breakdownCss, '.table')).toMatch(/width:\s*100%/)
  })

  // A11Y-9
  it.each(['button', 'input', 'select'])('makes %s at least 24 x 24 CSS pixels', (selector) => {
    const declarations = rule(globalCss, selector)
    expect(declaredPixels(declarations, 'min-height')).toBeGreaterThanOrEqual(24)
    expect(declaredPixels(declarations, 'min-width')).toBeGreaterThanOrEqual(24)
  })

  // AC-20
  it('stacks form controls on a phone-sized screen', () => {
    expect(globalCss).toMatch(/@media \(max-width: \d+(rem|px)\)/)
  })
})
