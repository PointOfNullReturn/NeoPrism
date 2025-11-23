import { describe, expect, it } from 'vitest'

import type { CommandLike, HistoryState } from '../documentTypes'
import { canRedo, canUndo, popRedo, popUndo, pushRedo, pushUndo } from '../undoRedo'

const makeHistory = (overrides: Partial<HistoryState> = {}): HistoryState => ({
  undoStack: [],
  redoStack: [],
  limit: 2,
  ...overrides,
})

interface MockCommand extends CommandLike {
  id: string
}

const mockCommand = (id: string): MockCommand => ({
  id,
  do: () => undefined,
  undo: () => undefined,
})

describe('undo/redo helpers', () => {
  it('pushes undo with limit', () => {
    let history = makeHistory({ undoStack: [mockCommand('a'), mockCommand('b')] })
    history = pushUndo(history, mockCommand('c'))
    expect(history.undoStack.map((cmd) => (cmd as MockCommand).id)).toEqual(['b', 'c'])
  })

  it('pops undo', () => {
    const history = makeHistory({ undoStack: [mockCommand('a')] })
    const { command, history: next } = popUndo(history)
    expect((command as MockCommand).id).toBe('a')
    expect(next.undoStack).toHaveLength(0)
  })

  it('pushes and pops redo', () => {
    let history = makeHistory()
    history = pushRedo(history, mockCommand('z'))
    expect(canRedo(history)).toBe(true)
    const { command } = popRedo(history)
    expect((command as MockCommand).id).toBe('z')
  })

  it('reports availability flags', () => {
    const empty = makeHistory()
    expect(canUndo(empty)).toBe(false)
    expect(canRedo(empty)).toBe(false)

    const undo = makeHistory({ undoStack: [mockCommand('u')] })
    expect(canUndo(undo)).toBe(true)
    const redo = makeHistory({ redoStack: [mockCommand('r')] })
    expect(canRedo(redo)).toBe(true)
  })
})
