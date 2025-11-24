import type { EditorStoreState } from '../../state/store'

const PRIMARY_BUTTON = 0
const SECONDARY_BUTTON = 2

const normalizeButton = (evt: PointerEvent): number =>
  typeof evt.button === 'number' ? evt.button : PRIMARY_BUTTON

/**
 * Returns the currently active drawing value for the pointer event.
 * Primary buttons map to the foreground color; secondary buttons map to background.
 */
export const getPointerColor = (state: EditorStoreState, evt: PointerEvent): number =>
  normalizeButton(evt) === SECONDARY_BUTTON ? state.tool.backgroundIndex : state.tool.foregroundIndex

export const isSecondaryButton = (evt: PointerEvent): boolean =>
  normalizeButton(evt) === SECONDARY_BUTTON
