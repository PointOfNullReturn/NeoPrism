import { useEffect, useRef, useState, useMemo, useCallback } from 'react'

import { AboutModal } from './AboutModal'
import { MenuLabel } from './MenuLabel'
import { MenuDropdown } from './MenuDropdown'
import { useEditorStore } from '../../state/store'
import { resetEditorStore } from '../../state/store'
import { serializeProject } from '../../persistence/saveProject'
import { loadProject } from '../../persistence/loadProject'
import { exportCurrentDocumentToPng } from '../../persistence/exportPng'
import { importIlbmFromFile } from '../../iff/importIlbm'
import type { MenuBarDef } from './types/menuTypes'

import '../../styles/layout/Menubar.css'

const ZOOM_LEVELS = [1, 2, 4, 8, 16, 32] as const

export const Menubar = () => {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMenuActive, setIsMenuActive] = useState(false)
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const fileInputJson = useRef<HTMLInputElement | null>(null)
  const fileInputIlbm = useRef<HTMLInputElement | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

  // Get view state for dynamic menu items
  const view = useEditorStore((state) => state.view)
  const toggleGrid = useEditorStore((state) => state.toggleGrid)
  const setZoom = useEditorStore((state) => state.setZoom)
  const setCycleAnimationEnabled = useEditorStore((state) => state.setCycleAnimationEnabled)
  const zoomIndex = ZOOM_LEVELS.indexOf(view.zoom)

  const closeMenu = () => {
    setOpenMenu(null)
    setIsMenuActive(false)
    setHoveredLabel(null)
  }

  const handleLabelClick = (menuName: string) => {
    if (openMenu === menuName) {
      closeMenu()
    } else {
      setOpenMenu(menuName)
      setIsMenuActive(true)
    }
  }

  const handleLabelMouseEnter = (menuName: string) => {
    setHoveredLabel(menuName)
    if (isMenuActive) {
      setOpenMenu(menuName)
    }
  }

  const handleLabelMouseLeave = () => {
    setHoveredLabel(null)
  }

  const handleItemClick = (action?: () => void) => {
    if (action) {
      action()
    }
    closeMenu()
  }

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current) return
      if (!navRef.current.contains(event.target as Node)) {
        closeMenu()
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleNew = useCallback(() => {
    resetEditorStore()
  }, [])

  const handleSave = useCallback(() => {
    const snapshot = serializeProject(useEditorStore.getState())
    const blob = new Blob([snapshot], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neoprism-project.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const handleOpenJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    const content = await file.text()
    loadProject(content)
    event.target.value = ''
  }

  const handleOpenIlbm = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    await importIlbmFromFile(file)
    event.target.value = ''
  }

  const handleNavPointerDown: React.PointerEventHandler<HTMLElement> = (event) => {
    if (event.target === navRef.current) {
      closeMenu()
    }
  }

  const handleOpenJsonClick = useCallback(() => {
    fileInputJson.current?.click()
  }, [])

  const handleOpenIlbmClick = useCallback(() => {
    fileInputIlbm.current?.click()
  }, [])

  const handleExportPng = useCallback(() => {
    void exportCurrentDocumentToPng()
  }, [])

  // Menu definitions
  const menuBarDefinition: MenuBarDef = useMemo(
    () => [
      {
        label: 'File',
        items: [
          { type: 'item', label: 'New', action: handleNew, shortcut: 'Cmd+N' },
          { type: 'divider' },
          {
            type: 'item',
            label: 'Open JSON...',
            action: handleOpenJsonClick,
          },
          {
            type: 'item',
            label: 'Open ILBM...',
            action: handleOpenIlbmClick,
          },
          { type: 'divider' },
          { type: 'item', label: 'Save JSON', action: handleSave, shortcut: 'Cmd+S' },
          {
            type: 'item',
            label: 'Export PNG...',
            action: handleExportPng,
          },
        ],
      },
      {
        label: 'View',
        items: [
          {
            type: 'item',
            label: view.showGrid ? 'Hide Grid' : 'Show Grid',
            action: toggleGrid,
            checked: view.showGrid,
          },
          { type: 'divider' },
          {
            type: 'item',
            label: 'Zoom In',
            action: () => {
              setZoom(ZOOM_LEVELS[zoomIndex + 1] ?? view.zoom)
            },
            shortcut: 'Cmd++',
            disabled: zoomIndex >= ZOOM_LEVELS.length - 1,
          },
          {
            type: 'item',
            label: 'Zoom Out',
            action: () => {
              setZoom(ZOOM_LEVELS[zoomIndex - 1] ?? view.zoom)
            },
            shortcut: 'Cmd+-',
            disabled: zoomIndex <= 0,
          },
          { type: 'divider' },
          {
            type: 'item',
            label: view.cycleAnimationEnabled ? 'Disable Cycling' : 'Enable Cycling',
            action: () => {
              setCycleAnimationEnabled((current) => !current)
            },
          },
        ],
      },
      {
        label: 'Help',
        items: [
          {
            type: 'item',
            label: 'About NeoPrism',
            action: () => {
              setAboutOpen(true)
            },
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, zoomIndex, toggleGrid, setZoom, setCycleAnimationEnabled],
  )

  return (
    <>
      <nav className="menubar" ref={navRef} onPointerDown={handleNavPointerDown}>
        {menuBarDefinition.map((menu) => {
          const isOpen = openMenu === menu.label.toLowerCase()
          const isHovered = hoveredLabel === menu.label.toLowerCase()

          return (
            <div key={menu.label} className="menu-container">
              <MenuLabel
                label={menu.label}
                isOpen={isOpen}
                isHovered={isHovered}
                onClick={() => {
                  handleLabelClick(menu.label.toLowerCase())
                }}
                onMouseEnter={() => {
                  handleLabelMouseEnter(menu.label.toLowerCase())
                }}
                onMouseLeave={handleLabelMouseLeave}
              />
              {isOpen && (
                <MenuDropdown
                  menuLabel={menu.label}
                  items={menu.items}
                  onItemClick={handleItemClick}
                />
              )}
            </div>
          )
        })}
      </nav>
      <input
        ref={fileInputJson}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => {
          void handleOpenJson(e)
        }}
      />
      <input
        ref={fileInputIlbm}
        type="file"
        accept=".iff,.ilbm"
        hidden
        onChange={(e) => {
          void handleOpenIlbm(e)
        }}
      />
      <AboutModal
        open={aboutOpen}
        onClose={() => {
          setAboutOpen(false)
        }}
      />
    </>
  )
}
