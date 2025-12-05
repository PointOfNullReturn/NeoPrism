# Epic 07 Stories – UI Shell & Layout

## Story 07.01 – AppShell Layout & Canvas Mount _(Status: ✅ Completed)_
**Goal:** Compose the main layout with menubar, toolbar, canvas region, palette sidebar, and status bar.
**Acceptance Criteria:**
- `AppShell.tsx` uses CSS grid/flex to place regions exactly as spec’d; layout reflows at ≥1280px width and prevents overlapping panes.
- Canvas component mounts base + overlay canvases and subscribes only to needed store slices (document pixels, view state).
- Layout supports resizing window while keeping toolbar/palette fixed width and canvas filling remainder.

**Notes:**
- Added `AppShell` grid layout with dedicated menubar, toolbar, canvas, sidebar, and status sections plus responsive CSS.
- `EditorCanvas` mounts base/overlay canvases, draws the document buffer to an offscreen canvas, and updates when state changes.
- App test updated to ensure the new layout renders.

## Story 07.02 – Toolbar Integration _(Status: ✅ Completed)_
**Goal:** Render interactive tool buttons linked to store state.
**Acceptance Criteria:**
- Toolbar shows icons + keyboard shortcuts for Pencil, Eraser, Line, Rectangle, Fill, Picker; active tool highlighted.
- Buttons dispatch tool-changing actions and respond to keyboard events (Enter/Space) with full accessibility labels.
- Disabled states ready for future tools (e.g., when import modal open).

**Notes:**
- Added `Toolbar` component with inline SVG icons, labels, and shortcuts, tied to `tool.activeToolId` with `aria-pressed` states.
- Buttons call `setTool` and can later honor disabled logic; toolbar styling matches the new layout.
- Tests ensure clicking a button switches the active tool.

## Story 07.03 – Menubar & Dialogs _(Status: ✅ Completed)_
**Goal:** Provide File/View/Help menus with functional commands and classic MacOS styling.
**Acceptance Criteria:**
- File menu handles New (clear doc), Open (JSON/ILBM), Save (JSON), Export PNG, each hooking into previously implemented commands.
- View menu toggles grid and adjusts zoom in/out (clamped) reflecting disabled states at min/max zoom.
- Help menu opens About modal containing version/build info; modal accessible via keyboard.
- Classic Mac visual appearance with beveled/platinum styling adapted to dark theme.
- Hover-to-open behavior: click to open first menu, then hovering switches between menus.
- Keyboard shortcuts displayed using Mac symbols (⌘, ⇧, ⌥).
- Menu dividers separate logical groups of items.

**Notes:**
- Added `Menubar` component with File/View/Help menus wired to New/Open/Save/Export/zoom/grid actions and ILBM import.
- Introduced keyboard-dismissable About modal with version info.
- Tests verify menu interactions and modal rendering.
- **Classic Mac Redesign**: Refactored menu system with data-driven architecture using `MenuBarDef` interface and split into reusable components (`MenuLabel`, `MenuItem`, `MenuDropdown`).
- Implemented hover-to-open behavior with `isMenuActive` state that enables menu switching on hover after initial click.
- Added keyboard shortcuts utility (`formatShortcut`) to display Mac symbols in menu items.
- Visual styling uses classic Mac blue (#4a8fd8) for active/hover states, gradient backgrounds, and beveled borders adapted for dark theme.
- Menu dividers added to File and View menus to separate logical groups.
- Disabled states properly styled and functionally disabled at zoom limits.

## Story 07.04 – Status Bar & Live Readouts _(Status: ✅ Completed)_
**Goal:** Display pointer coordinates plus FG/BG data efficiently.
**Acceptance Criteria:**
- Status bar subscribes to pointer + palette slices using optimized selectors to avoid frequent rerenders.
- Coordinates update on pointer move to show `x,y` (document space) while FG/BG show index + hex value.
- Undo/redo availability optionally displayed (e.g., greyed-out text) to inform users.

**Notes:**
- Status bar now derives palette indices/colors, pointer coordinates, and undo/redo availability through isolated selectors using `useShallow`, preventing pointless re-renders.
- UI shows zero-padded indices plus uppercase hex values, rounded coordinates, and availability chips that swap styles based on each stack.
- Tests assert palette updates, pointer rounding, and undo/redo readouts to lock the behavior in.
- Added palette-cycle controls: the View menu (and `Ctrl+Shift+C`) toggles live palette animation so ILBM CRNG ranges can animate just like classic Deluxe Paint.
