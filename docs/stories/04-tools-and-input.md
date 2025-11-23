# Epic 04 Stories – Tools & Input System

## Story 04.01 – Pointer Dispatcher & Tool Switching
**Goal:** Centralize DOM input handling and keyboard shortcuts.
**Acceptance Criteria:**
- `src/canvas/pointerEvents.ts` listens for mouse/touch events on canvas, normalizes button info, and dispatches to active Tool methods with bitmap coordinates.
- Keyboard shortcuts (B,E,L,R,F,I) switch tools instantly; Escape cancels current tool action and clears overlays.
- Dispatcher publishes pointer state (down/up/position) to the store’s pointer slice for history/replay.

## Story 04.02 – Pencil & Eraser Tools
**Goal:** Provide core freehand drawing tools built on commands.
**Acceptance Criteria:**
- `PencilTool` emits `DrawPixelCommand` for each traversed pixel using Bresenham line between last/next pointer positions to prevent gaps.
- `EraserTool` writes background color index (indexed mode) or transparent/white (RGBA) via dedicated command.
- Undo/redo revert strokes precisely; tests cover diagonal/fast strokes.

## Story 04.03 – Line & Rectangle Tools with Previews
**Goal:** Add geometric tools that rely on overlay preview rendering.
**Acceptance Criteria:**
- `LineTool` and `RectangleTool` implement pointer lifecycle, draw overlay previews, and push commands on pointer up.
- Rectangle tool supports outline/fill toggle stored in tool state.
- Commands track changed pixels only (diff arrays) for efficient undo.

## Story 04.04 – Fill Tool & Flood Fill Utility
**Goal:** Implement scanline flood fill reusable by other tools.
**Acceptance Criteria:**
- `FillTool` uses `floodFill.ts` utility that works for both indexed and RGBA documents, accounting for palette equality or RGBA component matches.
- Large fills (e.g., entire canvas) finish within reasonable time (<100ms at 512×512) and remain undoable.
- Tests cover edges: already uniform colors, diagonal cavities, multi-color borders.

## Story 04.05 – Picker Tool & FG/BG Updates
**Goal:** Sample colors for subsequent drawing.
**Acceptance Criteria:**
- `PickerTool` sets FG on left click, BG on right click, updates palette slice, and shows selection hints.
- Status bar reflects new FG/BG values immediately.
- Tool works regardless of document mode (indexed picks palette index; RGBA stores raw color).
