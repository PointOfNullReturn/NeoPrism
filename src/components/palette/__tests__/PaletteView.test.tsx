import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PaletteView } from '../PaletteView'
import { resetEditorStore, useEditorStore } from '../../../state/store'

const getPaletteState = () => useEditorStore.getState().palette

describe('PaletteView', () => {
  beforeEach(() => {
    act(() => {
      resetEditorStore()
    })
  })

  afterEach(() => {
    act(() => {
      resetEditorStore()
    })
  })

  it('renders all palette swatches with accessible labels', () => {
    render(<PaletteView />)
    const buttons = screen.getAllByRole('gridcell')
    expect(buttons).toHaveLength(getPaletteState().colors.length)
    expect(buttons[0]).toHaveAttribute('aria-label')
  })

  it('handles mouse input to set foreground/background indices', () => {
    render(<PaletteView />)
    const buttons = screen.getAllByRole('gridcell')
    fireEvent.pointerDown(buttons[5], { button: 0 })
    expect(getPaletteState().foregroundIndex).toBe(5)
    fireEvent.pointerDown(buttons[3], { button: 2 })
    expect(getPaletteState().backgroundIndex).toBe(3)
  })

  it('supports keyboard navigation and selection', () => {
    render(<PaletteView />)
    const buttons = screen.getAllByRole('gridcell')
    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(buttons[1])
    fireEvent.keyDown(buttons[1], { key: 'Enter' })
    expect(getPaletteState().foregroundIndex).toBe(1)
    fireEvent.keyDown(buttons[1], { key: 'Enter', shiftKey: true })
    expect(getPaletteState().backgroundIndex).toBe(1)
  })

  it('advances focus vertically with arrow keys', () => {
    render(<PaletteView />)
    const buttons = screen.getAllByRole('gridcell')
    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(buttons[16])
  })
})
