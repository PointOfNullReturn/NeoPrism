import { afterEach, describe, expect, it } from 'vitest'

import {
  createDefaultHistory,
  createDefaultIndexedDocument,
  createDefaultPalette,
  createDefaultPointer,
  createDefaultToolState,
  createDefaultView,
  resetEditorStore,
  useEditorStore,
} from '../store'
import type { ZoomLevel } from '../documentTypes'

const getState = () => useEditorStore.getState()

afterEach(() => {
  resetEditorStore()
})

describe('useEditorStore defaults', () => {
  it('provides the expected initial document/view/history/tool/pointer state', () => {
    const state = getState()
    expect(state.document.mode).toBe('indexed8')
    expect(state.document.width).toBe(320)
    expect(state.document.height).toBe(200)
    expect(state.document.palette).toHaveLength(32)
    expect(state.view).toEqual(createDefaultView())
    expect(state.history).toEqual(createDefaultHistory())
    expect(state.pointer).toEqual(createDefaultPointer())
    expect(state.tool).toEqual(createDefaultToolState())
  })
})

describe('document actions', () => {
  it('replaces the document when passing an object', () => {
    const nextDoc = {
      ...createDefaultIndexedDocument(),
      width: 640,
      height: 400,
    }
    getState().setDocument(nextDoc)
    expect(getState().document.width).toBe(640)
  })

  it('updates the document via updater function', () => {
    getState().setDocument((doc) => ({
      ...doc,
      width: 128,
      height: 128,
    }))
    const { width, height } = getState().document
    expect(width).toBe(128)
    expect(height).toBe(128)
  })
})

describe('view actions', () => {
  it('updates view via updater', () => {
    const next = createDefaultView()
    next.offsetX = 10
    getState().updateView(() => next)
    expect(getState().view.offsetX).toBe(10)
  })

  it('clamps zoom levels', () => {
    const validZoom: ZoomLevel = 8
    getState().setZoom(validZoom)
    expect(getState().view.zoom).toBe(validZoom)
    getState().setZoom(3 as ZoomLevel)
    expect(getState().view.zoom).toBe(4)
  })
  it('sets offsets and toggles grid', () => {
    getState().setViewOffsets(10, 20)
    expect(getState().view.offsetX).toBe(10)
    expect(getState().view.offsetY).toBe(20)
    getState().toggleGrid()
    expect(getState().view.showGrid).toBe(true)
    getState().toggleGrid(false)
    expect(getState().view.showGrid).toBe(false)
  })
})

describe('pointer + tool actions', () => {
  it('merges pointer state', () => {
    getState().setPointer({ isDown: true, lastX: 5 })
    expect(getState().pointer).toEqual({ isDown: true, lastX: 5, lastY: 0 })
  })

  it('sets active tool', () => {
    getState().setTool('line')
    expect(getState().tool.activeToolId).toBe('line')
  })

  it('updates foreground/background color indices', () => {
    getState().setForegroundIndex(7)
    expect(getState().tool.foregroundIndex).toBe(7)
    getState().setBackgroundIndex(3)
    expect(getState().tool.backgroundIndex).toBe(3)
  })
})

describe('history actions', () => {
  it('merges history updates', () => {
    const fakeHistory = {
      undoStack: [{ do: () => {}, undo: () => {} }],
      redoStack: [],
      limit: 42,
    }
    getState().setHistory(fakeHistory)
    expect(getState().history.limit).toBe(42)
    expect(getState().history.undoStack).toHaveLength(1)
  })

  it('resets history to default', () => {
    getState().setHistory({ limit: 50 })
    getState().resetHistory()
    expect(getState().history).toEqual(createDefaultHistory())
  })
})

describe('palette helper', () => {
  it('generates clamped palette sizes', () => {
    expect(createDefaultPalette(1)).toHaveLength(2)
    expect(createDefaultPalette(300)).toHaveLength(256)
  })
})
