import { useState, useRef, useEffect, useCallback } from 'react'
import type { Course } from '../types/database'
import type { Language } from '../lib/dates'
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
  onOpenSettings: () => void
  onOpenShare: () => void
  onOpenNotifications: () => void
  userInitials: string
  avatarUrl?: string
  monthPairLabel?: string
  language?: Language
}

export function CourseFilter({ courses, activeCourseIds, onToggle, onSolo, onAddCourse, onEditCourse, onReorderCourses, onOpenProfile, onOpenSettings, onOpenShare, onOpenNotifications, userInitials, avatarUrl, monthPairLabel, language = 'da' }: CourseFilterProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const dragOverId = useRef<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  const isEn = language === 'en'

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

  // Edge swipe to open drawer (mobile only)
  useEffect(() => {
    if (!isMobile || drawerOpen) return

    let startX = 0
    let startY = 0
    let tracking = false

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (touch.clientX <= 20) {
        startX = touch.clientX
        startY = touch.clientY
        tracking = true
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return
      const touch = e.touches[0]
      const dx = touch.clientX - startX
      const dy = Math.abs(touch.clientY - startY)
      if (dx > 50 && dy < 30) {
        setDrawerOpen(true)
        tracking = false
      }
    }

    const onTouchEnd = () => {
      tracking = false
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [isMobile, drawerOpen])

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
          {monthPairLabel && (
            <span className="top-bar-month-label">{monthPairLabel}</span>
          )}
          <button
            className="avatar-btn"
            onClick={onOpenProfile}
            aria-label="Open profile"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="avatar-img" />
            ) : (
              <span className="avatar-initials">{userInitials}</span>
            )}
          </button>
        </div>

        <div
          className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
          onClick={closeDrawer}
        />
        <div className={`drawer-panel ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <span className="drawer-title">{isEn ? 'Courses' : 'Kurser'}</span>
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
              + {isEn ? 'Add Course' : 'Tilf\u00f8j kursus'}
            </button>
          </div>
          <div className="drawer-footer">
            <button className="drawer-share-btn" onClick={() => { closeDrawer(); onOpenShare() }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              {isEn ? 'Share courses' : 'Del kurser'}
            </button>
            <button className="drawer-settings-btn" onClick={() => { closeDrawer(); onOpenSettings() }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
              {isEn ? 'Settings' : 'Indstillinger'}
            </button>
            <button className="drawer-notification-btn" onClick={() => { closeDrawer(); onOpenNotifications() }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              {isEn ? 'Notifications' : 'Notifikationer'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="course-filter">
      <div className="filter-label">{isEn ? 'Courses:' : 'Kurser:'}</div>
      <div className="filter-items">
        {courseItems(false)}
        <button className="add-course-btn" onClick={onAddCourse}>
          + {isEn ? 'Add Course' : 'Tilf\u00f8j kursus'}
        </button>
      </div>
      <div className="user-section">
        <button
          className="icon-btn"
          onClick={onOpenShare}
          aria-label="Share"
          title={isEn ? 'Share courses' : 'Del kurser'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
          title={isEn ? 'Settings' : 'Indstillinger'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
        <button
          className="avatar-btn"
          onClick={onOpenProfile}
          aria-label="Open profile"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="avatar-img" />
          ) : (
            <span className="avatar-initials">{userInitials}</span>
          )}
        </button>
      </div>
    </div>
  )
}
