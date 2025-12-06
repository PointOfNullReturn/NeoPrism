interface MenuLabelProps {
  label: string
  isOpen: boolean
  isHovered: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export const MenuLabel = ({
  label,
  isOpen,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MenuLabelProps) => {
  const classNames = ['menu-label', isOpen && 'is-active', isHovered && !isOpen && 'is-hovered']
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-haspopup="menu"
      aria-expanded={isOpen}
    >
      {label}
    </button>
  )
}
