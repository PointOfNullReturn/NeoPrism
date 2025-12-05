export interface ParsedShortcut {
  symbols: string[]
  keys: string[]
}

const SHORTCUT_SYMBOLS: Record<string, string> = {
  Cmd: '⌘',
  Shift: '⇧',
  Alt: '⌥',
  Option: '⌥',
  Ctrl: '⌃',
  Enter: '↩',
  Return: '↩',
  Delete: '⌫',
  Backspace: '⌫',
  Tab: '⇥',
  Esc: '⎋',
  Escape: '⎋',
}

export function parseShortcut(shortcut: string): ParsedShortcut {
  // Handle special case where '+' is the key itself (e.g., "Cmd++")
  // Split on '+' but treat everything after the last '+' as the key
  const parts: string[] = []
  let current = ''

  for (let i = 0; i < shortcut.length; i++) {
    if (shortcut[i] === '+') {
      if (current.length > 0) {
        parts.push(current)
        current = ''
      } else if (i > 0 && shortcut[i - 1] === '+') {
        // This is the actual '+' key, not a separator
        parts.push('+')
      }
    } else {
      current += shortcut[i]
    }
  }

  // Add the last part
  if (current.length > 0) {
    parts.push(current)
  }

  return {
    symbols: parts.map((p) => SHORTCUT_SYMBOLS[p] || p),
    keys: parts,
  }
}

export function formatShortcut(shortcut: string): string {
  const parsed = parseShortcut(shortcut)
  return parsed.symbols.join('')
}
