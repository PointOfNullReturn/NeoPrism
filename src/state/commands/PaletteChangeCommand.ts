import type { Command } from './Command'
import { nextCommandId } from './Command'
import { useEditorStore, type EditorStoreState } from '../store'
import type { CRNGRange, PaletteColor, PaletteState } from '../documentTypes'

export type PaletteChangeOperation =
  | { type: 'update'; index: number; color: PaletteColor }
  | { type: 'insert'; index: number; color: PaletteColor }
  | { type: 'remove'; index: number }
  | { type: 'setCycles'; cycles: CRNGRange[] }

const cloneCycles = (cycles: CRNGRange[] | undefined): CRNGRange[] =>
  (cycles ?? []).map((range) => ({ ...range }))

const cloneColor = (color?: PaletteColor): PaletteColor => ({
  r: color?.r ?? 0,
  g: color?.g ?? 0,
  b: color?.b ?? 0,
  a: color?.a ?? 255,
})

const clampIndexSafe = (index: number, length: number): number => {
  if (length <= 0) return 0
  return Math.max(0, Math.min(index, length - 1))
}

const applyOperation = (state: EditorStoreState, op: PaletteChangeOperation): void => {
  switch (op.type) {
    case 'update':
      state.updatePaletteColor(op.index, op.color)
      break
    case 'insert':
      state.insertPaletteColor(op.index, op.color)
      break
    case 'remove':
      state.removePaletteColor(op.index)
      break
    case 'setCycles':
      state.setPaletteCycles(op.cycles)
      break
    default:
      break
  }
}

const inverseOperation = (palette: PaletteState, op: PaletteChangeOperation): PaletteChangeOperation => {
  switch (op.type) {
    case 'update': {
      const index = clampIndexSafe(op.index, palette.colors.length)
      const previous = palette.colors[index]
      return { type: 'update', index, color: cloneColor(previous) }
    }
    case 'insert': {
      const insertAt = Math.max(0, Math.min(op.index, palette.colors.length))
      return { type: 'remove', index: insertAt }
    }
    case 'remove': {
      const index = clampIndexSafe(op.index, palette.colors.length)
      const removed = palette.colors[index]
      return { type: 'insert', index, color: cloneColor(removed) }
    }
    case 'setCycles': {
      return { type: 'setCycles', cycles: cloneCycles(palette.cycles) }
    }
    default:
      return op
  }
}

export class PaletteChangeCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label: string
  private readonly operations: PaletteChangeOperation[]
  private undoOperations: PaletteChangeOperation[] | null = null

  constructor(operations: PaletteChangeOperation[], label = 'Palette change') {
    this.id = nextCommandId('palette')
    this.createdAt = Date.now()
    this.operations = operations
    this.label = label
  }

  do(state: EditorStoreState): void {
    if (!this.undoOperations) {
      this.undoOperations = []
      for (const op of this.operations) {
        const snapshot = useEditorStore.getState().palette
        this.undoOperations.push(inverseOperation(snapshot, op))
        applyOperation(state, op)
      }
      return
    }
    this.operations.forEach((op) => applyOperation(state, op))
  }

  undo(state: EditorStoreState): void {
    if (!this.undoOperations) {
      return
    }
    for (let i = this.undoOperations.length - 1; i >= 0; i -= 1) {
      applyOperation(state, this.undoOperations[i])
    }
  }
}
