import type { UserSettings, EventType } from '../types/database'
import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './EventTypesSettingsModal.css'

const ALL_EVENT_TYPES: EventType[] = ['lecture', 'deliverable', 'exam', 'presentation', 'meeting', 'holiday']

const EVENT_TYPE_LABELS: Record<EventType, { da: string; en: string }> = {
  lecture: { da: 'Forelæsninger', en: 'Lectures' },
  deliverable: { da: 'Afleveringer', en: 'Deliverables' },
  exam: { da: 'Eksamener', en: 'Exams' },
  presentation: { da: 'Præsentationer', en: 'Presentations' },
  meeting: { da: 'Møder', en: 'Meetings' },
  holiday: { da: 'Helligdage', en: 'Holidays' },
}

interface EventTypesSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  settings: UserSettings
  onUpdateSettings: (partial: Partial<Pick<UserSettings, 'hidden_event_types'>>) => void
  language?: Language
}

export function EventTypesSettingsModal({ isOpen, onClose, onBack, settings, onUpdateSettings, language = 'da' }: EventTypesSettingsModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  if (!isOpen) return null

  const isEn = language === 'en'
  const hidden = settings.hidden_event_types ?? []

  const toggleType = (type: EventType) => {
    const hiddenSet = new Set(hidden)
    if (hiddenSet.has(type)) {
      hiddenSet.delete(type)
    } else {
      hiddenSet.add(type)
    }
    onUpdateSettings({ hidden_event_types: [...hiddenSet] })
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content settings-modal event-types-settings-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <div className="modal-header">
          <button type="button" className="modal-back-btn" onClick={() => { onClose(); onBack() }} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="12 15 7 10 12 5" />
            </svg>
          </button>
          <h3>{isEn ? 'Event Types' : 'Begivenhedstyper'}</h3>
        </div>

        <div className="event-types-pills">
          {ALL_EVENT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              className={`event-type-pill ${!hidden.includes(type) ? 'selected' : ''}`}
              onClick={() => toggleType(type)}
            >
              {isEn ? EVENT_TYPE_LABELS[type].en : EVENT_TYPE_LABELS[type].da}
            </button>
          ))}
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
