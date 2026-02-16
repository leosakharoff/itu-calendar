import type { UserSettings } from '../types/database'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './SettingsModal.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  onOpenCalendarSettings: () => void
  onOpenNotifications: () => void
}

export function SettingsModal({ isOpen, onClose, settings, onOpenCalendarSettings, onOpenNotifications }: SettingsModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  if (!isOpen) return null

  const isEn = settings.language === 'en'

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content settings-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{isEn ? 'Settings' : 'Indstillinger'}</h3>

        <div className="settings-modal-row settings-modal-link" onClick={() => { onClose(); onOpenCalendarSettings() }}>
          <span className="settings-modal-label">{isEn ? 'Calendar' : 'Kalender'}</span>
          <span className="settings-modal-chevron">&rsaquo;</span>
        </div>

        <div className="settings-modal-row settings-modal-link" onClick={() => { onClose(); onOpenNotifications() }}>
          <span className="settings-modal-label">{isEn ? 'Notifications' : 'Notifikationer'}</span>
          <span className="settings-modal-chevron">&rsaquo;</span>
        </div>

        <div className="modal-actions">
          <div className="right-actions">
            <button type="button" onClick={onClose}>{isEn ? 'Done' : 'Luk'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
