import { useEffect } from 'react'

interface AboutModalProps {
  open: boolean
  onClose: () => void
}

export const AboutModal = ({ open, onClose }: AboutModalProps) => {
  useEffect(() => {
    if (!open) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="About NeoPrism">
      <div className="modal-content">
        <h2>About NeoPrism</h2>
        <p>Version {import.meta.env.VITE_APP_VERSION ?? '0.0.0'}</p>
        <p>React 19 + Vite 5 prototype.</p>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
