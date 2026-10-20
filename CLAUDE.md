# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current state

The repo currently contains only the approved spec (`specs/001-meeting-cost-calculator.md`). There is no source code, `package.json`, or build tooling yet; `docs/` is empty. The project follows the walkthrough in `../04-spec-driven-development-guide.md` (one directory up), which is a demo of the spec-driven method, so the commit history and docs are part of the deliverable.

Planned stages, each ending in a commit and tag: `spec-approved` (done) → `plan-approved` (`docs/PLAN.md`, `docs/TASKS.md`, `docs/TRACEABILITY.md`) → task-by-task build → a change request handled via a new/updated spec. Task 1 is scaffolding plus a GitHub Pages deployment workflow. `docs/BUILD-LOG.md` is the user's diary; don't write it unprompted.

## Source of truth
- specs/ is the source of truth. Never implement behaviour that is not in an
  approved spec.
- If a spec is unclear or wrong, stop and ask. Propose a spec change; don't
  work around it in code.

## Workflow
- Work one task from docs/TASKS.md at a time.
- Every task references the acceptance criteria (AC-x) it satisfies.
- Write or update tests for those criteria first, then the code.
- After each task: run tests, lint and build, tick the task in TASKS.md,
  update docs/TRACEABILITY.md, then stop for my review.

## Tech
- Vite + React + TypeScript, Vitest + React Testing Library.
- Plain CSS modules. No extra dependencies without asking.
- Commands: `npm run dev`, `npm test`, `npm run build`, `npm run lint`.

## Style
- Small functions, clear names, no clever one-liners.
- Accessible by default: labels, keyboard support, visible focus.

