import type { Tool } from '../Tool'
import type { EditorStoreState } from '../../state/store'
import { isSecondaryButton } from './colorSelection'

const samplePixelValue = (state: EditorStoreState['document'], x: number, y: number): number | null => {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height) {
    return null
  }
  const index = y * state.width + x
  if (state.mode === 'indexed8') {
    return state.pixels[index]
  }
  return state.pixels[index]
}

export class PickerTool implements Tool {
  id = 'picker'

  onPointerDown(state: EditorStoreState, x: number, y: number, evt: PointerEvent): void {
    const sampled = samplePixelValue(state.document, x, y)
    if (sampled === null) {
      return
    }
    if (isSecondaryButton(evt)) {
      state.setBackgroundIndex(sampled)
    } else {
      state.setForegroundIndex(sampled)
    }
  }

  onPointerMove(_state: EditorStoreState, _x: number, _y: number, _evt: PointerEvent): void {}

  onPointerUp(_state: EditorStoreState, _x: number, _y: number, _evt: PointerEvent): void {}
}
