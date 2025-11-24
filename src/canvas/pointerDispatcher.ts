import type { Tool } from './Tool'
import { screenToDocument } from '../rendering/pointerTransforms'
import { useEditorStore } from '../state/store'

interface DispatcherOptions {
  canvas: HTMLCanvasElement
  getActiveTool: () => Tool | null
}

export class PointerDispatcher {
  private readonly canvas: HTMLCanvasElement
  private readonly options: DispatcherOptions
  private readonly store = useEditorStore
  private bound = false

  constructor(options: DispatcherOptions) {
    this.canvas = options.canvas
    this.options = options
  }

  bind(): void {
    if (this.bound) return
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    this.canvas.addEventListener('pointermove', this.handlePointerMove)
    window.addEventListener('pointerup', this.handlePointerUp)
    window.addEventListener('keydown', this.handleKeyDown)
    this.bound = true
  }

  dispose(): void {
    if (!this.bound) return
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    window.removeEventListener('pointerup', this.handlePointerUp)
    window.removeEventListener('keydown', this.handleKeyDown)
    this.bound = false
  }

  private handlePointerDown = (evt: PointerEvent): void => {
    const tool = this.options.getActiveTool()
    if (!tool) return
    if (typeof this.canvas.setPointerCapture === 'function') {
      this.canvas.setPointerCapture(evt.pointerId)
    }
    const state = this.store.getState()
    const { x, y } = this.toDocumentCoordinates(evt)
    state.setPointer({ isDown: true, lastX: x, lastY: y })
    tool.onPointerDown(state, x, y, evt)
  }

  private handlePointerMove = (evt: PointerEvent): void => {
    const tool = this.options.getActiveTool()
    if (!tool) return
    const state = this.store.getState()
    const { x, y } = this.toDocumentCoordinates(evt)
    state.setPointer({ lastX: x, lastY: y })
    tool.onPointerMove(state, x, y, evt)
  }

  private handlePointerUp = (evt: PointerEvent): void => {
    const tool = this.options.getActiveTool()
    if (!tool) return
    const state = this.store.getState()
    const { x, y } = this.toDocumentCoordinates(evt)
    state.setPointer({ isDown: false, lastX: x, lastY: y })
    tool.onPointerUp(state, x, y, evt)
  }

  private handleKeyDown = (evt: KeyboardEvent): void => {
    if (evt.key === 'Escape') {
      const tool = this.options.getActiveTool()
      tool?.onCancel?.(this.store.getState())
    }
  }

  private toDocumentCoordinates(evt: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect()
    const x = evt.clientX - rect.left
    const y = evt.clientY - rect.top
    const state = this.store.getState()
    return screenToDocument(
      { x, y },
      state.view,
      state.view.zoom,
      state.document.width,
      state.document.height,
    )
  }
}
