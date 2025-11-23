# Epic 05 Stories – Palette & Color Management

## Story 05.01 – Palette State & Commands
**Goal:** Store palette data, FG/BG indices, and undoable palette edits.
**Acceptance Criteria:**
- Palette slice includes array of `PaletteColor`, FG index, BG index, and sanity checks (2–256 colors).
- `PaletteChangeCommand` handles insert/delete/update operations and records diffs for undo.
- Store exposes selectors/actions for setting FG/BG, inserting/removing colors, and applying CRNG metadata.

## Story 05.02 – PaletteView Swatch Grid
**Goal:** Visualize palette entries and enable FG/BG selection.
**Acceptance Criteria:**
- Grid component renders up to 256 swatches with virtualization not required but performance optimized (single canvas or CSS grid) to avoid reflow.
- Left click sets FG, right click sets BG; keyboard navigation (arrow keys + Enter) supported with ARIA labels describing color values.
- Swatch outlines differentiate FG vs BG selections with accessible contrast.

## Story 05.03 – PaletteEditor Controls
**Goal:** Provide RGBA editing controls and palette add/remove operations.
**Acceptance Criteria:**
- Editor shows sliders/inputs for RGBA plus numeric text boxes; updating values dispatches PaletteChangeCommand.
- Add/remove buttons maintain bounds; removing selected color reassigns FG/BG indexes predictably (clamp to max index).
- Optional CRNG fields (rate, low, high, active) appear when document contains cycles and persist through edits.

## Story 05.04 – Status Bar & Tool Integration
**Goal:** Keep FG/BG info synchronized across UI and tools.
**Acceptance Criteria:**
- Status bar displays FG/BG indices and RGBA hex values; updates occur on palette or picker changes without causing whole-app rerenders.
- Pencil/Eraser automatically adopt FG/BG updates mid-stroke (next pixels use new values).
- Tests ensure palette updates propagate to renderer and history stack.
