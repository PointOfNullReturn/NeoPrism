# Epic 05 – Palette & Color Management

## Scope
Deliver indexed color workflows: palette state slice, FG/BG selection, sidebar UI, RGBA editor controls, and CRNG metadata handling (`docs/Alpha Master Specs/NeoPrism Project Spec.md:178`).

## Key Deliverables
- Palette data structures capped at 256 entries with FG/BG indices and palette change commands for history tracking.
- Components for PaletteView (swatch grid) and PaletteEditor (RGBA sliders, add/remove buttons) plus optional CRNG metadata UI.
- Picker and drawing tools integrated with palette selections, updating the status bar with live FG/BG values.

## Dependencies
- Epics 01–04.

## Success Criteria
- Palette edits propagate to renderer immediately and log undoable actions.
- Swatch grid remains performant at 256 colors with accessible semantics (keyboard navigation, ARIA labels).
- FG/BG colors always align with Picker, Pencil, and Eraser behavior.
