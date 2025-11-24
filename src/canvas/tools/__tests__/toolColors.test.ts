import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PickerTool } from '../PickerTool'
import { PencilTool } from '../PencilTool'
import { FillTool } from '../FillTool'
import { EraserTool } from '../EraserTool'
import { resetEditorStore, useEditorStore } from '../../../state/store'
import { undoLastCommand } from '../../../state/commands/Command'

const pointerEvent = (button = 0): PointerEvent => ({ button } as PointerEvent)

const getIndexedDocument = () => {
  const state = useEditorStore.getState()
  if (state.document.mode !== 'indexed8') {
    throw new Error('Tests expect indexed document mode')
  }
  return state.document
}

const mutateIndexedDocument = (mutator: (pixels: Uint8Array) => void) => {
  useEditorStore.getState().setDocument((doc) => {
    if (doc.mode !== 'indexed8') {
      return doc
    }
    const nextPixels = new Uint8Array(doc.pixels)
    mutator(nextPixels)
    return { ...doc, pixels: nextPixels }
  })
  return getIndexedDocument()
}

describe('Tool + color integration', () => {
  beforeEach(() => {
    resetEditorStore()
  })

  afterEach(() => {
    resetEditorStore()
  })

  it('Picker updates foreground and background color indices', () => {
    mutateIndexedDocument((pixels) => {
      pixels[0] = 9
    })
    const picker = new PickerTool()

    picker.onPointerDown(useEditorStore.getState(), 0, 0, pointerEvent(0))
    expect(useEditorStore.getState().tool.foregroundIndex).toBe(9)

    mutateIndexedDocument((pixels) => {
      pixels[1] = 3
    })
    picker.onPointerDown(useEditorStore.getState(), 1, 0, pointerEvent(2))
    expect(useEditorStore.getState().tool.backgroundIndex).toBe(3)
  })

  it('Pencil uses the configured foreground index and remains undoable', () => {
    useEditorStore.getState().setForegroundIndex(7)
    const pencil = new PencilTool()

    pencil.onPointerDown(useEditorStore.getState(), 0, 0, pointerEvent(0))
    pencil.onPointerUp(useEditorStore.getState(), 0, 0, pointerEvent(0))

    expect(getIndexedDocument().pixels[0]).toBe(7)
    undoLastCommand()
    expect(getIndexedDocument().pixels[0]).toBe(0)
  })

  it('Fill uses background when invoked with secondary button', () => {
    mutateIndexedDocument((pixels) => {
      pixels.fill(0)
    })
    const storeState = useEditorStore.getState()
    storeState.setForegroundIndex(4)
    storeState.setBackgroundIndex(2)
    const fill = new FillTool()

    fill.onPointerDown(useEditorStore.getState(), 0, 0, pointerEvent(2))
    expect(getIndexedDocument().pixels[0]).toBe(2)
    undoLastCommand()
    expect(getIndexedDocument().pixels[0]).toBe(0)
  })

  it('Eraser writes the configured background index', () => {
    const storeState = useEditorStore.getState()
    storeState.setForegroundIndex(6)
    storeState.setBackgroundIndex(1)
    const pencil = new PencilTool()
    const eraser = new EraserTool()

    pencil.onPointerDown(useEditorStore.getState(), 0, 0, pointerEvent(0))
    pencil.onPointerUp(useEditorStore.getState(), 0, 0, pointerEvent(0))
    expect(getIndexedDocument().pixels[0]).toBe(6)

    eraser.onPointerDown(useEditorStore.getState(), 0, 0, pointerEvent(0))
    eraser.onPointerUp(useEditorStore.getState(), 0, 0, pointerEvent(0))
    expect(getIndexedDocument().pixels[0]).toBe(1)
  })
})
