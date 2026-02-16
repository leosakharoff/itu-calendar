import { useState, useRef, useEffect, useCallback } from 'react'
import type { Course, UserSettings } from '../types/database'
import './CourseFilter.css'

const MONTH_OPTIONS = [
  { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' }, { value: '04', label: 'Apr' },
  { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' }, { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
]

const YEAR_OPTIONS = ['2025', '2026', '2027', '2028']

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
  monthPairLabel?: string
  settings?: UserSettings | null
  onUpdateSettings?: (partial: Partial<Pick<UserSettings, 'calendar_start' | 'calendar_end' | 'week_start' | 'language'>>) => void
}

export function CourseFilter({ courses, activeCourseIds, onToggle, onSolo, onAddCourse, onEditCourse, onReorderCourses, onOpenProfile, userInitials, monthPairLabel, settings, onUpdateSettings }: CourseFilterProps) {
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

  const startMonth = settings?.calendar_start?.split('-')[1] || '01'
  const startYear = settings?.calendar_start?.split('-')[0] || '2026'
  const endMonth = settings?.calendar_end?.split('-')[1] || '06'
  const endYear = settings?.calendar_end?.split('-')[0] || '2026'

  const settingsSection = settings && onUpdateSettings ? (
    <div className="settings-section">
      <div className="settings-title">Settings</div>
      <div className="settings-row">
        <span className="settings-label">{settings.language === 'en' ? 'Date range' : 'Datointerval'}</span>
        <div className="settings-range">
          <select
            value={startMonth}
            onChange={e => onUpdateSettings({ calendar_start: `${startYear}-${e.target.value}` })}
          >
            {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={startYear}
            onChange={e => onUpdateSettings({ calendar_start: `${e.target.value}-${startMonth}` })}
          >
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="settings-range-sep">—</span>
          <select
            value={endMonth}
            onChange={e => onUpdateSettings({ calendar_end: `${endYear}-${e.target.value}` })}
          >
            {MONTH_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value={endYear}
            onChange={e => onUpdateSettings({ calendar_end: `${e.target.value}-${endMonth}` })}
          >
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="settings-row">
        <span className="settings-label">{settings.language === 'en' ? 'Week starts' : 'Uge starter'}</span>
        <select
          value={settings.week_start}
          onChange={e => onUpdateSettings({ week_start: e.target.value as 'monday' | 'sunday' })}
        >
          <option value="monday">{settings.language === 'en' ? 'Monday' : 'Mandag'}</option>
          <option value="sunday">{settings.language === 'en' ? 'Sunday' : 'Søndag'}</option>
        </select>
      </div>
      <div className="settings-row">
        <span className="settings-label">{settings.language === 'en' ? 'Language' : 'Sprog'}</span>
        <select
          value={settings.language}
          onChange={e => onUpdateSettings({ language: e.target.value as 'da' | 'en' })}
        >
          <option value="da">Dansk</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  ) : null

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
            <span className="avatar-initials">{userInitials}</span>
          </button>
        </div>

        <div
          className={`drawer-overlay ${drawerOpen ? 'open' : ''}`}
          onClick={closeDrawer}
        />
        <div className={`drawer-panel ${drawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <span className="drawer-title">{settings?.language === 'en' ? 'Courses' : 'Kurser'}</span>
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
              + {settings?.language === 'en' ? 'Add Course' : 'Tilføj kursus'}
            </button>
            {settingsSection}
          </div>
          <div className="drawer-footer">
            <button className="drawer-profile-btn" onClick={() => { closeDrawer(); onOpenProfile() }}>
              <span className="avatar-initials-small">{userInitials}</span>
              {settings?.language === 'en' ? 'Profile settings' : 'Profilindstillinger'}
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="course-filter">
      <div className="filter-label">{settings?.language === 'en' ? 'Courses:' : 'Kurser:'}</div>
      <div className="filter-items">
        {courseItems(false)}
        <button className="add-course-btn" onClick={onAddCourse}>
          + {settings?.language === 'en' ? 'Add Course' : 'Tilføj kursus'}
        </button>
      </div>
      {settingsSection}
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
