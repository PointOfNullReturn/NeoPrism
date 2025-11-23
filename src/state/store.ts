import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  DocumentState,
  EditorState,
  HistoryState,
  IndexedDocument,
  PaletteColor,
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

export function createDefaultPalette(length = DEFAULT_PALETTE_LENGTH): PaletteColor[] {
  const clamped = Math.min(Math.max(2, length), MAX_PALETTE_SIZE)
  return Array.from({ length: clamped }, (_, index) => ({
    r: index,
    g: index,
    b: index,
    a: 255,
  }))
}

export function createDefaultIndexedDocument(): IndexedDocument {
  return {
    mode: 'indexed8',
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    pixels: new Uint8Array(DEFAULT_WIDTH * DEFAULT_HEIGHT),
    palette: createDefaultPalette(),
    cycles: [],
  }
}

export function createDefaultView(): ViewState {
  return {
    zoom: DEFAULT_ZOOM,
    offsetX: 0,
    offsetY: 0,
    showGrid: false,
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

export function createDefaultToolState(): ToolState {
  return {
    activeToolId: DEFAULT_TOOL_ID,
  }
}

const createInitialSlices = (): EditorState => ({
  document: createDefaultIndexedDocument(),
  view: createDefaultView(),
  history: createDefaultHistory(),
  pointer: createDefaultPointer(),
  tool: createDefaultToolState(),
})

type DocumentUpdater = (doc: DocumentState) => DocumentState

type StoreState = EditorState & {
  setDocument: (doc: DocumentState | DocumentUpdater) => void
  updateView: (updater: (current: ViewState) => ViewState) => void
  setZoom: (zoom: ZoomLevel) => void
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
      set((state) => ({
        document: resolveDocument(doc, state.document),
      }))
    },
    updateView: (updater) => {
      set((state) => ({ view: updater(state.view) }))
    },
    setZoom: (zoom) => {
      const clamped = ZOOM_LEVELS.includes(zoom) ? zoom : DEFAULT_ZOOM
      set((state) => ({ view: { ...state.view, zoom: clamped } }))
    },
    setPointer: (partial) => {
      set((state) => ({ pointer: { ...state.pointer, ...partial } }))
    },
    setTool: (activeToolId) => {
      set(() => ({ tool: { activeToolId } }))
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
export const useTool = () => useEditorStore((state) => state.tool)
export const useHistory = () => useEditorStore((state) => state.history)

export type EditorStoreState = StoreState
