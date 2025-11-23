import { describe, expect, it, vi } from 'vitest'

import type { PaletteColor } from '../../state/documentTypes'
import { CanvasRenderer } from '../renderer'
import { createIndexedBuffer, createRGBABuffer } from '../pixelBuffers'

const createMockContext = () => {
  const imageDataFactory = (width: number, height: number) => ({
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4),
  })

  return {
    imageSmoothingEnabled: false,
    createImageData: vi.fn(imageDataFactory),
    putImageData: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D
}

describe('CanvasRenderer', () => {
  it('converts indexed buffers into image data and draws at 1x zoom', () => {
    const canvas = document.createElement('canvas')
    const context = createMockContext()
    const offscreenCanvas = document.createElement('canvas')
    const offscreenContext = createMockContext()
    const renderer = new CanvasRenderer(canvas, {
      zoom: 1,
      context,
      offscreenCanvas,
      offscreenContext,
    })

    const buffer = createIndexedBuffer(32, 32)
    buffer.data.fill(1)
    const palette: PaletteColor[] = [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 0, b: 0, a: 255 },
    ]

    renderer.render({ mode: 'indexed8', width: 32, height: 32, pixels: buffer.data, palette })

    expect(canvas.width).toBe(32)
    expect(canvas.height).toBe(32)
  })

  it('renders RGBA buffers and scales canvas to zoom', () => {
    const canvas = document.createElement('canvas')
    const context = createMockContext()
    const offscreenCanvas = document.createElement('canvas')
    const offscreenContext = createMockContext()
    const renderer = new CanvasRenderer(canvas, {
      zoom: 2,
      context,
      offscreenCanvas,
      offscreenContext,
    })

    const buffer = createRGBABuffer(32, 32)
    buffer.data.fill(0xff0000ff)

    renderer.render({ mode: 'rgba32', width: 32, height: 32, pixels: buffer.data })

    expect(canvas.width).toBe(64)
    expect(canvas.height).toBe(64)
  })
})
