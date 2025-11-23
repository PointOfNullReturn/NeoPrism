import type { ViewState, ZoomLevel } from '../state/documentTypes'

interface ScreenPoint {
  x: number
  y: number
}

interface DocumentPoint {
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Converts screen coordinates (relative to canvas) into document coordinates. */
export const screenToDocument = (
  point: ScreenPoint,
  view: ViewState,
  zoom: ZoomLevel,
  documentWidth: number,
  documentHeight: number,
): DocumentPoint => {
  const x = (point.x + view.offsetX * zoom) / zoom
  const y = (point.y + view.offsetY * zoom) / zoom
  return {
    x: clamp(Math.floor(x), 0, documentWidth - 1),
    y: clamp(Math.floor(y), 0, documentHeight - 1),
  }
}

/** Converts document coordinates to screen space for tool overlays. */
export const documentToScreen = (
  point: DocumentPoint,
  view: ViewState,
  zoom: ZoomLevel,
): ScreenPoint => ({
  x: (point.x - view.offsetX) * zoom,
  y: (point.y - view.offsetY) * zoom,
})
