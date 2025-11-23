Excellent — let’s lock this down properly.
Below is the **full, detailed, engineering-grade MVP Spec** for your **Modern DPaint Clone (Version 1.0 Alpha)**, suitable for coding agents, implementation work, and long-term architectural scalability.

This is clean, modular, and production-ready.

---

# 🎨 **Modern DPaint Clone (SwankyPaint) — MVP Spec (Version 1.0 Alpha)**

**Codebase Target:** React + TypeScript + Vite + Zustand + Canvas 2D
**Environment:** VS Code

---

# 📁 **1. Project Structure (Recommended)**

```
project-root/
  src/
    app/
      App.tsx
      AppShell.tsx
    components/
      CanvasView/
        CanvasSurface.tsx
        CanvasOverlay.tsx
        index.ts
      Toolbar/
        ToolButton.tsx
        Toolbar.tsx
      Palette/
        PaletteView.tsx
        PaletteEditor.tsx
      Menubar/
        Menubar.tsx
      Statusbar/
        Statusbar.tsx
    state/
      store.ts
      undoRedo.ts
      documentTypes.ts
      commands/
        Command.ts
        DrawPixelCommand.ts
        LineCommand.ts
        RectCommand.ts
        FillCommand.ts
        PaletteChangeCommand.ts
        ImportIFFCommand.ts
      tools/
        Tool.ts
        PencilTool.ts
        EraserTool.ts
        LineTool.ts
        RectTool.ts
        FillTool.ts
        PickerTool.ts
    rendering/
      renderer.ts
      previewRenderer.ts
    canvas/
      pointerEvents.ts
      coordinateTransforms.ts
    iff/
      ilbmParser.ts
      parseChunks.ts
      decodeBitplanes.ts
      parseCRNG.ts
    utils/
      color.ts
      floodFill.ts
      geometry.ts
      arrays.ts
    assets/
    styles/
    index.tsx
```

This structure is scalable, readable, and matches the Command/Event architecture we outlined.

---

# 🧠 **2. Architecture Overview**

### Core Patterns:

* **Command Pattern** for all image-modifying ops
* **Event-Driven Tools** for pointer/keyboard input
* **Zustand State Store** as the single source of truth
* **Canvas 2D Imperative Rendering** (React does not render pixels)
* **Preview Overlay Canvas** for non-destructive previews
* **Indexed + Truecolor Pixel Buffers** (dual-mode internal representation)
* **IFF ILBM Parser** for loading classic DPaint images

### Render Loop

* No animation except optional palette cycling
* Canvas rendered on pixel changes
* Palette cycling rerenders palette-indexed frames only

---

# 🎯 **3. MVP Feature Specification**

## **3.1 Canvas & Pixel Engine**

* Supports arbitrary resolutions: **32×32 up to 4096×4096**
* Two internal formats:

  * `Indexed8` — Uint8Array pixels (0–255)
  * `RGBA32` — Uint32Array or Uint8ClampedArray
* Single frame only (multi-frame is post-MVP)
* Nearest Neighbor rendering (no smoothing)
* Zoom levels: **1x, 2x, 4x, 8x, 16x, 32x**
* Panning via:

  * Middle mouse OR
  * Spacebar + drag
* Grid overlay (optional toggle)

**Performance Requirements:**

* ~60fps drawing responsiveness
* No unexpected React rerenders during pixel operations
* Imperative canvas rendering only

---

## **3.2 Tools**

All tools follow a unified interface:

```ts
interface Tool {
  id: string;
  onPointerDown(state, x, y, evt): Command | void;
  onPointerMove(state, x, y, evt): Command | void;
  onPointerUp(state, x, y, evt): Command | void;
  onCancel?(state): void;
}
```

### Tool List (MVP)

1. **Pencil Tool**

   * Emits DrawPixelCommand per pixel crossed
2. **Eraser Tool**

   * Draws background color index (or RGBA white/transparent)
3. **Line Tool**

   * Preview overlay
   * Emits LineCommand on pointer up
4. **Rectangle Tool**

   * Outline / Filled toggle
   * Preview overlay
   * Emits RectCommand
5. **Fill Tool**

   * Classic FloodFillCommand using scanline algorithm
6. **Picker Tool**

   * Sets active foreground/background color

**Keyboard:**

* B — Pencil
* E — Eraser
* L — Line
* R — Rectangle
* F — Fill
* I — Picker (eyedropper)

---

## **3.3 Palette System**

* Max palette size: **256 colors**
* Minimum: **2 colors**
* Editing UI:

  * Click swatch → set FG
  * Right-click → set BG
  * Sliders: R, G, B, A
  * Add/Remove color buttons
* Import palette from ILBM CMAP chunks
* Internal representation:

```ts
interface PaletteColor {
  r: number; g: number; b: number; a: number;
}
palette: PaletteColor[];
```

Optional for MVP:

* Color cycling metadata loaded but not animated

---

## **3.4 IFF ILBM Import Support (Classic Amiga Only)**

### Required chunks:

* `FORM ILBM`
* `BMHD` (bitmap header)
* `CMAP` (palette)
* `BODY` (bitplane data → converted to indexed chunky)
* `CRNG` (store metadata)

### Unsupported in v1.0 Alpha:

* HAM6/HAM8 modes
* 24-bit truecolor ILBM extensions
* ANIM format
* Compression (e.g., `RLE`)

  * Optional if simple RLE is easy to include

### Output of loader:

```ts
interface ImportedILBM {
  width: number;
  height: number;
  pixels: Uint8Array;
  palette: PaletteColor[];
  cycles?: CRNGRange[];
}
```

---

## **3.5 Undo/Redo**

Command stack system.

### Requirements:

* Every tool action produces a Command
* Commands include minimal diffs:

  * A list of changed pixels
  * Or a start→end snapshot for destructive ops
* Undo = command.undo()
* Redo = command.redo()
* Limit: Configurable (default 100)

### Command Interface:

```ts
interface Command {
  do(state: EditorState): void;
  undo(state: EditorState): void;
}
```

---

## **3.6 Saving/Loading**

### Save:

* JSON project file:

```
{
  "version": "1.0-alpha",
  "width": ...,
  "height": ...,
  "mode": "indexed8" | "rgba32",
  "pixels": <base64>,
  "palette": [...],
  "cycles": [...]
}
```

### Load:

* Read JSON
* Restore pixel buffer, palette, cycles, view state

### Export:

* PNG only (truecolor if indexed8, or RGBA32)

No ILBM export in MVP.

---

## **3.7 UI Layout (React Components)**

### Top Bar:

* **File:** New, Open Project, Save Project, Export PNG
* **View:** Zoom In/Out, Grid Toggle
* **Help:** About

### Left Toolbar:

* Tool icons (Pencil, Eraser, Line, Rectangle, Fill, Picker)

### Right Sidebar:

* Palette grid
* Palette editor (R/G/B/A sliders)

### Canvas Area:

* Main drawing surface
* Overlay canvas for tool previews
* Coordinate display on hover

### Bottom Status Bar:

* Mouse position (x,y)
* FG/BG color indices

---

# 🧩 **4. Data Structures**

## Editor State

```ts
interface EditorState {
  document: {
    width: number;
    height: number;
    pixels: Uint8Array | Uint32Array;
    palette: PaletteColor[];  // only if indexed
    mode: 'indexed' | 'rgba';
    cycles?: CRNGRange[];
  };
  view: {
    zoom: number;
    offsetX: number;
    offsetY: number;
    showGrid: boolean;
  };
  tool: Tool;
  history: {
    undoStack: Command[];
    redoStack: Command[];
  };
  pointer: {
    isDown: boolean;
    lastX: number;
    lastY: number;
  };
}
```

---

# 🔄 **5. Rendering System**

## Base canvas:

* Maintains full rendered image
* Update whenever buffer or palette changes

## Overlay canvas:

* Draws temporary shapes:

  * Line preview
  * Rectangle preview

## Rendering pipeline:

1. Build ImageData from pixel buffer
2. Use nearest neighbor scaling:

   * `ctx.imageSmoothingEnabled = false`
3. Draw offscreen → onscreen for clean scaling

## Palette Cycling (optional MVP):

* `requestAnimationFrame(loop)`

---

# 🧪 **6. Testing Requirements**

### Unit Tests:

* Flood fill edge cases
* Line algorithm correctness
* Rect tool
* Palette change operations
* IFF parsing of sample ILBMs

### Integration Tests:

* Tool interactions
* Undo/Redo
* Pixel buffer integrity

### Manual QA:

* Drawing at various zoom levels
* Loading ILBM
* Saving/loading JSON
* Export PNG accuracy

---

# 📦 **7. VS Code Project Setup**

### Extensions:

* ES7+ React Snippets
* Prettier
* ESLint
* GitLens
* Hex Editor (for ILBM debugging)
* Error Lens
* Vitest Runner

### settings.json (recommended)

I can generate this upon request.

---

# 🚀 **8. Future Expansion After MVP (Optional Roadmap)**

* Layers
* Animation frames (DPaint-style ANIM systems)
* HAM6/HAM8 support
* AGA 24-bit extensions
* True ILBM export
* Brush system
* Custom brush capture
* Symmetry tools
* Tilemap mode
* Shader-based palette cycling (WebGL)
* Full-screen or Workbench-themed UI

---

# 🎯 **This Spec is MVP 1.0 Alpha — Complete**

This is a full engineering-level specification that a coding agent can use to start implementing the system immediately.
