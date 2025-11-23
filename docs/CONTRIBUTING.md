# Contributing to SwankyPaint

1. Read the story backlog in `docs/stories/backlog.md` and pick the next story that is In Progress or ready to start.
2. Review its epic spec under `docs/epics/` to understand scope and dependencies.
3. Before coding, ensure `npm install` has been run and Husky hooks installed (`npm run prepare`).
4. Implement the story, keeping commits small and referencing the story ID (e.g., `01.03`).
5. Run `npm run lint`, `npm run test:run`, and `npm run format:check` before opening a PR.
6. Update the corresponding story file to mark the story as completed once accepted.

For style, testing, or architecture guidance, consult `AGENTS.md` and `README.md`.
