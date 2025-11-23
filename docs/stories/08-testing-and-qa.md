# Epic 08 Stories – Testing, QA, and Release Readiness

## Story 08.01 – Shared Test Utilities & Coverage Enforcement
**Goal:** Harden the Vitest/RTL setup created earlier with helpers and coverage reporting.
**Acceptance Criteria:**
- Introduce `test/setup.ts` with custom render helper, canvas mocks, and ILBM fixture loader.
- `npm run test:ci` runs `vitest run --coverage` and fails if coverage below agreed thresholds (e.g., 80% statements/branches).
- Document how to run CI tests locally in README/AGENTS.

## Story 08.02 – Algorithm & Command Unit Tests
**Goal:** Provide deterministic coverage for core algorithms and command stack behavior.
**Acceptance Criteria:**
- Tests cover flood fill edge cases, line/rect generation, palette diffing, undo/redo limit enforcement, and ILBM parsing.
- Use snapshot-independent assertions verifying pixel buffers before/after operations.
- Test suite executes in <3s on CI hardware.

## Story 08.03 – Integration Tests for Tooling & Persistence
**Goal:** Simulate real workflows end-to-end.
**Acceptance Criteria:**
- Integration tests draw strokes, perform undo/redo, import ILBM, save/load JSON, and export PNG using mocks where needed.
- React Testing Library interacts with toolbar/menus to ensure UI wiring remains intact.
- Failures provide actionable diff output instead of binary blobs.

## Story 08.04 – Manual QA Checklist & Release Notes Template
**Goal:** Capture human verification steps.
**Acceptance Criteria:**
- `docs/qa-checklist.md` lists manual steps: multi-zoom drawing, ILBM import, save/load, PNG export, palette edits, grid toggle, keyboard shortcuts.
- README/AGENTS link to the checklist; include instructions for logging defects.
- Provide release notes template referencing checklist completion.
