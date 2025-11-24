import { useEffect, useState } from 'react'

import { executeCommand } from '../../state/commands/Command'
import { PaletteChangeCommand, type PaletteChangeOperation } from '../../state/commands/PaletteChangeCommand'
import { usePalette, useEditorStore } from '../../state/store'
import type { CRNGRange, PaletteColor } from '../../state/documentTypes'

import '../../styles/palette/PaletteEditor.css'

const clampChannel = (value: number): number => Math.max(0, Math.min(255, value))

const cloneColor = (color: PaletteColor): PaletteColor => ({ ...color })

const MAX_COLORS = 256
const MIN_COLORS = 2

const channelLabels: Array<keyof PaletteColor> = ['r', 'g', 'b', 'a']

const createPaletteCommand = (operations: PaletteChangeOperation[], label: string): PaletteChangeCommand =>
  new PaletteChangeCommand(operations, label)

export const PaletteEditor = () => {
  const palette = usePalette()
  const [selectedIndex, setSelectedIndex] = useState(palette.foregroundIndex)
  const setForegroundIndex = useEditorStore((state) => state.setForegroundIndex)

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, palette.colors.length - 1))
  }, [palette.colors.length])

  const selectedColor = palette.colors[selectedIndex] ?? palette.colors[0]

  const updateColorChannel = (channel: keyof PaletteColor, value: number) => {
    const color: PaletteColor = { ...selectedColor, [channel]: clampChannel(value) }
    executeCommand(createPaletteCommand([{ type: 'update', index: selectedIndex, color }], 'Update color'))
  }

  const addColor = () => {
    if (palette.colors.length >= MAX_COLORS) return
    const insertIndex = selectedIndex + 1
    const operations: PaletteChangeOperation[] = [
      { type: 'insert', index: insertIndex, color: cloneColor(selectedColor) },
    ]
    executeCommand(createPaletteCommand(operations, 'Insert color'))
    const nextIndex = Math.min(insertIndex, palette.colors.length)
    setSelectedIndex(nextIndex)
    setForegroundIndex(nextIndex)
  }

  const removeColor = () => {
    if (palette.colors.length <= MIN_COLORS) return
    executeCommand(createPaletteCommand([{ type: 'remove', index: selectedIndex }], 'Remove color'))
    const nextIndex = Math.max(0, Math.min(selectedIndex, palette.colors.length - 2))
    setSelectedIndex(nextIndex)
    setForegroundIndex(nextIndex)
  }

  const cycles = palette.cycles ?? []
  const currentCycle = cycles[0]

  const updateCycles = (next: CRNGRange[] | undefined) => {
    executeCommand(createPaletteCommand([{ type: 'setCycles', cycles: next ?? [] }], 'Update CRNG'))
  }

  return (
    <div className="palette-editor">
      <header className="palette-editor__header">
        <h2>Palette Editor</h2>
        <label>
          <span>Selected Index</span>
          <select
            value={selectedIndex}
            onChange={(event) => {
              const index = Number(event.target.value)
              setSelectedIndex(index)
              setForegroundIndex(index)
            }}
          >
            {palette.colors.map((_, index) => (
              <option key={index} value={index}>{`#${index}`}</option>
            ))}
          </select>
        </label>
      </header>
      <div className="channel-controls">
        {channelLabels.map((channel) => (
          <label key={channel} className="channel-group">
            <span>{channel.toUpperCase()}</span>
            <input
              type="range"
              min={0}
              max={255}
              value={selectedColor[channel]}
              onChange={(event) => updateColorChannel(channel, Number(event.target.value))}
            />
            <input
              type="number"
              min={0}
              max={255}
              value={selectedColor[channel]}
              onChange={(event) => updateColorChannel(channel, Number(event.target.value))}
            />
          </label>
        ))}
      </div>
      <div className="palette-editor-actions">
        <button
          type="button"
          onClick={addColor}
          disabled={palette.colors.length >= MAX_COLORS}
        >
          Add Color
        </button>
        <button
          type="button"
          onClick={removeColor}
          disabled={palette.colors.length <= MIN_COLORS}
        >
          Remove Color
        </button>
      </div>
      <div className="crng-controls">
        <label>
          <input
            type="checkbox"
            checked={Boolean(currentCycle?.active)}
            onChange={(event) => {
              if (!event.target.checked) {
                updateCycles([])
              } else {
                updateCycles([
                  {
                    rate: currentCycle?.rate ?? 1,
                    low: currentCycle?.low ?? 0,
                    high: currentCycle?.high ?? Math.min(1, palette.colors.length - 1),
                    active: true,
                  },
                ])
              }
            }}
          />
          Enable CRNG cycle
        </label>
        {currentCycle ? (
          <div className="cycle-fields">
            <label>
              Rate
              <input
                type="number"
                min={1}
                max={10}
                value={currentCycle.rate}
                onChange={(event) =>
                  updateCycles([{ ...currentCycle, rate: Math.max(1, Number(event.target.value)) }])
                }
              />
            </label>
            <label>
              Low
              <input
                type="number"
                min={0}
                max={palette.colors.length - 1}
                value={currentCycle.low}
                onChange={(event) =>
                  updateCycles([
                    {
                      ...currentCycle,
                      low: Math.max(0, Math.min(Number(event.target.value), palette.colors.length - 1)),
                    },
                  ])
                }
              />
            </label>
            <label>
              High
              <input
                type="number"
                min={0}
                max={palette.colors.length - 1}
                value={currentCycle.high}
                onChange={(event) =>
                  updateCycles([
                    {
                      ...currentCycle,
                      high: Math.max(0, Math.min(Number(event.target.value), palette.colors.length - 1)),
                    },
                  ])
                }
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  )
}
