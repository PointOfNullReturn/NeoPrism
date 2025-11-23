import { describe, expect, it } from 'vitest'

import { createIndexedBuffer, createRGBABuffer, resizeBuffer } from '../pixelBuffers'

const fillSequential = (array: Uint8Array | Uint32Array) => {
  for (let i = 0; i < array.length; i += 1) {
    array[i] = i
  }
}

describe('pixel buffer utilities', () => {
  it('creates indexed buffers within limits', () => {
    const buffer = createIndexedBuffer(64, 64)
    expect(buffer.kind).toBe('indexed8')
    expect(buffer.data).toHaveLength(64 * 64)
  })

  it('rejects invalid dimensions', () => {
    expect(() => createIndexedBuffer(1, 1)).toThrow()
    expect(() => createRGBABuffer(5000, 64)).toThrow()
  })

  it('resizes buffers and preserves overlapping pixels', () => {
    const buffer = createIndexedBuffer(64, 64)
    fillSequential(buffer.data)

    const resized = resizeBuffer(buffer, 32, 32)

    expect(resized.width).toBe(32)
    expect(resized.height).toBe(32)
    expect(resized.data[0]).toBe(0)
    expect(resized.data[1]).toBe(1)
    expect(resized.data[32]).toBe(64)
  })

  it('supports RGBA buffers', () => {
    const buffer = createRGBABuffer(32, 32)
    expect(buffer.kind).toBe('rgba32')
    expect(buffer.data).toBeInstanceOf(Uint32Array)
  })
})
