import { memo } from 'react'

import { usePalette, useEditorStore } from '../../state/store'
import type { PaletteColor } from '../../state/documentTypes'

import '../../styles/palette/PaletteView.css'

const toCssColor = (color: PaletteColor): string => `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`

const getAriaLabel = (index: number, color: PaletteColor): string =>
  `Color ${index}: r ${color.r}, g ${color.g}, b ${color.b}, a ${color.a}`

const clampIndex = (index: number, max: number): number => {
  if (max < 0) return 0
  return Math.max(0, Math.min(index, max))
}

const columns = 16

export const PaletteView = memo(() => {
  const palette = usePalette()
  const setForegroundIndex = useEditorStore((state) => state.setForegroundIndex)
  const setBackgroundIndex = useEditorStore((state) => state.setBackgroundIndex)
  const swatches = palette.colors
  const maxIndex = swatches.length - 1

  const focusSwatch = (current: number, direction: 'left' | 'right' | 'up' | 'down'): number => {
    switch (direction) {
      case 'left':
        return clampIndex(current - 1, maxIndex)
      case 'right':
        return clampIndex(current + 1, maxIndex)
      case 'up':
        return clampIndex(current - columns, maxIndex)
      case 'down':
        return clampIndex(current + columns, maxIndex)
      default:
        return current
    }
  }

  return (
    <div className="palette-view" role="grid" aria-label="Palette swatches">
      {swatches.map((color, index) => {
        const isFg = index === palette.foregroundIndex
        const isBg = index === palette.backgroundIndex
        const style = { backgroundColor: toCssColor(color) }
        const label = getAriaLabel(index, color)
        return (
          <button
            key={index}
            type="button"
            role="gridcell"
            aria-label={label}
            className={`palette-swatch${isFg ? ' is-foreground' : ''}${isBg ? ' is-background' : ''}`}
            style={style}
            onContextMenu={(event) => {
              event.preventDefault()
            }}
            onClick={(event) => {
              event.preventDefault()
              setForegroundIndex(index)
            }}
            onPointerDown={(event) => {
              event.preventDefault()
              if (event.button === 2) {
                setBackgroundIndex(index)
              } else {
                setForegroundIndex(index)
              }
            }}
            onKeyDown={(event) => {
              switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowRight':
                case 'ArrowUp':
                case 'ArrowDown': {
                  event.preventDefault()
                  const nextIndex = focusSwatch(index, event.key.replace('Arrow', '').toLowerCase() as never)
                  const element = event.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement | undefined
                  element?.focus()
                  break
                }
                case 'Enter':
                case ' ': {
                  event.preventDefault()
                  if (event.shiftKey) {
                    setBackgroundIndex(index)
                  } else {
                    setForegroundIndex(index)
                  }
                  break
                }
                default:
                  break
              }
            }}
          />
        )
      })}
    </div>
  )
})
