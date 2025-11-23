import { afterEach, describe, expect, it } from 'vitest'

import { executeCommand, redoLastCommand, undoLastCommand } from '../Command'
import { ClearDocumentCommand } from '../ClearDocumentCommand'
import { resetEditorStore, useEditorStore } from '../../store'

const getStore = () => useEditorStore.getState()

afterEach(() => {
  resetEditorStore()
})

describe('command execution', () => {
  it('executes command and tracks undo history', () => {
    const command = new ClearDocumentCommand(getStore().document)

    executeCommand(command)

    const storeAfter = getStore()
    expect(storeAfter.history.undoStack).toHaveLength(1)
    expect(storeAfter.history.redoStack).toHaveLength(0)
    expect(storeAfter.document.pixels.every((value) => value === 0)).toBe(true)
  })

  it('undoes and redoes commands', () => {
    getStore().setDocument((doc) => ({
      ...doc,
      pixels: new Uint8Array(doc.pixels.map(() => 5)),
    }))

    const command = new ClearDocumentCommand(getStore().document)
    executeCommand(command)

    expect(getStore().history.undoStack).toHaveLength(1)

    const undone = undoLastCommand()
    expect(undone).toBe(command)
    expect(getStore().document.pixels[0]).toBe(5)
    expect(getStore().history.redoStack).toHaveLength(1)

    const redone = redoLastCommand()
    expect(redone).toBe(command)
    expect(getStore().document.pixels[0]).toBe(0)
    expect(getStore().history.undoStack).toHaveLength(1)
  })
})
