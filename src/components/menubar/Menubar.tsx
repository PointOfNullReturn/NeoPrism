import { useRef, useState } from 'react'

import { AboutModal } from './AboutModal'
import { useEditorStore } from '../../state/store'
import { resetEditorStore } from '../../state/store'
import { serializeProject } from '../../persistence/saveProject'
import { loadProject } from '../../persistence/loadProject'
import { exportCurrentDocumentToPng } from '../../persistence/exportPng'
import { importIlbmFromFile } from '../../iff/importIlbm'

import '../../styles/layout/Menubar.css'

export const Menubar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const fileInputJson = useRef<HTMLInputElement | null>(null)
  const fileInputIlbm = useRef<HTMLInputElement | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu))
  }
  const closeMenu = () => setOpenMenu(null)

  const handleNew = () => {
    resetEditorStore()
    closeMenu()
  }

  const handleSave = () => {
    const snapshot = serializeProject(useEditorStore.getState())
    const blob = new Blob([snapshot], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'swankypaint-project.json'
    a.click()
    URL.revokeObjectURL(url)
    closeMenu()
  }

  const handleOpenJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const content = await file.text()
    loadProject(content)
    event.target.value = ''
    closeMenu()
  }

  const handleOpenIlbm = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await importIlbmFromFile(file)
    event.target.value = ''
    closeMenu()
  }

  return (
    <>
      <nav className="menubar">
        <button type="button" onClick={() => toggleMenu('file')}>
          File
        </button>
        {openMenu === 'file' && (
          <ul className="menu" role="menu">
            <li>
              <button type="button" onClick={handleNew}>
                New
              </button>
            </li>
            <li>
              <button type="button" onClick={() => fileInputJson.current?.click()}>Open JSON</button>
            </li>
            <li>
              <button type="button" onClick={() => fileInputIlbm.current?.click()}>Open ILBM</button>
            </li>
            <li>
              <button type="button" onClick={handleSave}>Save JSON</button>
            </li>
            <li>
              <button type="button" onClick={() => exportCurrentDocumentToPng()}>Export PNG</button>
            </li>
          </ul>
        )}
        <button type="button" onClick={() => toggleMenu('view')}>
          View
        </button>
        {openMenu === 'view' && <ViewMenu onRequestClose={closeMenu} />}
        <button type="button" onClick={() => toggleMenu('help')}>
          Help
        </button>
        {openMenu === 'help' && (
          <ul className="menu" role="menu">
            <li>
              <button
                type="button"
                onClick={() => {
                  setAboutOpen(true)
                  closeMenu()
                }}
              >
                About
              </button>
            </li>
          </ul>
        )}
      </nav>
      <input ref={fileInputJson} type="file" accept="application/json" hidden onChange={handleOpenJson} />
      <input ref={fileInputIlbm} type="file" accept=".iff,.ilbm" hidden onChange={handleOpenIlbm} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  )
}

const ViewMenu = ({ onRequestClose }: { onRequestClose: () => void }) => {
  const view = useEditorStore((state) => state.view)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const setZoom = useEditorStore((state) => state.setZoom)
  const setCycleAnimationEnabled = useEditorStore((state) => state.setCycleAnimationEnabled)
  const zoomLevels = [1, 2, 4, 8, 16, 32] as const
  const zoomIndex = zoomLevels.indexOf(view.zoom as typeof zoomLevels[number])
  return (
    <ul className="menu" role="menu">
      <li>
        <button
          type="button"
          onClick={() => {
            toggleGrid()
            onRequestClose()
          }}
        >
          {view.showGrid ? 'Hide Grid' : 'Show Grid'}
        </button>
      </li>
      <li>
        <button
          type="button"
          disabled={zoomIndex >= zoomLevels.length - 1}
          onClick={() => {
            setZoom(zoomLevels[zoomIndex + 1] ?? view.zoom)
            onRequestClose()
          }}
        >
          Zoom In
        </button>
      </li>
      <li>
        <button
          type="button"
          disabled={zoomIndex <= 0}
          onClick={() => {
            setZoom(zoomLevels[zoomIndex - 1] ?? view.zoom)
            onRequestClose()
          }}
        >
          Zoom Out
        </button>
      </li>
      <li>
        <button
          type="button"
          onClick={() => {
            setCycleAnimationEnabled((current) => !current)
            onRequestClose()
          }}
        >
          {view.cycleAnimationEnabled ? 'Disable Cycling' : 'Enable Cycling'}
        </button>
      </li>
    </ul>
  )
}
