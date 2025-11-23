import type { Command } from './Command'
import { cloneDocumentState } from './utils'
import { nextCommandId } from './Command'
import type { DocumentState } from '../documentTypes'
import type { EditorStoreState } from '../store'

export class ClearDocumentCommand implements Command {
  readonly id: string
  readonly createdAt: number
  readonly label = 'Clear document'
  private previous: DocumentState

  constructor(currentDocument: DocumentState) {
    this.id = nextCommandId('clear')
    this.createdAt = Date.now()
    this.previous = cloneDocumentState(currentDocument)
  }

  do(store: EditorStoreState): void {
    store.document.pixels.fill(0)
  }

  undo(store: EditorStoreState): void {
    store.setDocument(this.previous)
  }
}
