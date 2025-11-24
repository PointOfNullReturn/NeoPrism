import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PaletteEditor } from '../PaletteEditor'
import { resetEditorStore, useEditorStore } from '../../../state/store'

const getState = () => useEditorStore.getState()

describe('PaletteEditor', () => {
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

  it('updates palette colors via sliders and records history', () => {
    render(<PaletteEditor />)
    const slider = screen.getAllByRole('slider')[0]
    act(() => {
      fireEvent.change(slider, { target: { value: '128' } })
    })
    expect(getState().palette.colors[1].r).toBe(128)
    expect(getState().history.undoStack).toHaveLength(1)
  })

  it('adds and removes colors while clamping selection', () => {
    render(<PaletteEditor />)
    const addButton = screen.getByRole('button', { name: 'Add Color' })
    act(() => {
      fireEvent.click(addButton)
    })
    expect(getState().palette.colors).toHaveLength(33)
    const removeButton = screen.getByRole('button', { name: 'Remove Color' })
    act(() => {
      fireEvent.click(removeButton)
    })
    expect(getState().palette.colors).toHaveLength(32)
  })

  it('toggles CRNG cycles', () => {
    render(<PaletteEditor />)
    const checkbox = screen.getByRole('checkbox', { name: /enable crng/i })
    act(() => {
      fireEvent.click(checkbox)
    })
    expect(getState().palette.cycles).toHaveLength(1)
    act(() => {
      fireEvent.click(checkbox)
    })
    expect(getState().palette.cycles).toHaveLength(0)
  })
})
