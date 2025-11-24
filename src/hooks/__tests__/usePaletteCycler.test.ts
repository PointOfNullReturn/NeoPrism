import { describe, expect, it } from 'vitest'

import type { PaletteColor } from '../../state/documentTypes'
import { __internal } from '../usePaletteCycler'

const createColors = (values: Array<[number, number, number]>): PaletteColor[] =>
  values.map(([r, g, b]) => ({ r, g, b, a: 255 }))

describe('usePaletteCycler helpers', () => {
  it('rotates palette slices forward with wraparound', () => {
    const colors = createColors([
      [0, 0, 0],
      [1, 0, 0],
      [2, 0, 0],
      [3, 0, 0],
    ])
    const changed = __internal.rotateRangeInPlace(colors, 1, 3, 1)
    expect(changed).toBe(true)
    expect(colors.map((c) => c.r)).toEqual([0, 3, 1, 2])
  })

  it('ignores ranges that would not change', () => {
    const colors = createColors([
      [0, 0, 0],
      [1, 0, 0],
    ])
    const changed = __internal.rotateRangeInPlace(colors, 0, 0, 4)
    expect(changed).toBe(false)
    expect(colors.map((c) => c.r)).toEqual([0, 1])
  })

  it('computes sensible intervals for cycles', () => {
    const fast = __internal.getCycleInterval({ rate: 60, low: 0, high: 1, active: true })
    const slow = __internal.getCycleInterval({ rate: 1, low: 0, high: 1, active: true })
    const fallback = __internal.getCycleInterval({ rate: 0, low: 0, high: 1, active: true })
    expect(fast).toBeLessThan(slow)
    expect(fallback).toBeGreaterThan(100)
  })
})
