# Epic 07 Stories – UI Shell & Layout

## Story 07.01 – AppShell Layout & Canvas Mount
**Goal:** Compose the main layout with menubar, toolbar, canvas region, palette sidebar, and status bar.
**Acceptance Criteria:**
- `AppShell.tsx` uses CSS grid/flex to place regions exactly as spec’d; layout reflows at ≥1280px width and prevents overlapping panes.
- Canvas component mounts base + overlay canvases and subscribes only to needed store slices (document pixels, view state).
- Layout supports resizing window while keeping toolbar/palette fixed width and canvas filling remainder.

## Story 07.02 – Toolbar Integration
**Goal:** Render interactive tool buttons linked to store state.
**Acceptance Criteria:**
- Toolbar shows icons + keyboard shortcuts for Pencil, Eraser, Line, Rectangle, Fill, Picker; active tool highlighted.
- Buttons dispatch tool-changing actions and respond to keyboard events (Enter/Space) with full accessibility labels.
- Disabled states ready for future tools (e.g., when import modal open).

## Story 07.03 – Menubar & Dialogs
**Goal:** Provide File/View/Help menus with functional commands.
**Acceptance Criteria:**
- File menu handles New (clear doc), Open (JSON/ILBM), Save (JSON), Export PNG, each hooking into previously implemented commands.
- View menu toggles grid and adjusts zoom in/out (clamped) reflecting disabled states at min/max zoom.
- Help menu opens About modal containing version/build info; modal accessible via keyboard.

## Story 07.04 – Status Bar & Live Readouts
**Goal:** Display pointer coordinates plus FG/BG data efficiently.
**Acceptance Criteria:**
- Status bar subscribes to pointer + palette slices using optimized selectors to avoid frequent rerenders.
- Coordinates update on pointer move to show `x,y` (document space) while FG/BG show index + hex value.
- Undo/redo availability optionally displayed (e.g., greyed-out text) to inform users.
