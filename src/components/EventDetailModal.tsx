import type { Course, CalendarEvent } from '../types/database'
import type { Language } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './EventDetailModal.css'

const EVENT_TYPE_LABELS: Record<string, string> = {
  lecture: 'Lecture',
  deliverable: 'Deliverable',
  exam: 'Exam',
  presentation: 'Presentation',
  holiday: 'Holiday'
}

interface EventDetailModalProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEvent | null
  courses: Course[]
  isSubscribed: boolean
  onEdit: () => void
  language?: Language
}

export function EventDetailModal({ isOpen, onClose, event, courses, isSubscribed, onEdit, language = 'da' }: EventDetailModalProps) {
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  if (!isOpen || !event) return null

  const course = event.course_id ? courses.find(c => c.id === event.course_id) : null
  const isEn = language === 'en'

  // Format date nicely
  const date = new Date(event.date + 'T00:00:00')
  const dateStr = date.toLocaleDateString(isEn ? 'en-GB' : 'da-DK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content event-detail-modal" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <div className="event-detail-header">
          <h3>{event.title}</h3>
          <span className={`event-detail-type ${event.type}`}>{EVENT_TYPE_LABELS[event.type] || event.type}</span>
        </div>

        <div className="event-detail-date">{dateStr}</div>

        {course && (
          <div className="event-detail-course">
            <span className="event-detail-color" style={{ backgroundColor: course.color }} />
            <span>{course.name}</span>
            {isSubscribed && <span className="live-badge">Live</span>}
          </div>
        )}

        {event.notes && (
          <div className="event-detail-notes">{event.notes}</div>
        )}

        <div className="modal-actions">
          <div className="right-actions">
            <button type="button" onClick={onClose}>{isEn ? 'Close' : 'Luk'}</button>
            {!isSubscribed && (
              <button type="button" className="save-btn" onClick={onEdit}>{isEn ? 'Edit' : 'Rediger'}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
