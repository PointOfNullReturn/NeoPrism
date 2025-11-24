import { PROJECT_VERSION, decodeBase64, type ProjectSnapshot } from './projectSchema'
import type { DocumentState, PaletteState, ViewState } from '../state/documentTypes'
import { createDefaultPaletteState, createDefaultView, useEditorStore } from '../state/store'
import { executeCommand } from '../state/commands/Command'
import { LoadProjectCommand } from '../state/commands/LoadProjectCommand'

const clampIndex = (value: number, max: number): number => Math.max(0, Math.min(value, max))

const validateSnapshot = (snapshot: ProjectSnapshot): void => {
  if (snapshot.version !== PROJECT_VERSION) {
    throw new Error(`Unsupported project version ${snapshot.version}`)
  }
  if (snapshot.document.width <= 0 || snapshot.document.height <= 0) {
    throw new Error('Document dimensions must be positive')
  }
}

const createDocument = (snapshot: ProjectSnapshot['document']): DocumentState => {
  const pixels = decodeBase64(snapshot.pixels)
  if (snapshot.mode === 'indexed8') {
    if (!snapshot.palette) {
      throw new Error('Indexed project requires palette data')
    }
    const expected = snapshot.width * snapshot.height
    if (pixels.length !== expected) {
      throw new Error('Pixel data length mismatch for indexed project')
    }
    return {
      mode: 'indexed8',
      width: snapshot.width,
      height: snapshot.height,
      pixels: new Uint8Array(pixels),
      palette: snapshot.palette.map((color) => ({ ...color })),
      cycles: snapshot.cycles?.map((cycle) => ({ ...cycle })) ?? [],
    }
  }
  const rgbaView = new Uint32Array(snapshot.width * snapshot.height)
  const rgbaBytes = new Uint8Array(rgbaView.buffer)
  if (pixels.length !== rgbaBytes.length) {
    throw new Error('Pixel data length mismatch for RGBA project')
  }
  rgbaBytes.set(pixels)
  return {
    mode: 'rgba32',
    width: snapshot.width,
    height: snapshot.height,
    pixels: rgbaView,
  }
}

const createPaletteState = (snapshot: ProjectSnapshot, document: DocumentState): PaletteState => {
  const base = createDefaultPaletteState()
  const colors = snapshot.palette.colors ?? (document.mode === 'indexed8' ? document.palette : base.colors)
  const palette: PaletteState = {
    colors: colors.map((color) => ({ ...color })),
    foregroundIndex: clampIndex(snapshot.palette.foregroundIndex, colors.length - 1),
    backgroundIndex: clampIndex(snapshot.palette.backgroundIndex, colors.length - 1),
    cycles: snapshot.palette.cycles?.map((cycle) => ({ ...cycle })) ?? document.mode === 'indexed8'
      ? document.cycles
      : base.cycles,
  }
  return palette
}

export const buildStateFromSnapshot = (snapshot: ProjectSnapshot): {
  document: DocumentState
  view: ViewState
  palette: PaletteState
} => {
  validateSnapshot(snapshot)
  const document = createDocument(snapshot.document)
  const view = { ...createDefaultView(), ...snapshot.view }
  const palette = createPaletteState(snapshot, document)
  return { document, view, palette }
}

export const parseProjectSnapshot = (data: string | ProjectSnapshot): ProjectSnapshot =>
  typeof data === 'string' ? (JSON.parse(data) as ProjectSnapshot) : data

export const loadProject = (data: string | ProjectSnapshot): ProjectSnapshot => {
  const snapshot = parseProjectSnapshot(data)
  const nextState = buildStateFromSnapshot(snapshot)
  const command = new LoadProjectCommand(useEditorStore.getState(), nextState)
  executeCommand(command)
  return snapshot
}
