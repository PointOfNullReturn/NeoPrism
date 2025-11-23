import type { CommandLike, HistoryState } from './documentTypes'

export const pushUndo = (history: HistoryState, command: CommandLike): HistoryState => {
  const undoStack = [...history.undoStack, command]
  const overflow = undoStack.length - history.limit
  const trimmed = overflow > 0 ? undoStack.slice(overflow) : undoStack
  return { ...history, undoStack: trimmed }
}

export const pushRedo = (history: HistoryState, command: CommandLike): HistoryState => ({
  ...history,
  redoStack: [...history.redoStack, command],
})

export const popUndo = (
  history: HistoryState,
): { command?: CommandLike; history: HistoryState } => {
  const undoStack = history.undoStack
  if (!undoStack.length) {
    return { history }
  }
  const command = undoStack[undoStack.length - 1]
  return {
    command,
    history: { ...history, undoStack: undoStack.slice(0, -1) },
  }
}

export const popRedo = (
  history: HistoryState,
): { command?: CommandLike; history: HistoryState } => {
  const redoStack = history.redoStack
  if (!redoStack.length) {
    return { history }
  }
  const command = redoStack[redoStack.length - 1]
  return {
    command,
    history: { ...history, redoStack: redoStack.slice(0, -1) },
  }
}

export const clearRedoStack = (history: HistoryState): HistoryState => ({
  ...history,
  redoStack: [],
})

export const canUndo = (history: HistoryState): boolean => history.undoStack.length > 0
export const canRedo = (history: HistoryState): boolean => history.redoStack.length > 0
