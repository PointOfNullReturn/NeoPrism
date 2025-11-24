# 🎨 **UI Specification — NeoPrism (v1.0 Alpha), a Deluxe Paint clone

This UI spec defines:

1. **Overall layout**
2. **Component detail specs**
3. **Interaction behaviors**
4. **Accessibility & keyboard navigation**
5. **UI state relationships**
6. **Styling & theming baseline**

Everything is structured in a way a coding agent can build cleanly in React/TypeScript.

---

# 1. **High-Level Layout**

The screen is divided into 5 major UI regions:

```
+--------------------------------------------------------------+
| Menubar                                                      |
+--------------------------------------------------------------+
| Toolbar |                    Canvas Area                     |
| (left)  |                                                    |
|         |                                                    |
|         |                                                    |
+--------------------------------------------------------------+
| Palette Sidebar (right)                                      |
+--------------------------------------------------------------+
| Statusbar                                                    |
+--------------------------------------------------------------+
```

### Regions:

* **Menubar (Top)**
* **Toolbar (Left vertical)**
* **Canvas Area (Center)**

  * `CanvasSurface` (actual pixels)
  * `CanvasOverlay` (previews)
* **Palette Sidebar (Right)**
* **Statusbar (Bottom)**

This mirrors DPaint ergonomics but with modern layout spacing.

---

# 2. **Component-Level Specification**

Each component gets:

* File location
* Props & state
* Responsibilities
* Behavior rules

---

## 2.1 **AppShell**

**File:** `src/app/AppShell.tsx`

**Responsibilities:**

* Arrange global layout regions (menu, toolbar, canvas, sidebar, statusbar)
* Subscribe to global zoom/view state for layout responsiveness
* Provide keyboard shortcuts at the top level
* Render global modals (New Project, Open, Save, About)

**Props:** none
**State:** none (all Zustand)

**Layout:**

* CSS grid or flex-column
* Fixed-height top + bottom bars
* Left toolbar fixed width (64px)
* Right palette sidebar fixed width (240px)
* Canvas fills remaining space

---

## 2.2 **Menubar**

**File:** `src/components/Menubar/Menubar.tsx`

**Responsibilities:**

* Provide dropdown menus:

  * **File**

    * New
    * Open Project
    * Save Project
    * Export PNG
  * **View**

    * Zoom In
    * Zoom Out
    * Reset Zoom
    * Toggle Grid
  * **Help**

    * About

**Interactions:**

* Clicking on a menu item dispatches a Command (`NewDocumentCommand`, `ExportPNGCommand`, etc.) or triggers modal UI actions.

**UI Requirements:**

* Simple button-based dropdowns (not OS-native menus)
* No submenus (Alpha constraint)

---

## 2.3 **Toolbar (Tools)**

**File:** `src/components/Toolbar/Toolbar.tsx`

**Responsibilities:**

* Display vertical list of tool icons
* Tools in v1.0 Alpha:

  * Pencil
  * Eraser
  * Line
  * Rectangle
  * Fill
  * Picker

**Behavior:**

* Clicking a tool sets the active tool in Zustand.
* Highlight the active tool.
* Show tooltips on hover.
* Support keyboard shortcuts for switching tools.

**Icons:**
Simple emoji or SVG placeholders for Alpha.

**Width:** 64px

---

## 2.4 **CanvasSurface**

**File:** `src/components/CanvasView/CanvasSurface.tsx`

**Responsibilities:**

* Render pixel buffer (from Zustand) onto `<canvas>`
* Handle pointer down/move/up for the active tool
* Convert screen coords → canvas pixel coords
* Apply nearest neighbor scaling

**Behavior Rules:**

* Not re-rendered via React state changes for every pixel
* Receives only *triggers* and uses imperative canvas drawing
* Updates on:

  * Pixel buffer changes
  * Palette updates
  * Zoom changes
  * Grid toggle

**Props:**
none — uses Zustand selectors

**Keyboard:**

* Spacebar held → pan mode
* Ctrl/Cmd + scroll → zoom

---

## 2.5 **CanvasOverlay**

**File:** `src/components/CanvasView/CanvasOverlay.tsx`

**Responsibilities:**

* Render non-destructive tool previews:

  * Line preview
  * Rectangle preview

**Behavior:**

* Transparent overlay canvas, same pixel dimensions as CanvasSurface
* For each pointer move event during an active preview tool:

  * Clear overlay canvas
  * Draw temporary shape
* On pointer up:

  * Overlay is cleared
  * Command is executed and CanvasSurface updates

---

## 2.6 **Palette Sidebar**

**File:**

* `src/components/Palette/PaletteView.tsx`
* `src/components/Palette/PaletteEditor.tsx`

### **PaletteView**

**Responsibilities:**

* Show grid of palette colors (max 256)
* Left-click = set FG
* Right-click = set BG
* Highlight FG with cyan border
* Highlight BG with magenta border

**Layout:**

* Scrollable grid
* Cell size ~24px
* Auto-wrap horizontally

### **PaletteEditor**

**Responsibilities:**

* Show selected FG color channels (R,G,B,A)
* Provide sliders or numeric inputs
* Apply changes in real-time to palette array
* Update pixel rendering on change

**Optional (Alpha):**

* Add/remove colors

---

## 2.7 **Statusbar**

**File:** `src/components/Statusbar/Statusbar.tsx`

**Responsibilities:**

* Display:

  * Cursor position (x,y)
  * FG/BG color indexes
  * Current zoom level
  * Selected tool icon or name

**Behavior:**

* Update cursor coords on CanvasSurface pointer moves
* Should not cause React re-renders on every pixel move
  → Use a shallow store selector or throttled update

**Height:** 24–28px

---

# 3. **UI Interaction Specs**

## 3.1 Pointer Interaction Model

### CanvasSurface:

* **PointerDown**

  * If spacebar → begin panning
  * Else → delegate to active tool

* **PointerMove**

  * If pointer is down and not panning:

    * Active tool receives event
    * If preview tool:

      * Overlay is updated

* **PointerUp**

  * Delegate to active tool
  * Overlay cleared
  * Command executed

### Panning:

* Spacebar down → panning enabled
* Canvas moves based on pointer delta
* On release → panning disabled

---

## 3.2 Keyboard Shortcuts

| Action       | Key                     |
| ------------ | ----------------------- |
| Pencil       | B                       |
| Eraser       | E                       |
| Line         | L                       |
| Rectangle    | R                       |
| Fill         | F                       |
| Picker       | I                       |
| Zoom In      | + or Ctrl + Scroll Up   |
| Zoom Out     | - or Ctrl + Scroll Down |
| Reset Zoom   | 0                       |
| Toggle Grid  | G                       |
| New Document | Ctrl+N                  |
| Open Project | Ctrl+O                  |
| Save Project | Ctrl+S                  |
| Export PNG   | Ctrl+Shift+S            |
| Undo         | Ctrl+Z                  |
| Redo         | Ctrl+Y or Ctrl+Shift+Z  |

---

# 4. **UI State Boundaries**

These rules prevent accidental re-renders and jank.

### React components MAY re-render when:

* Zoom level changes
* Palette changes
* Active tool changes
* Palette editor sliders move

### React components must NOT re-render when:

* Pixels are being drawn
* Bitplane conversion is happening
* Pointer moves inside canvas at high frequency

Canvas handling is imperative.

---

# 5. **Styling & Theme Guidelines**

Simple, clean visual spec (Alpha version):

### Colors:

* Dark UI theme (like VS Code)
* Toolbar background: `#1e1e1e`
* Palette sidebar: `#252526`
* Canvas background: solid black (#000)
* Menubar/statusbar: slightly lighter `#2d2d2d`

### Borders:

* 1px solid `#444` for separators

### Tool icons:

* 32×32px or 40×40px buttons
* Hover highlight: lighter border
* Active highlight: `#00ffff` (cyan glow)

### Scrollbars:

* Use default browser scrollbars (no customization needed)

### Font:

* System UI font (default)

---

# 6. **Modal Dialog Specs**

### 6.1 New Project Dialog

* Inputs:

  * Width (number)
  * Height (number)
  * Mode: Indexed (default)
* Submit → Create new document command

### 6.2 Open Project Dialog

* File input (JSON)
* On load → parser → replace current document

### 6.3 Save Project Dialog

* Offer Save-as JSON
* Trigger client-side file download

### 6.4 Export PNG Dialog

* Single button: Export
* Calls PNG export command

### 6.5 About Dialog

* Version
* Credits
* License
* GitHub link (optional)

---

# 7. **UI Event Flow Diagram**

**Pointer:**

```
pointerDown → Tool.onPointerDown → (Command?) → store.applyCommand
pointerMove → Tool.onPointerMove → (Preview?) → CanvasOverlay.drawShape
pointerUp   → Tool.onPointerUp   → Command.do() → CanvasSurface.redraw
```

**Zoom:**

```
wheel event → zoomHandler → store.setZoom → CanvasSurface.redraw
```

**Palette edit:**

```
slider/input → setPaletteColor → store.palette[...] → CanvasSurface.redraw
```

**Undo/Redo:**

```
Ctrl+Z → store.undo() → CanvasSurface.redraw
```

---

# 8. **UI Implementation Order (Coding Agent Friendly)**

1. AppShell + layout
2. CanvasSurface + Overlay
3. Toolbar + tools switching
4. PaletteView
5. PaletteEditor
6. Menubar
7. Statusbar
8. Modals
9. Keyboard shortcuts
10. Polish & testing

---

# 9. **Optional (But Alpha-Friendly) UX Improvements**

These are small, but useful:

### Snap-to-pixel cursor

* Draw a simple 1px crosshair or square following the cursor

### Live tool indicator

* Show tool name in statusbar on hover

### Smooth pan inertia

* Optional, post-alpha

### Quick FG/BG swap

* Press "X"

### Quick color pick

* Hold Alt → temporarily switch to picker

---

# 🎉 **UI SPEC COMPLETE**

This **fully integrates with the engine, tools, commands, and IFF parser spec** you already defined.
It’s ready for implementation by a coding agent or dev team.

---

If you'd like, I can now generate:

### ✔ Component interface stubs (TSX files with props + TODOs)

### ✔ Zustand store shape and selectors

### ✔ CSS/Tailwind spec

### ✔ Alpha milestone breakdown (tasks, dependencies, time estimates)

### ✔ Interaction specification diagrams (sequence diagrams for tools, etc.)

Just tell me what you'd like next.
