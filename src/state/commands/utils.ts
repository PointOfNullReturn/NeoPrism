import type { DocumentState, IndexedDocument, PaletteColor } from '../documentTypes'
import { createDefaultIndexedDocument } from '../store'

export function cloneDocumentState(document: DocumentState): DocumentState {
  if (document.mode === 'indexed8') {
    const clone: IndexedDocument = {
      mode: 'indexed8',
      width: document.width,
      height: document.height,
      pixels: new Uint8Array(document.pixels),
      palette: document.palette.map(clonePaletteColor),
      cycles: document.cycles ? [...document.cycles] : undefined,
    }
    return clone
  }
  return {
    mode: 'rgba32',
    width: document.width,
    height: document.height,
    pixels: new Uint32Array(document.pixels),
  }
}

const clonePaletteColor = (color: PaletteColor): PaletteColor => ({ ...color })

export function clearDocumentPixels(document: IndexedDocument): void {
  document.pixels.fill(0)
}

type DocumentFactory = typeof createDefaultIndexedDocument

export const DEFAULT_DOCUMENT_FACTORY: DocumentFactory = createDefaultIndexedDocument
