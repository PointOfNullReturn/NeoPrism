import { MAX_DOCUMENT_DIMENSION, MIN_DOCUMENT_DIMENSION } from '../state/documentTypes'

export type IndexedBuffer = {
  kind: 'indexed8'
  width: number
  height: number
  data: Uint8Array
}

export type RGBABuffer = {
  kind: 'rgba32'
  width: number
  height: number
  data: Uint32Array
}

export type PixelBuffer = IndexedBuffer | RGBABuffer

const validateDimensions = (width: number, height: number): void => {
  if (width < MIN_DOCUMENT_DIMENSION || height < MIN_DOCUMENT_DIMENSION) {
    throw new Error(`Dimensions must be >= ${String(MIN_DOCUMENT_DIMENSION)}`)
  }
  if (width > MAX_DOCUMENT_DIMENSION || height > MAX_DOCUMENT_DIMENSION) {
    throw new Error(`Dimensions must be <= ${String(MAX_DOCUMENT_DIMENSION)}`)
  }
}

const totalPixels = (width: number, height: number): number => width * height

export const createIndexedBuffer = (width: number, height: number): IndexedBuffer => {
  validateDimensions(width, height)
  return {
    kind: 'indexed8',
    width,
    height,
    data: new Uint8Array(totalPixels(width, height)),
  }
}

export const createRGBABuffer = (width: number, height: number): RGBABuffer => {
  validateDimensions(width, height)
  return {
    kind: 'rgba32',
    width,
    height,
    data: new Uint32Array(totalPixels(width, height)),
  }
}

export const resizeBuffer = <T extends PixelBuffer>(
  buffer: T,
  width: number,
  height: number,
): T => {
  validateDimensions(width, height)
  const newPixels = totalPixels(width, height)
  const newData =
    buffer.kind === 'indexed8' ? new Uint8Array(newPixels) : new Uint32Array(newPixels)
  const minWidth = Math.min(buffer.width, width)
  const minHeight = Math.min(buffer.height, height)

  for (let y = 0; y < minHeight; y += 1) {
    const srcOffset = y * buffer.width
    const dstOffset = y * width
    newData.set(buffer.data.subarray(srcOffset, srcOffset + minWidth), dstOffset)
  }

  return {
    ...buffer,
    width,
    height,
    data: newData as typeof buffer.data,
  }
}

export const isIndexedBuffer = (buffer: PixelBuffer): buffer is IndexedBuffer =>
  buffer.kind === 'indexed8'
export const isRGBABuffer = (buffer: PixelBuffer): buffer is RGBABuffer => buffer.kind === 'rgba32'
