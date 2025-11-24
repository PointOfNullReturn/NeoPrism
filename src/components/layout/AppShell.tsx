import { useEffect } from 'react'

import { PaletteView } from '../palette/PaletteView'
import { PaletteEditor } from '../palette/PaletteEditor'
import { StatusBar } from '../status/StatusBar'
import { EditorCanvas } from '../canvas/EditorCanvas'
import { Toolbar } from '../toolbar/Toolbar'
import { Menubar } from '../menubar/Menubar'
import { usePaletteCycler } from '../../hooks/usePaletteCycler'
import { registerCycleToggleShortcut } from '../../canvas/keyboardShortcuts'

import '../../styles/layout/AppShell.css'

export const AppShell = () => {
  usePaletteCycler()
  useEffect(() => {
    const dispose = registerCycleToggleShortcut()
    return dispose
  }, [])
  return (
    <div className="app-shell-grid">
      <header className="app-menubar" aria-label="Application menu">
        <Menubar />
      </header>
      <aside className="app-toolbar" aria-label="Tools">
        <Toolbar />
      </aside>
      <main className="app-canvas-area" aria-label="Canvas area">
        <EditorCanvas />
      </main>
      <aside className="app-sidebar" aria-label="Palette sidebar">
        <PaletteView />
        <PaletteEditor />
      </aside>
      <StatusBar />
    </div>
  )
}
