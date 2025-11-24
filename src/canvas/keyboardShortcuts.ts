import { useEditorStore } from '../state/store'

const TOOL_KEY_MAP: Record<string, string> = {
  b: 'pencil',
  e: 'eraser',
  l: 'line',
  r: 'rectangle',
  f: 'fill',
  i: 'picker',
}

export const registerToolShortcuts = (): (() => void) => {
  const handler = (evt: KeyboardEvent) => {
    const id = TOOL_KEY_MAP[evt.key.toLowerCase()]
    if (!id) {
      return
    }
    evt.preventDefault()
    useEditorStore.getState().setTool(id)
  }
  window.addEventListener('keydown', handler)
  return () => {
    window.removeEventListener('keydown', handler)
  }
}

export const registerCycleToggleShortcut = (): (() => void) => {
  const handler = (evt: KeyboardEvent) => {
    const isToggleCombo =
      (evt.metaKey || evt.ctrlKey) && evt.shiftKey && evt.key.toLowerCase() === 'c'
    if (!isToggleCombo) {
      return
    }
    evt.preventDefault()
    useEditorStore.getState().setCycleAnimationEnabled((current) => !current)
  }
  window.addEventListener('keydown', handler)
  return () => {
    window.removeEventListener('keydown', handler)
  }
}
