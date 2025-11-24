import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { drawLine } from './drawHelpers'
import { executeCommand, nextCommandId } from '../../state/commands/Command'
import type { Command } from '../../state/commands/Command'
import { getPointerColor } from './colorSelection'

class RectangleCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Rectangle'
  private readonly beforeIndexed?: Uint8Array
  private readonly beforeRgba?: Uint32Array
  private readonly start: [number, number]
  private readonly end: [number, number]
  private readonly value: number
  private readonly filled: boolean
  private readonly isIndexed: boolean

  constructor(
    document: EditorStoreState['document'],
    start: [number, number],
    end: [number, number],
    value: number,
    filled: boolean,
  ) {
    this.id = nextCommandId('rect')
    this.createdAt = Date.now()
    this.start = start
    this.end = end
    this.value = value
    this.filled = filled
    this.isIndexed = document.mode === 'indexed8'
    if (document.mode === 'indexed8') {
      this.beforeIndexed = new Uint8Array(document.pixels)
    } else {
      this.beforeRgba = new Uint32Array(document.pixels)
    }
  }

  do(state: EditorStoreState): void {
    const [x0, y0] = this.start
    const [x1, y1] = this.end
    if (this.filled) {
      const minX = Math.min(x0, x1)
      const maxX = Math.max(x0, x1)
      const minY = Math.min(y0, y1)
      const maxY = Math.max(y0, y1)
      for (let y = minY; y <= maxY; y += 1) {
        drawLine(state.document, minX, y, maxX, y, this.value)
      }
      return
    }
    drawLine(state.document, x0, y0, x1, y0, this.value)
    drawLine(state.document, x1, y0, x1, y1, this.value)
    drawLine(state.document, x1, y1, x0, y1, this.value)
    drawLine(state.document, x0, y1, x0, y0, this.value)
  }

  undo(state: EditorStoreState): void {
    if (this.isIndexed && this.beforeIndexed) {
      state.setDocument({ ...state.document, pixels: new Uint8Array(this.beforeIndexed) })
      return
    }
    if (!this.isIndexed && this.beforeRgba) {
      state.setDocument({ ...state.document, pixels: new Uint32Array(this.beforeRgba) })
    }
  }
}

export class RectangleTool implements Tool {
  id = 'rectangle'
  private start: [number, number] | null = null
  private drawValue = 1

  onPointerDown(state: EditorStoreState, x: number, y: number, evt: PointerEvent): void {
    this.start = [x, y]
    this.drawValue = getPointerColor(state, evt)
  }

  onPointerMove(_state: EditorStoreState, _x: number, _y: number, _evt: PointerEvent): void {}

  onPointerUp(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    if (!this.start) return
    const command = new RectangleCommand(
      state.document,
      this.start,
      [x, y],
      this.drawValue,
      state.tool.rectangleFilled,
    )
    command.do(state)
    executeCommand(command, { skipDo: true })
    this.start = null
  }
}
