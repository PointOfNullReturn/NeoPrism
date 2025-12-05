import { formatShortcut } from '../../utils/shortcuts'
import type { MenuItemDef } from './types/menuTypes'

interface MenuItemProps {
  item: MenuItemDef
  onClick: () => void
}

export const MenuItem = ({ item, onClick }: MenuItemProps) => {
  if (item.type === 'divider') {
    return <li className="menu-divider" role="separator" />
  }

  const classNames = ['menu-item', item.checked && 'is-checked'].filter(Boolean).join(' ')

  return (
    <li>
      <button
        type="button"
        className={classNames}
        onClick={onClick}
        disabled={item.disabled}
        role="menuitem"
        aria-disabled={item.disabled}
      >
        <span className="menu-item-label">{item.label}</span>
        {item.shortcut && <span className="menu-item-shortcut">{formatShortcut(item.shortcut)}</span>}
      </button>
    </li>
  )
}
