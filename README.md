# Meeting Cost Calculator

Shows a manager what a meeting costs in money, from who attends and how long it runs, and what that adds up to per month and per year if it recurs. It supplies the number; the manager decides whether the meeting is worth it.

## Live demo

https://aeichner81.github.io/meeting-cost-calculator/

Add roles with an annual salary, build a meeting from roles and headcount, enter the duration and press Calculate. Roles and currency stay in your browser's local storage. Salaries, roles and meetings are never sent to a server, and meetings are not saved.

## What this repo demonstrates

Spec-driven development with an AI agent (Claude Code). The code is the smaller part of the deliverable. The commit history, tags and `docs/` folder show how the work was controlled:

- **The spec is the source of truth.** `specs/001-meeting-cost-calculator.md` holds 7 user stories, 24 acceptance criteria (AC-1 to AC-24) and 9 accessibility requirements (A11Y-1 to A11Y-9). The agent is told never to build behaviour that is not in an approved spec, and to stop and propose a spec change if the spec is unclear.
- **Plan and tasks before code.** `docs/PLAN.md` records the architecture and the decisions. `docs/TASKS.md` splits the build into 17 small tasks, each naming the criteria it satisfies.
- **Tests first, one task at a time.** Each task writes tests for its criteria, then the code, then runs tests, lint and build, and stops for review. Each task is one commit.
- **Traceability.** `docs/TRACEABILITY.md` links every acceptance criterion and accessibility requirement to the tests that check it and the code that delivers it. A test (`src/docs.test.ts`) fails if a criterion in the spec has no row, a row has no test or code, or a row names a file that does not exist.

## The workflow

```
Spec -> Review -> Plan -> Tasks -> Test-first build -> Verify -> Change via spec
```

| Stage | Output | Marker |
|-------|--------|--------|
| Spec | `specs/001-meeting-cost-calculator.md` | tag `spec-approved` |
| Plan | `docs/PLAN.md`, `docs/TASKS.md`, `docs/TRACEABILITY.md` | tag `plan-approved` |
| Build | tasks 1 to 16, one commit each | commits `task 1` to `task 16` |
| Verify | `docs/TRACEABILITY.md` completed, gaps listed | task 17 |

The last stage of the method, a change request handled through a new or updated spec, has not been done yet.

## Follow the story

- Spec approved: [`spec-approved`](https://github.com/aeichner81/meeting-cost-calculator/tree/spec-approved)
- Plan approved: [`plan-approved`](https://github.com/aeichner81/meeting-cost-calculator/tree/plan-approved)
- Commit history: [`task 1` to `task 17`](https://github.com/aeichner81/meeting-cost-calculator/commits/main)
- Documents: [`specs/`](specs), [`docs/PLAN.md`](docs/PLAN.md), [`docs/TASKS.md`](docs/TASKS.md), [`docs/TRACEABILITY.md`](docs/TRACEABILITY.md)

## What I learned

These come from the history of the repo.

- **The spec had a gap that only a test exposed.** AC-4 says a name of only spaces is invalid, but the first validation task let blank names through. A separate commit (`task 4-b: Reject blank role names`) fixed it. Writing the test from the criterion is what caught it.
- **An accessibility baseline is only half testable in jsdom.** Labels, heading order, error links, live regions, tab order and stylesheet rules (focus outlines, contrast, target sizes) are checked automatically. Real focus rings, browser zoom, arrow keys in selects and a screen reader are not, so they stay on an open checklist in `docs/TRACEABILITY.md` rather than being ticked off.
- **The accessibility audit found real defects.** The role and headcount errors were added to the page as they appeared instead of into a live region that already existed, so a screen reader could miss them (A11Y-6). The audit task fixed that.
- **A new dependency is a decision, not a convenience.** `jest-axe` would automate the axe check but adds a dependency, which the project rules say to ask about first, so it was left out and the check remains manual.

## Numbers

- Tasks: 17, each built and committed on its own, after the spec and plan commits.
- Acceptance criteria: 24 and 9 accessibility requirements, all in the traceability table.
- Automated tests: run `npm test` for the current count.
- Runtime dependencies: React and React DOM only.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:5173/meeting-cost-calculator/
npm test        # Vitest and React Testing Library
npm run lint
npm run build
```

Pushing to `main` runs the tests, lint and build, then deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`).
