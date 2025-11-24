import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { drawLine } from './drawHelpers'
import { executeCommand, nextCommandId } from '../../state/commands/Command'
import type { Command } from '../../state/commands/Command'

class EraseCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Erase stroke'
  private readonly beforeIndexed?: Uint8Array
  private readonly beforeRgba?: Uint32Array
  private readonly coordinates: Array<[number, number]> = []
  private readonly value: number
  private readonly isIndexed: boolean

  constructor(document: EditorStoreState['document'], value: number) {
    this.id = nextCommandId('erase')
    this.createdAt = Date.now()
    this.value = value
    this.isIndexed = document.mode === 'indexed8'
    if (document.mode === 'indexed8') {
      this.beforeIndexed = new Uint8Array(document.pixels)
    } else {
      this.beforeRgba = new Uint32Array(document.pixels)
    }
  }

  addPoint(point: [number, number]): void {
    this.coordinates.push(point)
  }

  do(state: EditorStoreState): void {
    const doc = state.document
    if (this.coordinates.length === 0) return
    let prev = this.coordinates[0]
    drawLine(doc, prev[0], prev[1], prev[0], prev[1], this.value)
    for (let i = 1; i < this.coordinates.length; i += 1) {
      const point = this.coordinates[i]
      drawLine(doc, prev[0], prev[1], point[0], point[1], this.value)
      prev = point
    }
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

export class EraserTool implements Tool {
  id = 'eraser'
  private activeCommand: EraseCommand | null = null
  private lastPoint: [number, number] | null = null
  private eraseValue = 0

  onPointerDown(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    this.eraseValue = state.tool.backgroundIndex
    this.activeCommand = new EraseCommand(state.document, this.eraseValue)
    this.activeCommand.addPoint([x, y])
    drawLine(state.document, x, y, x, y, this.eraseValue)
    this.lastPoint = [x, y]
  }

  onPointerMove(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    if (!this.activeCommand || !this.lastPoint) return
    drawLine(state.document, this.lastPoint[0], this.lastPoint[1], x, y, this.eraseValue)
    this.activeCommand.addPoint([x, y])
    this.lastPoint = [x, y]
  }

  onPointerUp(state: EditorStoreState, x: number, y: number, _evt: PointerEvent): void {
    if (!this.activeCommand) return
    this.activeCommand.addPoint([x, y])
    executeCommand(this.activeCommand, { skipDo: true })
    this.activeCommand = null
    this.lastPoint = null
  }
}
