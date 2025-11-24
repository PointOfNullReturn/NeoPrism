import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { floodFill } from './floodFill'
import { executeCommand, nextCommandId } from '../../state/commands/Command'
import type { Command } from '../../state/commands/Command'
import { getPointerColor } from './colorSelection'

class FillCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Fill'
  private readonly beforeIndexed?: Uint8Array
  private readonly beforeRgba?: Uint32Array
  private readonly isIndexed: boolean
  private readonly start: [number, number]
  private readonly value: number

  constructor(document: EditorStoreState['document'], start: [number, number], value: number) {
    this.id = nextCommandId('fill')
    this.createdAt = Date.now()
    this.isIndexed = document.mode === 'indexed8'
    if (document.mode === 'indexed8') {
      this.beforeIndexed = new Uint8Array(document.pixels)
    } else {
      this.beforeRgba = new Uint32Array(document.pixels)
    }
    this.start = start
    this.value = value
  }

  do(state: EditorStoreState): void {
    floodFill(state.document, this.start[0], this.start[1], this.value)
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

export class FillTool implements Tool {
  id = 'fill'

  onPointerDown(state: EditorStoreState, x: number, y: number, evt: PointerEvent): void {
    const fillValue = getPointerColor(state, evt)
    const command = new FillCommand(state.document, [x, y], fillValue)
    command.do(state)
    executeCommand(command, { skipDo: true })
  }

  onPointerMove(_state: EditorStoreState, _x: number, _y: number, _evt: PointerEvent): void {}

  onPointerUp(_state: EditorStoreState, _x: number, _y: number, _evt: PointerEvent): void {}
}
