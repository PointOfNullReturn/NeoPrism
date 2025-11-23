# Epic 03 – Rendering & Canvas Engine

## Scope
Implement the dual pixel buffer engine, imperative Canvas 2D rendering pipeline, zoom/pan/grid view controls, and overlay renderer per spec (`docs/Alpha Master Specs/SwankyPaint Project Spec.md:105`, `docs/Alpha Master Specs/SwankyPaint Project Spec.md:359`).

## Key Deliverables
- Utilities for creating/resizing Indexed8 and RGBA32 buffers constrained to 32×32–4096×4096 resolutions.
- Renderer that builds `ImageData`, draws on an offscreen canvas with smoothing disabled, and blits to the visible canvas at zoom levels 1×–32×.
- View slice actions managing zoom, offsets, and grid toggle plus pointer-coordinate transforms.
- Overlay renderer for previews and a grid layer that sits atop the base canvas without altering document pixels.

## Dependencies
- Epics 01–02 for project scaffold and store/command abstractions.

## Success Criteria
- Drawing operations repaint within ~16ms budgets at common resolutions.
- Zoom/pan adjustments maintain crisp pixels and accurate coordinate reporting.
- Overlay visuals clear reliably on pointer up/cancel events.
