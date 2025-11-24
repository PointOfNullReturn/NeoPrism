import '../styles/App.css'

import { PaletteView } from '../components/palette/PaletteView'
import { PaletteEditor } from '../components/palette/PaletteEditor'
import { StatusBar } from '../components/status/StatusBar'

function App() {
  return (
    <div className="app-shell">
      <header>
        <h1>SwankyPaint (MVP)</h1>
      </header>
      <main>
        <section aria-label="Palette">
          <PaletteView />
        </section>
        <section aria-label="Palette editor">
          <PaletteEditor />
        </section>
      </main>
      <StatusBar />
    </div>
  )
}

export default App
