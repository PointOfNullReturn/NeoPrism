# Epic 02 – Architecture & Editor State

## Scope
Define the deterministic core that all tools and workflows rely on: typed editor state, Zustand store slices, the Command pattern, and undo/redo infrastructure (`docs/Alpha Master Specs/SwankyPaint Project Spec.md:83`, `docs/Alpha Master Specs/SwankyPaint Project Spec.md:324`).

## Key Deliverables
- `EditorState` interface plus supporting types (`PaletteColor`, `CRNGRange`, `ImageMode`).
- Zustand store with document, view, pointer, tool, and history slices along with minimal actions for mutating each slice.
- Base `Command` interface and registry utilities to ensure every pixel mutation flows through commands.
- Undo/redo stack implementation with configurable depth (default 100) and helper actions to push/undo/redo operations while emitting UI-safe state (e.g., `canUndo`).

## Dependencies
- Epic 01 foundational scripts/config.

## Success Criteria
- Pixel-modifying features can register commands without editing component state directly.
- Store selectors remain referentially stable when untouched slices update.
- Undo/redo operations replay commands deterministically using recorded diffs.
