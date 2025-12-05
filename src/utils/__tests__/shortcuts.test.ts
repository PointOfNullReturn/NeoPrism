import { describe, it, expect } from 'vitest'
import { formatShortcut, parseShortcut } from '../shortcuts'

describe('shortcuts', () => {
  describe('parseShortcut', () => {
    it('parses single key', () => {
      const result = parseShortcut('Cmd')
      expect(result.symbols).toEqual(['⌘'])
      expect(result.keys).toEqual(['Cmd'])
    })

    it('parses key combination', () => {
      const result = parseShortcut('Cmd+S')
      expect(result.symbols).toEqual(['⌘', 'S'])
      expect(result.keys).toEqual(['Cmd', 'S'])
    })

    it('parses multiple modifiers', () => {
      const result = parseShortcut('Cmd+Shift+N')
      expect(result.symbols).toEqual(['⌘', '⇧', 'N'])
      expect(result.keys).toEqual(['Cmd', 'Shift', 'N'])
    })

    it('preserves unknown keys', () => {
      const result = parseShortcut('Cmd+Unknown')
      expect(result.symbols).toEqual(['⌘', 'Unknown'])
      expect(result.keys).toEqual(['Cmd', 'Unknown'])
    })

    it('handles Alt/Option', () => {
      const result = parseShortcut('Alt+F4')
      expect(result.symbols).toEqual(['⌥', 'F4'])
    })

    it('handles Ctrl', () => {
      const result = parseShortcut('Ctrl+C')
      expect(result.symbols).toEqual(['⌃', 'C'])
    })

    it('handles special keys', () => {
      const result = parseShortcut('Cmd+Enter')
      expect(result.symbols).toEqual(['⌘', '↩'])
    })
  })

  describe('formatShortcut', () => {
    it('formats Cmd+S', () => {
      expect(formatShortcut('Cmd+S')).toBe('⌘S')
    })

    it('formats Cmd+N', () => {
      expect(formatShortcut('Cmd+N')).toBe('⌘N')
    })

    it('formats Cmd+Shift+Z', () => {
      expect(formatShortcut('Cmd+Shift+Z')).toBe('⌘⇧Z')
    })

    it('formats zoom shortcuts', () => {
      expect(formatShortcut('Cmd++')).toBe('⌘+')
      expect(formatShortcut('Cmd+-')).toBe('⌘-')
    })

    it('formats with Alt', () => {
      expect(formatShortcut('Alt+F4')).toBe('⌥F4')
    })

    it('formats with Ctrl', () => {
      expect(formatShortcut('Ctrl+C')).toBe('⌃C')
    })

    it('handles special keys', () => {
      expect(formatShortcut('Cmd+Enter')).toBe('⌘↩')
      expect(formatShortcut('Cmd+Delete')).toBe('⌘⌫')
      expect(formatShortcut('Cmd+Esc')).toBe('⌘⎋')
    })
  })
})
