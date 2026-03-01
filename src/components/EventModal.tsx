import { useState, useEffect } from 'react'
import type { Course, CalendarEvent, EventType } from '../types/database'
import type { Language } from '../lib/dates'
import { formatDateForDB } from '../lib/dates'
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss'
import './EventModal.css'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<CalendarEvent, 'id' | 'created_at'>) => void
  onDelete?: () => void
  courses: Course[]
  initialDate?: Date
  editingEvent?: CalendarEvent | null
  hiddenEventTypes?: EventType[]
  language?: Language
}

const EVENT_TYPES: { value: EventType; label: { da: string; en: string } }[] = [
  { value: 'lecture', label: { da: 'Forel\u00e6sning', en: 'Lecture' } },
  { value: 'deliverable', label: { da: 'Aflevering', en: 'Deliverable' } },
  { value: 'exam', label: { da: 'Eksamen', en: 'Exam' } },
  { value: 'presentation', label: { da: 'Pr\u00e6sentation', en: 'Presentation' } },
  { value: 'meeting', label: { da: 'M\u00f8de', en: 'Meeting' } },
  { value: 'holiday', label: { da: 'Helligdag', en: 'Holiday' } }
]

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  courses,
  initialDate,
  editingEvent,
  hiddenEventTypes,
  language = 'da'
}: EventModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<EventType>('lecture')
  const [courseId, setCourseId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const isEn = language === 'en'
  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setDate(editingEvent.date)
      setType(editingEvent.type)
      setCourseId(editingEvent.course_id || '')
      setNotes(editingEvent.notes || '')
      setLocation(editingEvent.location || '')
      setStartTime(editingEvent.start_time || '')
      setEndTime(editingEvent.end_time || '')
    } else if (initialDate) {
      const hidden = hiddenEventTypes ?? []
      const firstVisible = EVENT_TYPES.find(t => !hidden.includes(t.value))
      setTitle('')
      setDate(formatDateForDB(initialDate))
      setType(firstVisible?.value ?? 'lecture')
      setCourseId(courses[0]?.id || '')
      setNotes('')
      setLocation('')
      setStartTime('')
      setEndTime('')
    }
  }, [editingEvent, initialDate, courses, hiddenEventTypes])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    onSave({
      title: title.trim(),
      date,
      type,
      course_id: type === 'holiday' ? null : (courseId || null),
      notes: notes.trim() || null,
      location: location.trim() || null,
      start_time: startTime || null,
      end_time: endTime || null
    })
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && confirm(isEn ? 'Delete this event?' : 'Slet denne begivenhed?')) {
      onDelete()
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{editingEvent ? (isEn ? 'Edit Event' : 'Rediger begivenhed') : (isEn ? 'Add Event' : 'Tilf\u00f8j begivenhed')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isEn ? 'Title' : 'Titel'}</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isEn ? 'e.g., Lecture 1' : 'f.eks., Forel\u00e6sning 1'}
              autoFocus={!editingEvent}
            />
          </div>

          <div className="form-group">
            <label>{isEn ? 'Date' : 'Dato'}</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>{isEn ? 'Start time' : 'Starttid'}</label>
              <div className="time-input-wrapper">
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
                {startTime && <button type="button" className="time-clear-btn" onClick={() => setStartTime('')}>{'\u2715'}</button>}
              </div>
            </div>
            <div className="form-group">
              <label>{isEn ? 'End time' : 'Sluttid'}</label>
              <div className="time-input-wrapper">
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
                {endTime && <button type="button" className="time-clear-btn" onClick={() => setEndTime('')}>{'\u2715'}</button>}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{isEn ? 'Location' : 'Lokale'}</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder={isEn ? 'e.g., 4A14, Aud 2' : 'f.eks., 4A14, Aud 2'}
            />
          </div>

          <div className="form-group">
            <label>{isEn ? 'Type' : 'Type'}</label>
            <select value={type} onChange={e => setType(e.target.value as EventType)}>
              {EVENT_TYPES.filter(t => !hiddenEventTypes?.includes(t.value) || t.value === type).map(t => (
                <option key={t.value} value={t.value}>{isEn ? t.label.en : t.label.da}</option>
              ))}
            </select>
          </div>

          {type !== 'holiday' && (
            <div className="form-group">
              <label>{isEn ? 'Course' : 'Kursus'}</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">{isEn ? 'No course' : 'Intet kursus'}</option>
                {courses.filter(c => !c.isSubscribed).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>{isEn ? 'Notes' : 'Noter'}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={isEn ? 'Optional notes...' : 'Valgfrie noter...'}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            {editingEvent && onDelete && (
              <button type="button" className="delete-btn" onClick={handleDelete}>
                {isEn ? 'Delete' : 'Slet'}
              </button>
            )}
            <div className="right-actions">
              <button type="button" onClick={onClose}>{isEn ? 'Cancel' : 'Annuller'}</button>
              <button type="submit" className="save-btn">{isEn ? 'Save' : 'Gem'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
