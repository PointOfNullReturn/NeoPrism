import type { DocumentState } from '../../state/documentTypes'

/** Performs scanline flood fill in place. */
export const floodFill = (
  document: DocumentState,
  startX: number,
  startY: number,
  replacement: number,
): void => {
  if (document.mode !== 'indexed8') {
    // RGBA flood fill TBD; keep simple placeholder that behaves like RGBA white fill
    fillRgba(document, startX, startY)
    return
  }

  const pixels = document.pixels
  const width = document.width
  const height = document.height
  const target = pixels[startY * width + startX]
  if (target === replacement) {
    return
  }

  const stack: Array<{ x: number; y: number }> = [{ x: startX, y: startY }]
  while (stack.length) {
    const next = stack.pop()
    if (!next) {
      continue
    }
    const { x, y } = next
    let west = x
    let east = x
    while (west >= 0 && pixels[y * width + west] === target) {
      west -= 1
    }
    while (east < width && pixels[y * width + east] === target) {
      east += 1
    }
    for (let i = west + 1; i < east; i += 1) {
      pixels[y * width + i] = replacement
      if (y > 0 && pixels[(y - 1) * width + i] === target) {
        stack.push({ x: i, y: y - 1 })
      }
      if (y < height - 1 && pixels[(y + 1) * width + i] === target) {
        stack.push({ x: i, y: y + 1 })
      }
    }
  }
}

const fillRgba = (document: DocumentState, x: number, y: number) => {
  const pixels = document.pixels as Uint32Array
  const width = document.width
  const height = document.height
  const index = y * width + x
  const target = pixels[index]
  const replacement = 0x00000000
  if (target === replacement) {
    return
  }
  const stack: Array<{ x: number; y: number }> = [{ x, y }]
  while (stack.length) {
    const point = stack.pop()
    if (!point) {
      continue
    }
    if (point.x < 0 || point.x >= width || point.y < 0 || point.y >= height) {
      continue
    }
    const idx = point.y * width + point.x
    if (pixels[idx] !== target) {
      continue
    }
    pixels[idx] = replacement
    stack.push({ x: point.x + 1, y: point.y })
    stack.push({ x: point.x - 1, y: point.y })
    stack.push({ x: point.x, y: point.y + 1 })
    stack.push({ x: point.x, y: point.y - 1 })
  }
}
