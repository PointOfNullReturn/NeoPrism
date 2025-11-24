# Epic 05 Stories – Palette & Color Management

## Story 05.01 – Palette State & Commands _(Status: ✅ Completed)_
**Goal:** Store palette data, FG/BG indices, and undoable palette edits.
**Acceptance Criteria:**
- Palette slice includes array of `PaletteColor`, FG index, BG index, and sanity checks (2–256 colors).
- `PaletteChangeCommand` handles insert/delete/update operations and records diffs for undo.
- Store exposes selectors/actions for setting FG/BG, inserting/removing colors, and applying CRNG metadata.

**Notes:**
- Added a dedicated `palette` slice synchronized with indexed documents, validators for palette length, and setter actions for colors, indices, and CRNG metadata.
- Tools now consume `state.palette.foregroundIndex/backgroundIndex` (via `colorSelection.ts`) while update/insert/remove actions clamp to bounds and keep FG/BG consistent.
- Introduced `PaletteChangeCommand` with undoable ops plus regression tests covering state syncing, palette actions, and command workflows.

## Story 05.02 – PaletteView Swatch Grid _(Status: ✅ Completed)_
**Goal:** Visualize palette entries and enable FG/BG selection.
**Acceptance Criteria:**
- Grid component renders up to 256 swatches with virtualization not required but performance optimized (single canvas or CSS grid) to avoid reflow.
- Left click sets FG, right click sets BG; keyboard navigation (arrow keys + Enter) supported with ARIA labels describing color values.
- Swatch outlines differentiate FG vs BG selections with accessible contrast.

**Notes:**
- Added `PaletteView` React component that renders a 16×16 CSS grid of buttons with accessible labels and CSS outlines differentiating FG/BG selections.
- Mouse, context-menu, and keyboard interactions call store palette setters; Shift+Enter assigns background while arrow keys move focus predictably.
- React Testing Library coverage verifies event handling, navigation, and ARIA wiring.

## Story 05.03 – PaletteEditor Controls _(Status: ✅ Completed)_
**Goal:** Provide RGBA editing controls and palette add/remove operations.
**Acceptance Criteria:**
- Editor shows sliders/inputs for RGBA plus numeric text boxes; updating values dispatches PaletteChangeCommand.
- Add/remove buttons maintain bounds; removing selected color reassigns FG/BG indexes predictably (clamp to max index).
- Optional CRNG fields (rate, low, high, active) appear when document contains cycles and persist through edits.

**Notes:**
- Implemented `PaletteEditor` alongside `PaletteView`, featuring RGBA sliders + numeric inputs that execute `PaletteChangeCommand` updates for undoable edits.
- Add/Remove buttons issue insert/remove palette commands, clamp selections, and keep FG index synchronized.
- CRNG controls expose enable toggle plus rate/low/high inputs wired to `setCycles` commands; component + interactions covered by RTL tests.

## Story 05.04 – Status Bar & Tool Integration _(Status: ✅ Completed)_
**Goal:** Keep FG/BG info synchronized across UI and tools.
**Acceptance Criteria:**
- Status bar displays FG/BG indices and RGBA hex values; updates occur on palette or picker changes without causing whole-app rerenders.
- Pencil/Eraser automatically adopt FG/BG updates mid-stroke (next pixels use new values).
- Tests ensure palette updates propagate to renderer and history stack.

**Notes:**
- Added `StatusBar` footer surfacing FG/BG indices plus `#RRGGBB` values with ARIA live regions; tied directly to the palette slice for instant updates.
- Pencil/Eraser now read palette indices per pointer event and capture after-stroke snapshots so undo/redo faithfully reproduces multi-color strokes.
- Regression tests cover mid-stroke color changes, status bar rendering, and palette integration.
