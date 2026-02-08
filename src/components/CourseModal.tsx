import { useState, useEffect } from 'react'
import type { Course } from '../types/database'
import './EventModal.css'

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (course: Omit<Course, 'id' | 'created_at'>) => void
  onDelete?: () => void
  editingCourse?: Course | null
}

const COLORS = [
  '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336',
  '#00BCD4', '#795548', '#607D8B', '#E91E63', '#3F51B5'
]

export function CourseModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingCourse
}: CourseModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name)
      setColor(editingCourse.color)
    } else {
      setName('')
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    }
  }, [editingCourse, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      color,
      active: true,
      sort_order: editingCourse?.sort_order ?? 999
    })
    onClose()
  }

  const handleDelete = () => {
    if (onDelete && confirm('Delete this course and all its events?')) {
      onDelete()
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Algorithms"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {editingCourse && onDelete && (
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
