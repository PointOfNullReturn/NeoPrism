import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  DocumentState,
  EditorState,
  HistoryState,
  IndexedDocument,
  CRNGRange,
  PaletteColor,
  PaletteState,
  PointerState,
  ToolState,
  ViewState,
  ZoomLevel,
  CommandLike,
} from './documentTypes'
import { MAX_PALETTE_SIZE, ZOOM_LEVELS } from './documentTypes'
import { clearRedoStack, pushRedo, pushUndo } from './undoRedo'

const DEFAULT_WIDTH = 320
const DEFAULT_HEIGHT = 200
const DEFAULT_ZOOM: ZoomLevel = 4
const DEFAULT_HISTORY_LIMIT = 100
const DEFAULT_TOOL_ID = 'pencil'
const DEFAULT_PALETTE_LENGTH = 32
const DEFAULT_FOREGROUND_INDEX = 1
const DEFAULT_BACKGROUND_INDEX = 0
const MIN_PALETTE_LENGTH = 2

const clampChannel = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(255, Math.round(value)))
}

const sanitizeColor = (color: PaletteColor): PaletteColor => ({
  r: clampChannel(color.r),
  g: clampChannel(color.g),
  b: clampChannel(color.b),
  a: clampChannel(color.a ?? 255),
})

export function createDefaultPalette(length = DEFAULT_PALETTE_LENGTH): PaletteColor[] {
  const clamped = Math.min(Math.max(2, length), MAX_PALETTE_SIZE)
  return Array.from({ length: clamped }, (_, index) => ({
    r: index,
    g: index,
    b: index,
    a: 255,
  }))
}

const sanitizePaletteArray = (colors: PaletteColor[]): PaletteColor[] => {
  const bounded = colors.slice(0, MAX_PALETTE_SIZE).map(sanitizeColor)
  while (bounded.length < MIN_PALETTE_LENGTH) {
    bounded.push({ r: 0, g: 0, b: 0, a: 255 })
  }
  return bounded
}

const clampIndex = (value: number, max: number): number => {
  if (max <= 0) return 0
  return Math.max(0, Math.min(value, max))
}

const normalizePaletteState = (palette: PaletteState): PaletteState => {
  const colors = sanitizePaletteArray(palette.colors)
  const maxIndex = colors.length - 1
  const foregroundIndex = clampIndex(palette.foregroundIndex, maxIndex)
  const backgroundIndex = clampIndex(palette.backgroundIndex, maxIndex)
  return {
    colors,
    foregroundIndex,
    backgroundIndex,
    cycles: palette.cycles?.map((cycle) => ({ ...cycle })),
  }
}

const syncDocumentPalette = (document: DocumentState, palette: PaletteState): DocumentState => {
  if (document.mode !== 'indexed8') {
    return document
  }
  return {
    ...document,
    palette: palette.colors.slice(),
    cycles: palette.cycles?.map((cycle) => ({ ...cycle })) ?? [],
  }
}

const updatePaletteState = (
  palette: PaletteState,
  document: DocumentState,
  updater: (current: PaletteState) => PaletteState,
): { palette: PaletteState; document: DocumentState } => {
  const nextPalette = normalizePaletteState(updater(palette))
  const nextDocument = syncDocumentPalette(document, nextPalette)
  return { palette: nextPalette, document: nextDocument }
}

export function createDefaultIndexedDocument(
  palette: PaletteColor[] = createDefaultPalette(),
  cycles: CRNGRange[] = [],
): IndexedDocument {
  return {
    mode: 'indexed8',
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    pixels: new Uint8Array(DEFAULT_WIDTH * DEFAULT_HEIGHT),
    palette: sanitizePaletteArray(palette),
    cycles: cycles.map((range) => ({ ...range })),
  }
}

export function createDefaultView(): ViewState {
  return {
    zoom: DEFAULT_ZOOM,
    offsetX: 0,
    offsetY: 0,
    showGrid: false,
    cycleAnimationEnabled: false,
  }
}

export function createDefaultHistory(): HistoryState {
  return {
    undoStack: [],
    redoStack: [],
    limit: DEFAULT_HISTORY_LIMIT,
  }
}

export function createDefaultPointer(): PointerState {
  return {
    isDown: false,
    lastX: 0,
    lastY: 0,
  }
}

export function createDefaultPaletteState(): PaletteState {
  const colors = createDefaultPalette()
  return {
    colors,
    foregroundIndex: DEFAULT_FOREGROUND_INDEX,
    backgroundIndex: DEFAULT_BACKGROUND_INDEX,
    cycles: [],
  }
}

export function createDefaultToolState(): ToolState {
  return {
    activeToolId: DEFAULT_TOOL_ID,
    rectangleFilled: false,
  }
}

const createInitialSlices = (): EditorState => {
  const palette = createDefaultPaletteState()
  return {
    document: createDefaultIndexedDocument(palette.colors, palette.cycles ?? []),
    palette,
    view: createDefaultView(),
    history: createDefaultHistory(),
    pointer: createDefaultPointer(),
    tool: createDefaultToolState(),
  }
}

type DocumentUpdater = (doc: DocumentState) => DocumentState

type StoreState = EditorState & {
  setDocument: (doc: DocumentState | DocumentUpdater) => void
  updateView: (updater: (current: ViewState) => ViewState) => void
  setZoom: (zoom: ZoomLevel) => void
  setViewOffsets: (offsetX: number, offsetY: number) => void
  toggleGrid: (value?: boolean) => void
  setCycleAnimationEnabled: (enabled: boolean | ((current: boolean) => boolean)) => void
  setRectangleFilled: (filled: boolean) => void
  setPaletteColors: (colors: PaletteColor[]) => void
  updatePaletteColor: (index: number, color: PaletteColor) => void
  insertPaletteColor: (index: number, color: PaletteColor) => void
  removePaletteColor: (index: number) => void
  setPaletteCycles: (cycles: CRNGRange[]) => void
  setForegroundIndex: (index: number) => void
  setBackgroundIndex: (index: number) => void
  setPointer: (state: Partial<PointerState>) => void
  setTool: (activeToolId: string) => void
  setHistory: (state: Partial<HistoryState>) => void
  pushUndo: (command: CommandLike) => void
  pushRedo: (command: CommandLike) => void
  clearRedo: () => void
  resetHistory: () => void
}

const initialSlices = createInitialSlices()

const isDocumentUpdater = (doc: DocumentState | DocumentUpdater): doc is DocumentUpdater =>
  typeof doc === 'function'

const resolveDocument = (
  doc: DocumentState | DocumentUpdater,
  current: DocumentState,
): DocumentState => (isDocumentUpdater(doc) ? doc(current) : doc)

export const useEditorStore = create<StoreState>()(
  devtools((set) => ({
    ...initialSlices,
    setDocument: (doc) => {
      set((state) => {
        const nextDocument = resolveDocument(doc, state.document)
        if (nextDocument.mode !== 'indexed8') {
          return { document: nextDocument }
        }
        const derivedPalette = normalizePaletteState({
          ...state.palette,
          colors: nextDocument.palette.slice(),
          cycles: nextDocument.cycles ?? state.palette.cycles,
        })
        return {
          document: syncDocumentPalette(nextDocument, derivedPalette),
          palette: derivedPalette,
        }
      })
    },
    updateView: (updater) => {
      set((state) => ({ view: updater(state.view) }))
    },
    setZoom: (zoom) => {
      const clamped = ZOOM_LEVELS.includes(zoom) ? zoom : DEFAULT_ZOOM
      set((state) => ({ view: { ...state.view, zoom: clamped } }))
    },
    setViewOffsets: (offsetX, offsetY) => {
      set((state) => ({
        view: {
          ...state.view,
          offsetX,
          offsetY,
        },
      }))
    },
    toggleGrid: (value) => {
      set((state) => ({
        view: {
          ...state.view,
          showGrid: typeof value === 'boolean' ? value : !state.view.showGrid,
        },
      }))
    },
    setCycleAnimationEnabled: (enabled) => {
      set((state) => {
        const nextValue = typeof enabled === 'function' ? enabled(state.view.cycleAnimationEnabled) : enabled
        return {
          view: {
            ...state.view,
            cycleAnimationEnabled: nextValue,
          },
        }
      })
    },
    setRectangleFilled: (filled) => {
      set((state) => ({
        tool: {
          ...state.tool,
          rectangleFilled: filled,
        },
      }))
    },
    setPaletteColors: (colors) => {
      set((state) => updatePaletteState(state.palette, state.document, (palette) => ({ ...palette, colors })))
    },
    updatePaletteColor: (index, color) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => {
          if (index < 0 || index >= palette.colors.length) {
            return palette
          }
          const colors = palette.colors.slice()
          colors[index] = sanitizeColor(color)
          return { ...palette, colors }
        }),
      )
    },
    insertPaletteColor: (index, color) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => {
          if (palette.colors.length >= MAX_PALETTE_SIZE) {
            return palette
          }
          const insertAt = Math.max(0, Math.min(index, palette.colors.length))
          const colors = palette.colors.slice()
          colors.splice(insertAt, 0, sanitizeColor(color))
          const foregroundIndex =
            palette.foregroundIndex >= insertAt ? palette.foregroundIndex + 1 : palette.foregroundIndex
          const backgroundIndex =
            palette.backgroundIndex >= insertAt ? palette.backgroundIndex + 1 : palette.backgroundIndex
          return { ...palette, colors, foregroundIndex, backgroundIndex }
        }),
      )
    },
    removePaletteColor: (index) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => {
          if (palette.colors.length <= MIN_PALETTE_LENGTH) {
            return palette
          }
          const clampedIndex = clampIndex(index, palette.colors.length - 1)
          const colors = palette.colors.slice()
          colors.splice(clampedIndex, 1)
          const adjustAfterRemoval = (value: number): number => {
            if (value === clampedIndex) return value >= colors.length ? colors.length - 1 : value
            if (value > clampedIndex) return value - 1
            return value
          }
          const foregroundIndex = adjustAfterRemoval(palette.foregroundIndex)
          const backgroundIndex = adjustAfterRemoval(palette.backgroundIndex)
          return { ...palette, colors, foregroundIndex, backgroundIndex }
        }),
      )
    },
    setPaletteCycles: (cycles) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => ({
          ...palette,
          cycles: cycles.map((cycle) => ({ ...cycle })),
        })),
      )
    },
    setForegroundIndex: (index) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => ({
          ...palette,
          foregroundIndex: index,
        })),
      )
    },
    setBackgroundIndex: (index) => {
      set((state) =>
        updatePaletteState(state.palette, state.document, (palette) => ({
          ...palette,
          backgroundIndex: index,
        })),
      )
    },
    setPointer: (partial) => {
      set((state) => ({ pointer: { ...state.pointer, ...partial } }))
    },
    setTool: (activeToolId) => {
      set((state) => ({ tool: { ...state.tool, activeToolId } }))
    },
    setHistory: (partial) => {
      set((state) => ({ history: { ...state.history, ...partial } }))
    },
    resetHistory: () => {
      set(() => ({ history: createDefaultHistory() }))
    },
    pushUndo: (command) => {
      set((state) => ({
        history: pushUndo(state.history, command),
      }))
    },
    pushRedo: (command) => {
      set((state) => ({
        history: pushRedo(state.history, command),
      }))
    },
    clearRedo: () => {
      set((state) => ({
        history: clearRedoStack(state.history),
      }))
    },
  })),
)

export const resetEditorStore = () => {
  useEditorStore.setState((state) => ({ ...state, ...createInitialSlices() }))
}

export const useDocument = <T>(selector: (state: DocumentState) => T) =>
  useEditorStore((state) => selector(state.document))
export const useView = <T>(selector: (state: ViewState) => T) =>
  useEditorStore((state) => selector(state.view))
export const usePointer = () => useEditorStore((state) => state.pointer)
export const usePalette = () => useEditorStore((state) => state.palette)
export const useTool = () => useEditorStore((state) => state.tool)
export const useHistory = () => useEditorStore((state) => state.history)
export const useHistoryAvailability = () =>
  useEditorStore((state) => ({
    canUndo: state.history.undoStack.length > 0,
    canRedo: state.history.redoStack.length > 0,
  }))

export type EditorStoreState = StoreState
