# Epic 01 – Project Foundation & Tooling

## Scope
Bootstrap the NeoPrism repository so contributors share an identical baseline: Vite + React + TypeScript app, strict linting/formatting, testing harness, and contributor-facing docs that describe how to run and develop the project.

## Key Deliverables
- Vite-generated project targeting React + TS + SWC with strict TypeScript config and `src/` directory layout that matches the master spec (`docs/Alpha Master Specs/NeoPrism Project Spec.md:15`).
- npm scripts: `dev`, `build`, `preview`, `test`, `lint`, `format`, plus optional `prepare` hook for Husky/lefthook.
- ESLint + Prettier configuration enforcing 2-space indentation, single quotes, trailing commas (per AGENTS.md).
- Vitest + React Testing Library configured with tsconfig path aliases and sample tests.
- Updated `README.md`/`AGENTS.md` referencing development commands, folder overview, and recommended VS Code settings/extensions (`docs/Alpha Master Specs/NeoPrism Project Spec.md:412`).

## Dependencies
None – this epic creates the foundation used everywhere else.

## Success Criteria
- Fresh clone can run `npm install && npm run dev` without modifications.
- `npm run build && npm run test -- --run` pass locally and in CI.
- Contributors understand folder layout, coding conventions, and toolchain expectations before implementing features.
