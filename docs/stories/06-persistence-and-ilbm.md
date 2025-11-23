# Epic 06 Stories – Persistence & ILBM Import

## Story 06.01 – JSON Project Save/Load
**Goal:** Serialize and deserialize full project state.
**Acceptance Criteria:**
- `saveProject(document, view)` returns JSON with version, dimensions, mode, base64 pixels, palette, cycles, view (zoom, offsets, grid), FG/BG indices.
- `loadProject(json)` validates schema, allocates buffers, restores palette/FG/BG, view, and pushes a command so undo reverts to previous state.
- Round-trip tests ensure equality for sample projects in both Indexed8 and RGBA modes.

## Story 06.02 – PNG Export Pipeline
**Goal:** Export the current canvas as PNG.
**Acceptance Criteria:**
- Indexed documents convert palette indices to RGBA ImageData before encoding; RGBA docs reuse buffer directly.
- Browser export uses Blob + download link; tests rely on mock `URL.createObjectURL` verifying binary length.
- Export respects zoom-independent document size (no UI chrome included) and includes metadata (e.g., sRGB).

## Story 06.03 – ILBM Parser Modules
**Goal:** Parse FORM/BMHD/CMAP/BODY/CRNG chunks into ImportedILBM payloads.
**Acceptance Criteria:**
- `parseChunks.ts` handles chunk iteration, big-endian parsing, and size validation.
- `decodeBitplanes.ts` converts 1–8 bitplanes to chunky indices; rejects HAM/ANIM/compressed formats with descriptive errors.
- `parseCRNG.ts` captures optional CRNG metadata arrays.
- Tests load fixture ILBM files verifying width, height, palette, cycles, and pixel data accuracy.

## Story 06.04 – ImportIFFCommand Workflow
**Goal:** Integrate ILBM parser with the editor.
**Acceptance Criteria:**
- UI action selects ILBM file, runs parser, wraps result in `ImportIFFCommand` that replaces document buffers, palette, view (fit-to-screen), and pushes undo entry.
- Errors bubble to UI notifications with actionable messages (unsupported mode, corrupt chunk).
- Undo restores previous document entirely; redo reapplies import.
