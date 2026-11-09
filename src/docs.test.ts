import spec from '../specs/001-meeting-cost-calculator.md?raw'
import traceability from '../docs/TRACEABILITY.md?raw'
import readme from '../README.md?raw'
import tasks from '../docs/TASKS.md?raw'

// Documentation checks for task 17: the traceability table is complete and honest, and the README tells the story.

// Source and test files in src/, as paths such as "src/App.tsx". The globs are lazy, so only the keys are read.
const sourceFiles = new Set(
  Object.keys(import.meta.glob('/src/**/*.{ts,tsx,css}')).map((path) => path.slice(1)),
)

interface Row {
  id: string
  cells: string[]
}

function traceabilityRows(): Row[] {
  return traceability
    .split('\n')
    .filter((line) => /^\| (AC|A11Y|UX)-\d+ /.test(line))
    .map((line) => {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim())
      return { id: cells[0], cells }
    })
}

// Task numbers ticked in TASKS.md, such as "18" for "- [x] **18. Delete cascade.**".
const doneTasks = new Set([...tasks.matchAll(/^- \[x\] \*\*(\d+)\./gm)].map((match) => match[1]))

// A row may say "pending" only while none of its tasks is ticked.
function isPending(task: string, testCell: string): boolean {
  const numbers = task.split(',').map((part) => part.trim())
  return /^pending/.test(testCell) && numbers.every((number) => !doneTasks.has(number))
}

function specIds(pattern: RegExp): string[] {
  return [...new Set([...spec.matchAll(pattern)].map((match) => match[1]))]
}

describe('traceability table', () => {
  const rows = traceabilityRows()

  it('has a row for every acceptance criterion in the spec', () => {
    const ids = specIds(/^- (AC-\d+) \(/gm)
    expect(ids).toHaveLength(26)
    expect(rows.map((row) => row.id)).toEqual(expect.arrayContaining(ids))
  })

  it('has a row for every visual design requirement in the spec', () => {
    const ids = specIds(/^\s+- (UX-\d+) \*\*/gm)
    expect(ids).toHaveLength(6)
    expect(rows.map((row) => row.id)).toEqual(expect.arrayContaining(ids))
  })

  it('has a row for every accessibility requirement in the spec', () => {
    const ids = specIds(/^\s+- (A11Y-\d+) \*\*/gm)
    expect(ids).toHaveLength(9)
    expect(rows.map((row) => row.id)).toEqual(expect.arrayContaining(ids))
  })

  it.each(rows.map((row) => [row.id, row.cells] as const))('%s has a task, a test and code', (_id, cells) => {
    // Columns: id, summary or requirement, [story,] task, test, code. Task, test and code are the last three.
    const [task, test, code] = cells.slice(-3)
    expect(task).not.toBe('')
    // Work that is not built yet may say "pending". Once its task is ticked the row needs real paths.
    if (isPending(task, test)) {
      expect(code).toMatch(/^pending/)
      return
    }
    expect(test).toMatch(/`src\//)
    expect(code).toMatch(/`(src\/|index\.html)/)
  })

  it('names only files that exist', () => {
    const paths = [...traceability.matchAll(/`((?:src\/)[^`\s]+)`/g)].map((match) => match[1])
    expect(paths.length).toBeGreaterThan(50)
    const missing = paths.filter((path) => !sourceFiles.has(path))
    expect(missing).toEqual([])
  })

  it('keeps no "still to run" wording for work that is done', () => {
    expect(traceability).not.toMatch(/rest in task 16|audited in task 16/)
  })

  it('lists any gap honestly: open manual checks stay unticked until someone runs them', () => {
    expect(traceability).toMatch(/Manual accessibility checks/)
    expect(traceability).toMatch(/- \[ \] axe DevTools/)
  })
})

describe('README', () => {
  it.each([
    'Live demo',
    'What this repo demonstrates',
    'The workflow',
    'Follow the story',
    'What I learned',
    'Numbers',
    'Run it locally',
  ])('has a "%s" section', (heading) => {
    expect(readme).toMatch(new RegExp(`^## ${heading}`, 'm'))
  })

  it('has a single h1 and starts with the pitch', () => {
    expect(readme.match(/^# /gm)).toHaveLength(1)
  })

  it('links the live site and the tags that mark each stage', () => {
    expect(readme).toContain('https://aeichner81.github.io/meeting-cost-calculator/')
    expect(readme).toContain('spec-approved')
    expect(readme).toContain('plan-approved')
  })

  it('does not leave unfinished placeholders', () => {
    expect(readme).not.toMatch(/TODO|TBD|XXX/)
  })
})
