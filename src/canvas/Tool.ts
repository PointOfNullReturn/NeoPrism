import type { EditorStoreState } from '../state/store'

export interface Tool {
  id: string
  onPointerDown: (state: EditorStoreState, x: number, y: number, evt: PointerEvent) => void
  onPointerMove: (state: EditorStoreState, x: number, y: number, evt: PointerEvent) => void
  onPointerUp: (state: EditorStoreState, x: number, y: number, evt: PointerEvent) => void
  onCancel?: (state: EditorStoreState) => void
}
