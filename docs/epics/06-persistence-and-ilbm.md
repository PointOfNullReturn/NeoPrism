# Epic 06 – Persistence & ILBM Import

## Scope
Implement project save/load, PNG export, and ILBM import pipelines so SwankyPaint can exchange artwork with other tools (`docs/Alpha Master Specs/SwankyPaint Project Spec.md:204`, `docs/Alpha Master Specs/SwankyPaint Project Spec.md:263`).

## Key Deliverables
- JSON serialization/deserialization covering version, dimensions, mode, pixels (base64), palette, cycles, and view state.
- PNG export routine that flattens Indexed8 buffers to RGBA before writing and triggers downloads in-browser.
- ILBM parser (FORM/BMHD/CMAP/BODY/CRNG) plus bitplane decoder and ImportIFFCommand integrating results into the document with undo support.
- Error handling surfaced to UI for unsupported ILBM modes or malformed project files.

## Dependencies
- Epics 01–05 (requires functioning document + palette + command infrastructure).

## Success Criteria
- JSON round trips produce identical documents and respect undo history when loaded.
- PNG exports open correctly in external viewers at multiple resolutions.
- ILBM imports populate dimensions, pixel buffers, palette (and CRNG data when present) while providing descriptive errors for unsupported features.
