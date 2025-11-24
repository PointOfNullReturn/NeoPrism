import type { DocumentState } from '../../state/documentTypes'

/** Writes a single pixel to the document buffer if within bounds. */
export const setPixel = (document: DocumentState, x: number, y: number, value: number): void => {
  if (x < 0 || y < 0 || x >= document.width || y >= document.height) {
    return
  }
  const index = y * document.width + x
  if (document.mode === 'indexed8') {
    const pixels = document.pixels
    pixels[index] = value
  } else {
    const pixels = document.pixels
    pixels[index] = value
  }
}

/** Draws a line between two points using Bresenham's algorithm. */
export const drawLine = (
  document: DocumentState,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  value: number,
): void => {
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while (true) {
    setPixel(document, x0, y0, value)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}
