# Epic 02 Stories – Architecture & Editor State

## Story 02.01 – Define Shared Types & EditorState Contract _(Status: ✅ Completed)_
**Goal:** Capture the canonical interfaces for document/view/history/tool/pointer data.
**Acceptance Criteria:**
- `src/state/documentTypes.ts` exports `PaletteColor`, `CRNGRange`, `ImageMode`, `EditorState`, and helper discriminated unions for indexed vs RGBA documents.
- Type definitions reference constraints from the spec (palette max 256, zoom list, etc.).
- Type tests (using `tsd` or compile-time assertions) validate shape.

## Story 02.02 – Initialize Zustand Store Skeleton _(Status: ✅ Completed)_
**Goal:** Provide strongly typed Zustand store slices with derived selectors.
**Acceptance Criteria:**
- `src/state/store.ts` initializes slices for document, view, history, pointer, tool; actions exist for updating each area.
- Provide typed hooks (`useDocument`, `useView`, etc.) exposing selectors that avoid unnecessary rerenders.
- Default document: 320×200 Indexed8 canvas, 32-color palette placeholder, grid off.

## Story 02.03 – Implement Command Interface & Registry Helpers _(Status: ✅ Completed)_
**Goal:** Standardize how commands are declared and executed.
**Acceptance Criteria:**
- `src/state/commands/Command.ts` defines `Command` interface with `do`, `undo`, optional `label`, and diff payload structure.
- Provide helper `executeCommand(command)` that applies `do` and pushes history entry via store actions.
- Include an example `ClearDocumentCommand` with tests verifying `do/undo` behavior.

## Story 02.04 – Build Undo/Redo History Stack _(Status: ✅ Completed)_
**Goal:** Deliver reusable history logic.
**Acceptance Criteria:**
- `src/state/undoRedo.ts` manages push/undo/redo with configurable limit (default 100) and returns booleans for `canUndo`/`canRedo`.
- Undo removes last command, calls `undo`, pushes to redo stack; redo inverts.
- Hooks expose derived state for UI disabling (e.g., `useHistoryAvailability`).
- Tests simulate multiple commands, limit overflow, and redo clearing after new command.
