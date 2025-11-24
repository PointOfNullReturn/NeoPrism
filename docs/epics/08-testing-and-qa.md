# Epic 08 – Testing, QA, and Release Readiness

## Scope
Finalize automated and manual testing coverage plus QA documentation to keep the MVP stable (`docs/Alpha Master Specs/NeoPrism Project Spec.md:387`).

## Key Deliverables
- Expanded Vitest/RTL harness with shared helpers, canvas mocks, and ILBM fixtures.
- Unit test suites for flood fill, line/rect, palette ops, undo stack, ILBM parsing, and persistence.
- Integration tests simulating drawing workflows, undo/redo cycles, and import/export scenarios.
- Manual QA checklist documenting smoke steps (multi-zoom drawing, ILBM import, save/load, PNG export, palette edits, grid toggle).

## Dependencies
- Epics 01–07 (tests validate completed functionality).

## Success Criteria
- `npm run test -- --run --coverage` passes with agreed coverage thresholds.
- Regression tests exist for all previously fixed production issues.
- QA checklist linked from README/AGENTS to guide release verification.
