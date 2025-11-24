import type { DocumentState } from '../state/documentTypes'
import { useEditorStore } from '../state/store'

const documentToRgba = (doc: DocumentState): Uint8ClampedArray => {
  const totalPixels = doc.width * doc.height
  const buffer = new Uint8ClampedArray(totalPixels * 4)
  if (doc.mode === 'rgba32') {
    buffer.set(new Uint8Array(doc.pixels.buffer))
    return buffer
  }
  for (let i = 0; i < totalPixels; i += 1) {
    const paletteIndex = doc.pixels[i]
    const color = doc.palette[paletteIndex]
    const offset = i * 4
    buffer[offset] = color?.r ?? 0
    buffer[offset + 1] = color?.g ?? 0
    buffer[offset + 2] = color?.b ?? 0
    buffer[offset + 3] = color?.a ?? 255
  }
  return buffer
}

const createPngBlob = async (doc: DocumentState): Promise<Blob> => {
  const canvas = document.createElement('canvas')
  canvas.width = doc.width
  canvas.height = doc.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2d context unavailable')
  }
  const rgba = documentToRgba(doc)
  const imageData = new ImageData(rgba, doc.width, doc.height)
  ctx.putImageData(imageData, 0, 0)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to encode PNG'))
        return
      }
      resolve(blob)
    }, 'image/png')
  })
}

export const exportCurrentDocumentToPng = async (): Promise<Blob> => {
  const state = useEditorStore.getState()
  const blob = await createPngBlob(state.document)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'neoprism.png'
  anchor.click()
  URL.revokeObjectURL(url)
  return blob
}

export { documentToRgba }
