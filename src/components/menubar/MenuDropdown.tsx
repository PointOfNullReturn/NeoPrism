import { MenuItem } from './MenuItem'
import type { MenuItemDef } from './types/menuTypes'

interface MenuDropdownProps {
  menuLabel: string
  items: MenuItemDef[]
  onItemClick: (action?: () => void) => void
}

export const MenuDropdown = ({ menuLabel, items, onItemClick }: MenuDropdownProps) => {
  return (
    <ul className="menu-dropdown" role="menu" aria-label={menuLabel}>
      {items.map((item, index) => (
        <MenuItem key={index} item={item} onClick={() => onItemClick(item.action)} />
      ))}
    </ul>
  )
}
