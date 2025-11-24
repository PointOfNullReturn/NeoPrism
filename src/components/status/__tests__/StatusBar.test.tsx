import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { StatusBar } from '../StatusBar'
import { resetEditorStore, useEditorStore } from '../../../state/store'

const getState = () => useEditorStore.getState()

describe('StatusBar', () => {
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

  it('renders FG/BG indices and hex values', () => {
    render(<StatusBar />)
    expect(screen.getByText(/FG/i)).toBeInTheDocument()
    expect(screen.getByText(/BG/i)).toBeInTheDocument()
  })

  it('updates readout when palette changes', () => {
    render(<StatusBar />)
    act(() => {
      getState().setForegroundIndex(5)
      getState().setPaletteColors(
        getState().palette.colors.map((color, index) =>
          index === 5 ? { ...color, r: 200, g: 10, b: 20, a: 255 } : color,
        ),
      )
    })
    expect(screen.getByText('#005')).toBeInTheDocument()
    expect(screen.getByText('#C80A14')).toBeInTheDocument()
  })
})
