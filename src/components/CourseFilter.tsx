import { useState, useRef, useEffect, useCallback } from 'react'
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
  onOpenProfile: () => void
  userInitials: string
}

export function CourseFilter({ courses, activeCourseIds, onToggle, onSolo, onAddCourse, onEditCourse, onReorderCourses, onOpenProfile, userInitials }: CourseFilterProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragOverId = useRef<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setDrawerOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

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

  const courseItems = (mobile: boolean) =>
    courses.map((course) => (
      <label
        key={course.id}
        className={`filter-item ${draggedId === course.id ? 'dragging' : ''}`}
        draggable={!mobile}
        onDragStart={mobile ? undefined : (e) => handleDragStart(e, course.id)}
        onDragOver={mobile ? undefined : (e) => handleDragOver(e, course.id)}
        onDragEnd={mobile ? undefined : handleDragEnd}
        onDoubleClick={() => onSolo(course.id)}
      >
        {!mobile && <span className="drag-handle">⋮⋮</span>}
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
        {course.isSubscribed && <span className="live-badge">Live</span>}
      </label>
    ))

  if (isMobile) {
    return (
      <>
        <div className="mobile-top-bar">
          <button
            className="hamburger-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open courses menu"
          >
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
              <rect y="0" width="22" height="2.5" rx="1" fill="currentColor" />
              <rect y="6.75" width="22" height="2.5" rx="1" fill="currentColor" />
              <rect y="13.5" width="22" height="2.5" rx="1" fill="currentColor" />
            </svg>
          </button>
          <button
            className="avatar-btn"
            onClick={onOpenProfile}
            aria-label="Open profile"
          >
            <span className="avatar-initials">{userInitials}</span>
          </button>
        </div>

        <div
          className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
          onClick={closeDrawer}
        />
        <div className={`drawer-panel ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <span className="drawer-title">Courses</span>
            <button
              className="drawer-close-btn"
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              &times;
            </button>
          </div>
          <div className="drawer-body">
            {courseItems(true)}
            <button className="add-course-btn" onClick={onAddCourse}>
              + Add Course
            </button>
          </div>
          <div className="drawer-footer">
            <button className="drawer-profile-btn" onClick={() => { closeDrawer(); onOpenProfile() }}>
              <span className="avatar-initials-small">{userInitials}</span>
              Profile settings
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="course-filter">
      <div className="filter-label">Courses:</div>
      <div className="filter-items">
        {courseItems(false)}
        <button className="add-course-btn" onClick={onAddCourse}>
          + Add Course
        </button>
      </div>
      <div className="user-section">
        <button
          className="avatar-btn"
          onClick={onOpenProfile}
          aria-label="Open profile"
        >
          <span className="avatar-initials">{userInitials}</span>
        </button>
      </div>
    </div>
  )
}
