# Epic 07 – UI Shell & Layout

## Scope
Assemble the visible React UI per spec (`docs/Alpha Master Specs/NeoPrism Project Spec.md:294`): menubar, toolbar, canvas region, palette sidebar, status bar, dialogs, and responsive layout around the rendering engine.

## Key Deliverables
- `AppShell` layout (CSS grid/flex) that places menubar top, toolbar left, palette right, status bar bottom, and canvas center while accommodating resizing.
- Menubar wiring for File/View/Help actions: new document, open/save/export, zoom controls, grid toggle, and About modal with classic MacOS (pre-OS X) visual styling.
- Classic Mac menu system with hover-to-open behavior, keyboard shortcuts display (⌘, ⇧, ⌥), menu dividers, and disabled states.
- Data-driven menu architecture using TypeScript interfaces with reusable components (MenuLabel, MenuItem, MenuDropdown).
- Toolbar components with icons/shortcuts reflecting active tool state.
- Status bar displaying pointer coordinates and FG/BG values without triggering full React rerenders.

## Dependencies
- Epics 01–06 (UI surfaces rely on functioning store, tools, palette, persistence).

## Success Criteria
- Layout stays responsive at desktop resolutions with consistent focus order and keyboard accessibility.
- UI buttons/menus dispatch store actions or commands rather than mutating DOM state directly.
- Visual state (active tool, grid toggle, undo availability) reflects real underlying data at all times.
