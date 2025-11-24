import type { EditorStoreState } from '../../state/store'

const PRIMARY_BUTTON = 0
const SECONDARY_BUTTON = 2

const normalizeButton = (evt: PointerEvent): number => {
  if (evt.button != null && evt.button !== -1) {
    return evt.button
  }
  if (typeof evt.buttons === 'number') {
    if ((evt.buttons & 2) === 2) return SECONDARY_BUTTON
  }
  return PRIMARY_BUTTON
}

/**
 * Returns the currently active drawing value for the pointer event.
 * Primary buttons map to the foreground color; secondary buttons map to background.
 */
export const getPointerColor = (state: EditorStoreState, evt: PointerEvent): number =>
  normalizeButton(evt) === SECONDARY_BUTTON
    ? state.palette.backgroundIndex
    : state.palette.foregroundIndex

export const isSecondaryButton = (evt: PointerEvent): boolean =>
  normalizeButton(evt) === SECONDARY_BUTTON
