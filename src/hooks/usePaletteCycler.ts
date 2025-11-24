import { useEffect } from 'react'

import { useEditorStore } from '../state/store'
import type { CRNGRange, PaletteColor } from '../state/documentTypes'

const MIN_INTERVAL_MS = 30
const DEFAULT_INTERVAL_MS = 250

const rotateRangeInPlace = (
  colors: PaletteColor[],
  low: number,
  high: number,
  steps: number,
): boolean => {
  const length = high - low + 1
  if (length <= 1) {
    return false
  }
  const normalized = ((steps % length) + length) % length
  if (normalized === 0) {
    return false
  }
  const slice = colors.slice(low, high + 1)
  for (let i = 0; i < length; i += 1) {
    const fromIndex = (i - normalized + length) % length
    colors[low + i] = slice[fromIndex]
  }
  return true
}

const getCycleInterval = (cycle: CRNGRange): number => {
  const rate = Math.max(0, cycle.rate ?? 0)
  if (rate <= 0) {
    return DEFAULT_INTERVAL_MS
  }
  const capped = Math.min(rate, 60)
  return Math.max(MIN_INTERVAL_MS, 1000 / capped)
}

export const usePaletteCycler = () => {
  useEffect(() => {
    let rafId: number | null = null
    const accumulators = new Map<string, number>()
    let previousTimestamp = performance.now()

    const tick = (timestamp: number) => {
      const state = useEditorStore.getState()
      const cycles = state.palette.cycles ?? []
      const activeCycles = cycles.filter(
        (cycle) =>
          cycle.active &&
          cycle.high > cycle.low &&
          cycle.low >= 0 &&
          cycle.high < state.palette.colors.length,
      )
      if (!state.view.cycleAnimationEnabled || activeCycles.length === 0) {
        accumulators.clear()
        previousTimestamp = timestamp
        rafId = requestAnimationFrame(tick)
        return
      }
      const delta = timestamp - previousTimestamp
      previousTimestamp = timestamp
      const paletteClone = state.palette.colors.map((color) => ({ ...color }))
      let dirty = false
      const nextKeys = new Set<string>()
      activeCycles.forEach((cycle, index) => {
        const key = `${cycle.low}-${cycle.high}-${index}`
        nextKeys.add(key)
        const interval = getCycleInterval(cycle)
        const carry = (accumulators.get(key) ?? 0) + delta
        if (carry < interval) {
          accumulators.set(key, carry)
          return
        }
        const steps = Math.max(1, Math.floor(carry / interval))
        accumulators.set(key, carry - steps * interval)
        if (rotateRangeInPlace(paletteClone, cycle.low, cycle.high, steps)) {
          dirty = true
        }
      })
      for (const key of accumulators.keys()) {
        if (!nextKeys.has(key)) {
          accumulators.delete(key)
        }
      }
      if (dirty) {
        state.setPaletteColors(paletteClone)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame((timestamp) => {
      previousTimestamp = timestamp
      tick(timestamp)
    })
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])
}

export const __internal = {
  rotateRangeInPlace,
  getCycleInterval,
}
