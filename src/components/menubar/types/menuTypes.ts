export interface MenuItemDef {
  type: 'item' | 'divider'
  label?: string
  action?: () => void
  shortcut?: string
  disabled?: boolean
  checked?: boolean
}

export interface MenuDef {
  label: string
  items: MenuItemDef[]
}

export type MenuBarDef = MenuDef[]
