# Repository Guidelines

## Project Structure & Module Organization
The repo root contains `README.md`, `AGENTS.md`, `docs/` (epics, stories, and the master specs under `docs/Alpha Master Specs/`), plus the `src/` tree. Follow the SwankyPaint project spec for layout: `src/app`, `src/components`, `src/state`, `src/rendering`, `src/canvas`, `src/iff`, `src/utils`, `src/assets`, `src/styles`. Keep assets in `src/assets`, colocate component styles with components, and place Vitest suites alongside modules or under `__tests__`. Use `docs/` for specs/design only—no executable code there.

## Build, Test, and Development Commands
Run `npm install` (or `pnpm install`) once to pull the Vite + React + TypeScript toolchain. `npm run dev` starts the Vite dev server with hot module reload. `npm run build` produces the production bundle plus type checking. `npm run preview` serves the built bundle locally for smoke testing. `npm run test` runs Vitest in watch mode; `npm run test:run` (or `test:coverage`) supports CI.

## Coding Style & Naming Conventions
TypeScript everywhere, targeting strict mode. Prefer function components with hooks; class components are out of scope. Use 2-space indentation, single quotes, and trailing commas (handled by Prettier). Name components in `PascalCase`, hooks/utilities in `camelCase`, and Zustand stores in `useThingStore` form. Group commands under `state/commands` and tools under `state/tools`, each exporting an interface plus specific implementations. Run `npm run lint` before pushing and ensure the Husky `lint-staged` hook (install via `npm run prepare`) runs cleanly; no unchecked warnings.

## Testing Guidelines
Vitest drives unit tests; React Testing Library covers UI surfaces while low-level drawing/math helpers get pure unit tests. Mirror source paths (`src/state/undoRedo.test.ts`, `src/canvas/floodFill.test.ts`, etc.) and use descriptive `describe` blocks documenting the tool or command being verified. Target broad coverage of command undo/redo flows, flood fill edge cases, and ILBM parsing per the specs. Add regression tests whenever bugs affect rendering, palette edits, or file import/export.

## Commit & Pull Request Guidelines
Commits are small, imperative, and scoped (e.g., `Add flood fill regression tests`). Reference issue IDs in the summary when applicable. For PRs, include: purpose, high-level approach, testing evidence (`npm run test:run`, screenshots for UI), and any spec sections touched. Request design review when modifying spec documents, and tag another contributor for state-management or parser changes.
