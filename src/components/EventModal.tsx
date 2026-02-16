import { useState, useEffect } from 'react'
import type { Course, CalendarEvent, EventType } from '../types/database'
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
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'deliverable', label: 'Deliverable' },
  { value: 'exam', label: 'Exam' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'holiday', label: 'Holiday' }
]

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  courses,
  initialDate,
  editingEvent
}: EventModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState<EventType>('lecture')
  const [courseId, setCourseId] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const { sheetRef, handleTouchStart, handleTouchMove, handleTouchEnd, isDragging, overlayOpacity, sheetStyle } = useBottomSheetDismiss(isOpen, onClose)

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setDate(editingEvent.date)
      setType(editingEvent.type)
      setCourseId(editingEvent.course_id || '')
      setNotes(editingEvent.notes || '')
      setStartTime(editingEvent.start_time || '')
      setEndTime(editingEvent.end_time || '')
    } else if (initialDate) {
      setTitle('')
      setDate(formatDateForDB(initialDate))
      setType('lecture')
      setCourseId(courses[0]?.id || '')
      setNotes('')
      setStartTime('')
      setEndTime('')
    }
  }, [editingEvent, initialDate, courses])

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
      start_time: startTime || null,
      end_time: endTime || null
    })
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && confirm('Delete this event?')) {
      onDelete()
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={isDragging ? { background: `rgba(0, 0, 0, ${overlayOpacity})` } : undefined}>
      <div ref={sheetRef} className="modal-content" onClick={e => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} style={sheetStyle}>
        <h3>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Lecture 1"
              autoFocus={!editingEvent}
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Start time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value as EventType)}>
              {EVENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {type !== 'holiday' && (
            <div className="form-group">
              <label>Course</label>
              <select value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">No course</option>
                {courses.filter(c => !c.isSubscribed).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>

          <div className="modal-actions">
            {editingEvent && onDelete && (
              <button type="button" className="delete-btn" onClick={handleDelete}>
                Delete
              </button>
            )}
            <div className="right-actions">
              <button type="button" onClick={onClose}>Cancel</button>
              <button type="submit" className="save-btn">Save</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
