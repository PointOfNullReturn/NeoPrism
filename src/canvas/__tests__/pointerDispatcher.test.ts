import { describe, expect, it, vi } from 'vitest'

import type { Tool } from '../Tool'
import { PointerDispatcher } from '../pointerDispatcher'
import { resetEditorStore } from '../../state/store'

const mockTool = (): Tool => ({
  id: 'mock',
  onPointerDown: vi.fn(),
  onPointerMove: vi.fn(),
  onPointerUp: vi.fn(),
})

describe('PointerDispatcher', () => {
  it('dispatches pointer events to active tool', () => {
    const tool = mockTool()
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 200
    document.body.appendChild(canvas)
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 320,
      bottom: 200,
      width: 320,
      height: 200,
      toJSON: () => ({}),
    })

    const dispatcher = new PointerDispatcher({ canvas, getActiveTool: () => tool })
    dispatcher.bind()

    canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 20 }))
    expect(tool.onPointerDown).toHaveBeenCalled()

    window.dispatchEvent(new PointerEvent('pointerup', { clientX: 10, clientY: 20 }))
    expect(tool.onPointerUp).toHaveBeenCalled()

    dispatcher.dispose()
    canvas.remove()
    resetEditorStore()
  })
})
