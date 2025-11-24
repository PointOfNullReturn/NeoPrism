# Epic 01 Stories – Project Foundation & Tooling

## Story 01.01 – Scaffold Vite + React + TypeScript _(Status: ✅ Completed)_
**Goal:** Create the NeoPrism codebase with Vite (React + TS + SWC) and the directory skeleton described in the master spec.
**Acceptance Criteria:**
- `npm create vite@latest neoprism -- --template react-swc-ts` (or equivalent) initializes the project; files moved into this repo root.
- `tsconfig.json` uses `"strict": true`, path alias `@/*` for `src/`.
- Folder structure contains `src/app`, `src/components`, `src/state`, `src/rendering`, `src/canvas`, `src/iff`, `src/utils`, `src/assets`, `src/styles`, and placeholder files for each.
- `npm run dev` starts the default Vite server without runtime or type errors.

## Story 01.02 – Configure ESLint/Prettier & Formatting Hooks _(Status: ✅ Completed)_
**Goal:** Ensure consistent linting/formatting with automated enforcement.
**Acceptance Criteria:**
- `.eslintrc` extends `eslint:recommended`, `plugin:react-hooks/recommended`, `@typescript-eslint/recommended`, disables rules conflicting with Prettier.
- `.prettierrc` enforces 2-space tabs, single quotes, trailing commas, and semicolons.
- Add npm scripts `lint`, `lint:fix`, `format` and document them in README.
- Optional Husky/lefthook `pre-commit` script runs `npm run lint` (and `npm run test -- --run` if desired); instructions exist for installing hooks.

## Story 01.03 – Establish Vitest + React Testing Library Harness _(Status: ✅ Completed)_
**Goal:** Provide automated testing foundation referenced by later epics.
**Acceptance Criteria:**
- `vitest.config.ts` resolves `@/*`, configures jsdom, and includes setup file registering RTL custom matchers.
- Example tests: one React component smoke test inside `src/components/__tests__`, one utility test inside `src/utils/__tests__`.
- npm scripts `test` (watch), `test:run` (non-watch), `test:coverage` documented and passing.

## Story 01.04 – Contributor Docs & VS Code Settings _(Status: ✅ Completed)_
**Goal:** Equip contributors with clear guidance.
**Acceptance Criteria:**
- `README.md` updated with development commands, folder overview, and links to `AGENTS.md` + `docs/epics/README.md`.
- `.vscode/settings.json` (optional) sets default formatter (Prettier), tab size 2, `editor.formatOnSave` true, TypeScript SDK to workspace.
- Recommended VS Code extensions listed either in README or `AGENTS.md` (ES7+ React Snippets, Prettier, ESLint, GitLens, Hex Editor, Error Lens, Vitest Runner).
