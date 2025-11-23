# Ordered Epics

The SwankyPaint MVP roadmap is split into eight sequential epics. Each epic contains its own spec plus detailed stories (`docs/stories/xx-*.md`) with matching numbering.

1. **Epic 01 – Project Foundation & Tooling**
2. **Epic 02 – Architecture & Editor State**
3. **Epic 03 – Rendering & Canvas Engine**
4. **Epic 04 – Tools & Input System**
5. **Epic 05 – Palette & Color Management**
6. **Epic 06 – Persistence & ILBM Import**
7. **Epic 07 – UI Shell & Layout**
8. **Epic 08 – Testing, QA, and Release Readiness**

Work should proceed in order unless a later epic explicitly depends on an earlier one being at least partially complete.

## Cross-Epic Dependency Notes
- **Epic 02** requires all foundation tooling from **Epic 01** (Node scripts, testing harness, docs) because the store and command files rely on strict TypeScript settings and linting rules.
- **Epic 03** builds on **Epic 02**: rendering utilities consume the document/view slices defined there. Zoom/pan/grid state is meaningless without the store in place.
- **Epic 04** depends on **Epics 02–03** since tools emit commands using the infrastructure from Epic 02 and draw previews via the overlay renderer from Epic 03.
- **Epic 05** also extends **Epic 04**; palette UI/commands integrate with Picker/Pencil/Eraser tools, so base tools must exist before palette-specific enhancements.
- **Epic 06** needs **Epics 02–05** because persistence and ILBM import read/write document buffers, palette data, and history entries.
- **Epic 07** relies on **Epics 02–06** to wire UI controls into real store actions (menubar commands for import/export, toolbar for tools, status bar for palette/pointer data).
- **Epic 08** assumes all prior epics are feature-complete; tests and QA artifacts reference functionality implemented earlier. Certain suites (e.g., flood fill) technically target Epic 04, so they can be started earlier if capacity exists.

When planning iterations, verify upstream epics are “dev complete” enough to unblock downstream stories. Partial overlaps are possible (e.g., start Epic 05 once tools and renderer are stable) but avoid skipping prerequisites listed above.
