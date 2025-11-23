# Epic 04 – Tools & Input System

## Scope
Build the interaction layer that maps pointer/keyboard input to commands: pointer dispatcher, shared Tool interface, and all MVP drawing tools (Pencil, Eraser, Line, Rectangle, Fill, Picker) (`docs/Alpha Master Specs/SwankyPaint Project Spec.md:129`).

## Key Deliverables
- Pointer dispatcher capturing mouse/touch events, normalizing coordinates, and routing to the active Tool; keyboard shortcuts (B,E,L,R,F,I) for tool switching and Escape for cancel.
- Implementations for each tool using overlay previews where required and producing command payloads for undo/redo.
- Flood fill utility (scanline) and Bresenham algorithms reused by Fill/Line/Rectangle commands.
- Status updates (e.g., active tool) exposed to UI components.

## Dependencies
- Epics 01–03.

## Success Criteria
- Tools respond instantly to pointer movement with no visual tearing.
- Undo/redo restores tool actions exactly, including filled areas and multi-segment strokes.
- Keyboard shortcuts stay in sync with toolbar UI and pointer dispatcher.
