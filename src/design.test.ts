import globalCss from './index.css?raw'
import appCss from './App.module.css?raw'
import breakdownCss from './components/CostBreakdown.module.css?raw'
import formCss from './components/MeetingBuilder.module.css?raw'
import roleFormCss from './components/RoleForm.module.css?raw'
import rolesPanelCss from './components/RolesPanel.module.css?raw'
import resultsCss from './components/Results.module.css?raw'
import html from '../index.html?raw'

// Vitest runs with css: false, so these tests read the stylesheet source (spec 001 revision 2, UX-1 to UX-6).

const sheets: Record<string, string> = {
  'index.css': globalCss,
  'App.module.css': appCss,
  'CostBreakdown.module.css': breakdownCss,
  'MeetingBuilder.module.css': formCss,
  'RoleForm.module.css': roleFormCss,
  'RolesPanel.module.css': rolesPanelCss,
  'Results.module.css': resultsCss,
}
const allCss = Object.values(sheets).join('\n')

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

// Token name to value, from the :root rule.
function tokens(): Map<string, string> {
  const entries = [...rule(globalCss, ':root').matchAll(/(--[\w-]+):\s*([^;]+);/g)]
  return new Map(entries.map((entry) => [entry[1], entry[2].trim()]))
}

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

describe('design tokens (UX-3)', () => {
  // UX-3
  it('defines every token once, in one :root rule', () => {
    const declared = [...stripComments(allCss).matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])
    expect(declared.length).toBeGreaterThan(0)
    expect(new Set(declared).size).toBe(declared.length)
    expect(stripComments(allCss).match(/:root\s*\{/g)).toHaveLength(1)
  })

  // UX-3
  it('has one accent colour plus neutrals', () => {
    const colourTokens = [...tokens().keys()].filter((name) => name.startsWith('--color-'))
    const accents = colourTokens.filter((name) => name.includes('accent'))
    expect(accents).toEqual(['--color-accent'])
    expect(colourTokens).toEqual(
      expect.arrayContaining(['--color-text', '--color-muted', '--color-border', '--color-error']),
    )
  })

  // UX-3
  it('keeps hex colours inside :root so a colour is only ever chosen once', () => {
    const outsideRoot = stripComments(allCss).replace(/:root\s*\{[^}]*\}/, '')
    expect(outsideRoot).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  // UX-3, UX-6 (A11Y-4)
  it('keeps the text, accent and error colours at 4.5:1 and borders at 3:1 on white', () => {
    const colours = tokens()
    const white = '#ffffff'
    ;['--color-text', '--color-muted', '--color-accent', '--color-error'].forEach((name) => {
      expect(contrast(colours.get(name) ?? '', white), name).toBeGreaterThanOrEqual(4.5)
    })
    expect(contrast(colours.get('--color-border') ?? '', white)).toBeGreaterThanOrEqual(3)
  })

  // UX-3
  it('uses one system font stack and no web fonts', () => {
    const font = tokens().get('--font-family') ?? ''
    expect(font).toMatch(/system-ui/)
    expect(font).toMatch(/sans-serif$/)
    expect(rule(globalCss, 'body')).toMatch(/font-family:\s*var\(--font-family\)/)
    expect(allCss).not.toMatch(/@font-face/)
    expect(allCss.match(/font-family\s*:/g)).toHaveLength(2) // the token and body
  })

  // UX-3, UX-6 (AC-18)
  it('makes no external requests from a stylesheet or the page', () => {
    expect(allCss).not.toMatch(/@import|url\(|https?:\/\//)
    expect(html).not.toMatch(/<link[^>]+href="https?:/)
    expect(html).not.toMatch(/<script[^>]+src="https?:/)
  })

  // UX-3
  it('defines a small fixed set of sizes and spacing steps', () => {
    const names = [...tokens().keys()]
    const sizes = names.filter((name) => name.startsWith('--size-'))
    const spaces = names.filter((name) => name.startsWith('--space-'))
    expect(sizes.length).toBeGreaterThanOrEqual(3)
    expect(sizes.length).toBeLessThanOrEqual(6)
    expect(spaces.length).toBeGreaterThanOrEqual(3)
    expect(spaces.length).toBeLessThanOrEqual(6)
  })

  // UX-3
  it('uses spacing and size tokens rather than ad hoc lengths in component stylesheets', () => {
    const components = [appCss, breakdownCss, formCss, roleFormCss, rolesPanelCss, resultsCss]
      .map(stripComments)
      .join('\n')
    const declarations = [...components.matchAll(/(?:gap|margin|padding)[\w-]*:\s*([^;]+);/g)]
    declarations.forEach(([, value]) => {
      expect(value, value).not.toMatch(/[\d.]+rem|[\d.]+px/)
    })
  })
})

describe('field alignment (UX-1)', () => {
  // UX-1
  it('puts labels above their fields, left-aligned, in a column', () => {
    const field = rule(formCss, '.field')
    expect(field).toMatch(/display:\s*flex/)
    expect(field).toMatch(/flex-direction:\s*column/)
    expect(rule(roleFormCss, '.field')).toMatch(/flex-direction:\s*column/)
  })

  // UX-1
  it('gives fields of the same kind the same width on a shared grid', () => {
    expect(rule(formCss, '.form')).toMatch(/display:\s*grid/)
    expect(rule(formCss, '.form')).toMatch(/grid-template-columns:\s*repeat\(/)
    expect(rule(roleFormCss, '.form')).toMatch(/display:\s*grid/)
    expect(rule(roleFormCss, '.form')).toMatch(/grid-template-columns:\s*repeat\(/)
  })

  // UX-1
  it('gives inputs, selects and buttons one row height and aligns buttons to the field row', () => {
    expect(rule(globalCss, 'button')).toMatch(/min-height:\s*2\.5rem/)
    expect(rule(globalCss, 'input')).toMatch(/min-height:\s*2\.5rem/)
    expect(rule(globalCss, 'select')).toMatch(/min-height:\s*2\.5rem/)
    expect(rule(formCss, '.form')).toMatch(/align-items:\s*start/)
  })

  // UX-1, AC-20
  it('stacks the side-by-side fields into one column on a phone', () => {
    const phone = stripComments(formCss).match(/@media \(max-width: [\d.]+rem\)\s*\{([\s\S]*)\}\s*$/)
    expect(phone).not.toBeNull()
    expect(phone?.[1]).toMatch(/grid-template-columns:\s*1fr/)
  })
})

describe('results alignment (UX-2)', () => {
  // UX-2
  it('right-aligns money and counts in the breakdown with tabular figures', () => {
    expect(rule(breakdownCss, '.table td:last-child')).toMatch(/text-align:\s*right/)
    expect(rule(breakdownCss, '.table th:last-child')).toMatch(/text-align:\s*right/)
    expect(rule(breakdownCss, '.number')).toMatch(/text-align:\s*right/)
    expect(rule(breakdownCss, '.number')).toMatch(/font-variant-numeric:\s*tabular-nums/)
    expect(rule(breakdownCss, '.table td:last-child')).toMatch(/font-variant-numeric:\s*tabular-nums/)
  })

  // UX-2
  it('right-aligns salaries in the role list with tabular figures', () => {
    expect(rule(rolesPanelCss, '.amount')).toMatch(/text-align:\s*right/)
    expect(rule(rolesPanelCss, '.amount')).toMatch(/font-variant-numeric:\s*tabular-nums/)
  })

  // UX-2
  it('right-aligns the recurring figures with tabular figures', () => {
    expect(rule(resultsCss, '.figure')).toMatch(/font-variant-numeric:\s*tabular-nums/)
    expect(rule(resultsCss, '.figure')).toMatch(/text-align:\s*right/)
    expect(rule(resultsCss, '.total')).toMatch(/text-align:\s*right/)
  })

  // UX-2
  it('makes the total the largest text on the page', () => {
    const sizes = tokens()
    const rem = (name: string) => Number.parseFloat(sizes.get(name) ?? '0')
    const totalSize = rule(resultsCss, '.total').match(/font-size:\s*var\((--size-[\w-]+)\)/)
    expect(totalSize).not.toBeNull()
    const largest = Math.max(
      ...[...sizes.keys()].filter((name) => name.startsWith('--size-')).map(rem),
    )
    expect(rem(totalSize?.[1] ?? '')).toBe(largest)
    expect(rule(resultsCss, '.total')).toMatch(/font-weight:\s*(bold|[6-9]00)/)
  })

  // UX-2
  it('groups the per-occurrence, monthly and yearly figures in one results block', () => {
    expect(rule(resultsCss, '.results')).toMatch(/border/)
    expect(rule(resultsCss, '.total')).toBeTruthy()
    expect(rule(resultsCss, '.figure')).toBeTruthy()
  })
})

describe('hierarchy and states (UX-4, UX-5)', () => {
  // UX-4
  it('gives every section the same spacing and heading sizes', () => {
    expect(rule(appCss, '.section')).toMatch(/margin-top:\s*var\(--space-/)
    expect(rule(appCss, '.section')).toMatch(/border-top/)
    expect(rule(globalCss, 'h1')).toMatch(/font-size:\s*var\(--size-/)
    expect(rule(globalCss, 'h2')).toMatch(/font-size:\s*var\(--size-/)
  })

  // UX-4
  it('styles primary, secondary and destructive buttons differently', () => {
    const primary = rule(globalCss, 'button[type="submit"]')
    const secondary = rule(globalCss, 'button')
    const destructive = rule(globalCss, '.destructive')
    expect(primary).toMatch(/border-color:\s*var\(--color-accent\)/)
    expect(primary).toMatch(/font-weight:\s*bold/)
    expect(destructive).toMatch(/color:\s*var\(--color-error\)/)
    expect(secondary).not.toMatch(/--color-accent|--color-error/)
    expect(new Set([primary, secondary, destructive]).size).toBe(3)
  })

  // UX-5
  it('shares one hover, disabled and error style across controls', () => {
    expect(rule(globalCss, 'button:hover')).toBeTruthy()
    expect(rule(globalCss, 'input:hover')).toBeTruthy()
    expect(rule(globalCss, 'button:disabled')).toMatch(/opacity|cursor:\s*not-allowed/)
    expect(rule(globalCss, 'input[aria-invalid="true"]')).toMatch(/border-color:\s*var\(--color-error\)/)
    expect(rule(globalCss, 'select[aria-invalid="true"]')).toMatch(/border-color:\s*var\(--color-error\)/)
    expect(rule(globalCss, 'input')).toMatch(/border:\s*[\w.]+ solid var\(--color-border\)/)
    expect(rule(globalCss, 'select')).toMatch(/border:\s*[\w.]+ solid var\(--color-border\)/)
    expect(rule(globalCss, 'button')).toMatch(/border:\s*[\w.]+ solid var\(--color-border\)/)
  })

  // UX-5, A11Y-5
  it('keeps errors as text with a prefix, not colour alone', () => {
    expect(rule(formCss, '.error::before')).toMatch(/content:\s*'Error: '/)
    expect(rule(roleFormCss, '.error::before')).toMatch(/content:\s*'Error: '/)
    expect(rule(formCss, '.error')).toMatch(/color:\s*var\(--color-error\)/)
  })

  // UX-5, UX-6 (A11Y-3)
  it('leaves the focus indicator to the browser default', () => {
    expect(allCss).not.toMatch(/outline/)
  })
})
