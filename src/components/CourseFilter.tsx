import { useState, useRef } from 'react'
import type { Course } from '../types/database'
import './CourseFilter.css'

interface CourseFilterProps {
  courses: Course[]
  activeCourseIds: Set<string>
  onToggle: (courseId: string) => void
  onSolo: (courseId: string) => void
  onAddCourse: () => void
  onEditCourse: (course: Course) => void
  onReorderCourses: (courses: Course[]) => void
}

export function CourseFilter({ courses, activeCourseIds, onToggle, onSolo, onAddCourse, onEditCourse, onReorderCourses }: CourseFilterProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  const handleDragStart = (e: React.DragEvent, courseId: string) => {
    setDraggedId(courseId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, courseId: string) => {
    e.preventDefault()
    dragOverId.current = courseId
  }

  const handleDragEnd = () => {
    if (draggedId && dragOverId.current && draggedId !== dragOverId.current) {
      const draggedIndex = courses.findIndex(c => c.id === draggedId)
      const dropIndex = courses.findIndex(c => c.id === dragOverId.current)

      if (draggedIndex !== -1 && dropIndex !== -1) {
        const reordered = [...courses]
        const [removed] = reordered.splice(draggedIndex, 1)
        reordered.splice(dropIndex, 0, removed)
        onReorderCourses(reordered)
      }
    }
    setDraggedId(null)
    dragOverId.current = null
  }

  return (
    <div className="course-filter">
      <div className="filter-label">Courses:</div>
      <div className="filter-items">
        {courses.map((course) => (
          <label
            key={course.id}
            className={`filter-item ${draggedId === course.id ? 'dragging' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, course.id)}
            onDragOver={(e) => handleDragOver(e, course.id)}
            onDragEnd={handleDragEnd}
            onDoubleClick={() => onSolo(course.id)}
          >
            <span className="drag-handle">⋮⋮</span>
            <input
              type="checkbox"
              checked={activeCourseIds.has(course.id)}
              onChange={() => onToggle(course.id)}
            />
            <span
              className="color-dot"
              style={{ backgroundColor: course.color }}
            />
            <span
              className="course-name"
              onClick={(e) => {
                e.preventDefault()
                onEditCourse(course)
              }}
            >
              {course.name}
            </span>
          </label>
        ))}
        <button className="add-course-btn" onClick={onAddCourse}>
          + Add Course
        </button>
      </div>
    </div>
  )
}
