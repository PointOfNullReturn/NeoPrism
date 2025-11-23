# Epic 03 Stories – Rendering & Canvas Engine

## Story 03.01 – Dual Pixel Buffer Utilities
**Goal:** Manage Indexed8 and RGBA32 pixel buffers with safe resizing.
**Acceptance Criteria:**
- `src/rendering/pixelBuffer.ts` exposes `createIndexedBuffer`, `createRGBABuffer`, `resizeBuffer` while enforcing 32×32–4096×4096 limits.
- Indexed buffer stores palette indices (Uint8Array); RGBA buffer stores Uint32Array or Uint8ClampedArray per environment.
- Tests confirm resizing keeps overlapping region data and throws on invalid dimensions.

## Story 03.02 – Base Renderer & Zoom Controls
**Goal:** Render document pixels onto visible canvas with crisp scaling.
**Acceptance Criteria:**
- `renderer.ts` builds ImageData from current buffer/palette, draws to an offscreen canvas, and blits to onscreen canvas; `imageSmoothingEnabled` disabled.
- Zoom factors limited to {1,2,4,8,16,32}; store actions adjust zoom with clamp.
- Rendering occurs only when dependent state (pixels, palette, zoom) change; verify via devtool logging or tests.

## Story 03.03 – View Panning & Grid Overlay
**Goal:** Provide intuitive navigation aids.
**Acceptance Criteria:**
- View slice tracks `offsetX/offsetY` (pixels) updated via mouse wheel+modifier or middle mouse drag.
- Grid overlay draws lines every pixel at zoom ≥4 and can toggle from the store.
- Performance profiling shows grid overlay adds <2ms overhead per frame.

## Story 03.04 – Overlay Renderer & Pointer Coordinate Transforms
**Goal:** Support preview strokes and accurate pointer mapping.
**Acceptance Criteria:**
- `previewRenderer.ts` manages overlay canvas lifecycle and exposes API for tools to draw previews (line/rectangle) and clear them.
- `src/canvas/coordinateTransforms.ts` converts DOM event positions to bitmap coordinates considering zoom/pan.
- Tests cover conversion edge cases and overlay cleanup on pointer up/cancel.
