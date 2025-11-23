# SwankyPaint Frontend Scaffold

Modern Deluxe Paint clone targeting React 19 + TypeScript + Vite. This repo already follows the architecture described in `docs/Alpha Master Specs/SwankyPaint Project Spec.md` and the ordered epics under `docs/epics/`. Each story in `docs/stories/` builds on this foundation.

## Project Structure

```
src/
  app/          // entry App + shells
  components/   // React UI pieces
  state/        // Zustand store, commands, tools
  rendering/    // canvas + pixel buffers
  canvas/       // pointer events + transforms
  iff/          // ILBM parsing
  utils/        // helpers (flood fill, color, etc.)
  assets/       // static assets
  styles/       // CSS modules/global styles
```

Docs live under `docs/`, split into `epics/` (ordered specs) and `stories/` (detailed tickets). Follow `docs/stories/backlog.md` when prioritizing work; master specs live in `docs/Alpha Master Specs/`.

## Commands

- `npm run dev` – Vite dev server with HMR
- `npm run build` – Type-check + production bundle
- `npm run preview` – Serve the built bundle
- `npm run lint` / `npm run lint:fix` – ESLint (strict React 19 + TS)
- `npm run format` / `npm run format:check` – Prettier (2 spaces, single quotes, trailing commas)
- `npm run test` – Vitest watch mode (jsdom)
- `npm run test:run` – Vitest run (CI)
- `npm run test:coverage` – Vitest run with `@vitest/coverage-v8`

Before committing, run `npm run prepare` once locally to install Husky so `npx lint-staged` executes on staged files.

## Specs & Roadmap

- [Epics overview](docs/epics/README.md)
- [Story backlog](docs/stories/backlog.md)
- [Master specs](<docs/Alpha\ Master\ Specs/SwankyPaint\ Project\ Spec.md>) _(DPaint MVP details)_

## Testing Strategy

Vitest + React Testing Library are preconfigured via `vitest.setup.ts`. Place tests next to source files (`*.test.tsx`) or under `__tests__` folders. Snapshot-less assertions are preferred; use jest-dom matchers.

## Recommended VS Code Setup

- Install extensions: Prettier, ESLint, ES7+ React Snippets, GitLens, Hex Editor, Error Lens, Vitest Runner.
- Workspace settings (`.vscode/settings.json`) enforce Prettier as default formatter, 2-space tabs, format-on-save, and use the workspace TypeScript SDK.

## Contributing

1. Pick the next open story from the backlog and read its epic.
2. Follow AGENTS.md/README guidance, keep commits small, include `npm run test:run` output in PR descriptions.
3. Update story files to mark completed work.
