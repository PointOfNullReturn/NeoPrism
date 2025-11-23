import { useEditorStore, type EditorStoreState } from '../store'
import { clearRedoStack, popRedo, popUndo } from '../undoRedo'

export interface Command {
  readonly id: string
  readonly label?: string
  readonly createdAt: number
  do: (store: EditorStoreState) => void
  undo: (store: EditorStoreState) => void
}

let commandCounter = 0
export const nextCommandId = (prefix = 'cmd'): string => {
  const timestamp = Date.now().toString()
  const counter = (commandCounter++).toString()
  return `${prefix}-${timestamp}-${counter}`
}

export const executeCommand = (command: Command): void => {
  const store = useEditorStore.getState()
  command.do(store)
  store.setHistory(clearRedoStack(store.history))
  store.pushUndo(command)
}

export const undoLastCommand = (): Command | undefined => {
  const store = useEditorStore.getState()
  const { command, history } = popUndo(store.history)
  if (!command) {
    return undefined
  }
  command.undo(store)
  store.setHistory(history)
  store.pushRedo(command)
  return command
}

export const redoLastCommand = (): Command | undefined => {
  const store = useEditorStore.getState()
  const { command, history } = popRedo(store.history)
  if (!command) {
    return undefined
  }
  command.do(store)
  store.setHistory(history)
  store.pushUndo(command)
  return command
}
