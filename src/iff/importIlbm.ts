import { parseILBM } from './parseILBM'
import { ImportIFFCommand } from '../state/commands/ImportIFFCommand'
import { executeCommand } from '../state/commands/Command'
import { useEditorStore } from '../state/store'

export const importIlbmFromFile = async (file: File): Promise<void> => {
  try {
    const buffer = await file.arrayBuffer()
    const ilbm = parseILBM(buffer)
    const current = useEditorStore.getState()
    const hasActiveCycles = (ilbm.cycles ?? []).some((cycle) => cycle.active)
    const nextView = {
      ...current.view,
      zoom: current.view.zoom,
      offsetX: 0,
      offsetY: 0,
      cycleAnimationEnabled: hasActiveCycles ? true : current.view.cycleAnimationEnabled,
    }
    const nextPalette = {
      colors: ilbm.palette.map((color) => ({ ...color })),
      foregroundIndex: 1,
      backgroundIndex: 0,
      cycles: ilbm.cycles ?? [],
    }
    const nextDocument = {
      mode: 'indexed8' as const,
      width: ilbm.width,
      height: ilbm.height,
      pixels: ilbm.pixels,
      palette: ilbm.palette.map((color) => ({ ...color })),
      cycles: ilbm.cycles ?? [],
    }
    const command = new ImportIFFCommand(current, {
      document: nextDocument,
      view: nextView,
      palette: nextPalette,
    })
    executeCommand(command)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to import ILBM: ${message}`)
  }
}
