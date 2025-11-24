import { usePalette } from '../../state/store'

import '../../styles/status/StatusBar.css'

const toHex = (value: number): string => value.toString(16).padStart(2, '0')

const colorToHex = (color: { r: number; g: number; b: number }): string =>
  `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase()

export const StatusBar = () => {
  const palette = usePalette()
  const fgColor = palette.colors[palette.foregroundIndex] ?? palette.colors[0]
  const bgColor = palette.colors[palette.backgroundIndex] ?? palette.colors[0]

  return (
    <footer className="status-bar" aria-label="Status bar">
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">FG</span>
        <strong>{`#${palette.foregroundIndex.toString().padStart(3, '0')}`}</strong>
        <span>{colorToHex(fgColor)}</span>
      </div>
      <div className="status-bar__item" aria-live="polite">
        <span className="status-label">BG</span>
        <strong>{`#${palette.backgroundIndex.toString().padStart(3, '0')}`}</strong>
        <span>{colorToHex(bgColor)}</span>
      </div>
    </footer>
  )
}
