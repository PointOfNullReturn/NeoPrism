/**
 * Shared type definitions for NeoPrism's editor state.
 * Mirrors the architecture defined in docs/Alpha Master Specs/NeoPrism Project Spec.md.
 */

export type ImageMode = 'indexed8' | 'rgba32'

export type ZoomLevel = 1 | 2 | 4 | 8 | 16 | 32
export const ZOOM_LEVELS: readonly ZoomLevel[] = [1, 2, 4, 8, 16, 32]
export const MIN_DOCUMENT_DIMENSION = 32
export const MAX_DOCUMENT_DIMENSION = 4096
export const MAX_PALETTE_SIZE = 256

export interface PaletteColor {
  r: number
  g: number
  b: number
  a: number
}

export interface CRNGRange {
  rate: number
  low: number
  high: number
  active: boolean
}

export interface BaseDocument {
  width: number
  height: number
  mode: ImageMode
}

export interface IndexedDocument extends BaseDocument {
  mode: 'indexed8'
  pixels: Uint8Array
  palette: PaletteColor[]
  cycles?: CRNGRange[]
}

export interface RGBADocument extends BaseDocument {
  mode: 'rgba32'
  pixels: Uint32Array
}

export type DocumentState = IndexedDocument | RGBADocument

export interface ViewState {
  zoom: ZoomLevel
  offsetX: number
  offsetY: number
  showGrid: boolean
  cycleAnimationEnabled: boolean
}

export interface PointerState {
  isDown: boolean
  lastX: number
  lastY: number
}

export interface PaletteState {
  colors: PaletteColor[]
  foregroundIndex: number
  backgroundIndex: number
  cycles?: CRNGRange[]
}

export interface ToolState {
  rectangleFilled: boolean
  activeToolId: string
}

export interface HistoryState<CommandShape = CommandLike> {
  undoStack: CommandShape[]
  redoStack: CommandShape[]
  limit: number
}

export interface EditorState {
  document: DocumentState
  palette: PaletteState
  view: ViewState
  history: HistoryState
  pointer: PointerState
  tool: ToolState
}

export interface CommandLike {
  do: () => void
  undo: () => void
}

export const canUndo = (history: HistoryState): boolean => history.undoStack.length > 0
export const canRedo = (history: HistoryState): boolean => history.redoStack.length > 0

// ---------------------------------------------------------------------------
// Compile-time assertions (ensures the exported union types match expectations)
// ---------------------------------------------------------------------------

type Expect<T extends true> = T
type Equal<A, B> = A extends B ? (B extends A ? true : false) : false

export type __DocumentTypeAssertions = [
  Expect<Equal<(typeof ZOOM_LEVELS)[number], ZoomLevel>>,
  Expect<Equal<DocumentState, IndexedDocument | RGBADocument>>,
]
