import { useState, useEffect, useRef } from 'react'
import { Calendar } from './components/Calendar'
import { CourseFilter } from './components/CourseFilter'
import { EventModal } from './components/EventModal'
import { CourseModal } from './components/CourseModal'
import { ProfileModal, getInitials } from './components/ProfileModal'
import { OfflineIndicator } from './components/OfflineIndicator'
import { LoginPage } from './components/LoginPage'
import { SubscribeView } from './components/SubscribeView'
import { useCalendarData } from './hooks/useCalendarData'
import { useSettings } from './hooks/useSettings'
import { useAuthContext } from './contexts/AuthContext'
import type { CalendarEvent, Course } from './types/database'
import './App.css'

function App() {
  // Check if this is a /subscribe route
  const params = new URLSearchParams(window.location.search)
  const subscribeToken = window.location.pathname === '/subscribe' ? params.get('token') : null

  if (subscribeToken) {
    return <SubscribeView token={subscribeToken} />
  }

  return <MainApp />
}

function MainApp() {
  const { user, loading: authLoading, signOut, updateProfile, updateEmail, updatePassword } = useAuthContext()
  const {
    courses, events, loading, error,
    addEvent, updateEvent, deleteEvent,
    addCourse, updateCourse, deleteCourse, reorderCourses,
    getShareForCourse, createShare, toggleShare,
    subscribeToShareCopy, subscribeToShareLive, isEventSubscribed
  } = useCalendarData(user?.id)
  const { settings, loading: settingsLoading, updateSettings } = useSettings(user?.id)

  const [activeCourseIds, setActiveCourseIds] = useState<Set<string>>(new Set())
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [monthPairLabel, setMonthPairLabel] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const prevUserIdRef = useRef(user?.id)

  // Reset active courses when user changes or courses load
  useEffect(() => {
    const userChanged = prevUserIdRef.current !== user?.id
    prevUserIdRef.current = user?.id

    if (userChanged) {
      setActiveCourseIds(new Set())
    }

    if (courses.length > 0) {
      setActiveCourseIds(prev => {
        if (prev.size === 0 || userChanged) {
          return new Set(courses.filter(c => c.active).map(c => c.id))
        }
        return prev
      })
    }
  }, [courses, user?.id])

  const toggleCourse = (courseId: string) => {
    setActiveCourseIds(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) {
        next.delete(courseId)
      } else {
        next.add(courseId)
      }
      return next
    })
  }

  const soloCourse = (courseId: string) => {
    setActiveCourseIds(prev => {
      // If already soloed (only this course active), show all courses
      if (prev.size === 1 && prev.has(courseId)) {
        return new Set(courses.map(c => c.id))
      }
      // Otherwise, solo this course
      return new Set([courseId])
    })
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setEditingEvent(null)
    setEventModalOpen(true)
  }

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event)
    setSelectedDate(undefined)
    setEventModalOpen(true)
  }

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
      } else {
        await addEvent(eventData)
      }
    } catch (err) {
      console.error('Failed to save event:', err)
    }
  }

  const handleDeleteEvent = async () => {
    if (editingEvent) {
      try {
        await deleteEvent(editingEvent.id)
      } catch (err) {
        console.error('Failed to delete event:', err)
      }
    }
  }

  const handleEventMove = async (eventId: string, newDate: string) => {
    const event = events.find(e => e.id === eventId)
    if (event && !isEventSubscribed(event)) {
      try {
        await updateEvent(eventId, { ...event, date: newDate })
      } catch (err) {
        console.error('Failed to move event:', err)
      }
    }
  }

  const handleAddCourse = () => {
    setEditingCourse(null)
    setCourseModalOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseModalOpen(true)
  }

  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'created_at'>) => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseData)
      } else {
        const newCourse = await addCourse(courseData)
        setActiveCourseIds(prev => new Set([...prev, newCourse.id]))
      }
    } catch (err) {
      console.error('Failed to save course:', err)
    }
  }

  const handleDeleteCourse = async () => {
    if (editingCourse) {
      try {
        await deleteCourse(editingCourse.id)
        setActiveCourseIds(prev => {
          const next = new Set(prev)
          next.delete(editingCourse.id)
          return next
        })
      } catch (err) {
        console.error('Failed to delete course:', err)
      }
    }
  }

  if (authLoading) {
    return <div className="app loading">Loading...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  if ((loading && courses.length === 0) || settingsLoading) {
    return <div className="app loading">Loading calendar...</div>
  }

  if (error) {
    return <div className="app error">Error: {error}</div>
  }

  return (
    <div className="app">
      <OfflineIndicator />
      <CourseFilter
        courses={courses}
        activeCourseIds={activeCourseIds}
        onToggle={toggleCourse}
        onSolo={soloCourse}
        onAddCourse={handleAddCourse}
        onEditCourse={handleEditCourse}
        onReorderCourses={reorderCourses}
        onOpenProfile={() => setProfileModalOpen(true)}
        userInitials={user ? getInitials(user) : '?'}
        avatarUrl={user?.user_metadata?.avatar_url || undefined}
        monthPairLabel={monthPairLabel}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
      <Calendar
        events={events}
        courses={courses}
        activeCourseIds={activeCourseIds}
        calendarStart={settings?.calendar_start}
        calendarEnd={settings?.calendar_end}
        weekStart={settings?.week_start}
        language={settings?.language}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
        onEventMove={handleEventMove}
        onMonthPairChange={setMonthPairLabel}
      />
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        courses={courses}
        initialDate={selectedDate}
        editingEvent={editingEvent}
        isReadOnly={editingEvent ? isEventSubscribed(editingEvent) : false}
      />
      {user && (
        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          onSignOut={signOut}
          onUpdateProfile={updateProfile}
          onUpdateEmail={updateEmail}
          onUpdatePassword={updatePassword}
        />
      )}
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSave={handleSaveCourse}
        onDelete={editingCourse ? handleDeleteCourse : undefined}
        editingCourse={editingCourse}
        onGetShare={getShareForCourse}
        onCreateShare={createShare}
        onToggleShare={toggleShare}
        onSubscribeToShareLive={async (token) => {
          const course = await subscribeToShareLive(token)
          setActiveCourseIds(prev => new Set([...prev, course.id]))
          return course
        }}
        onSubscribeToShareCopy={async (token) => {
          const course = await subscribeToShareCopy(token)
          setActiveCourseIds(prev => new Set([...prev, course.id]))
          return course
        }}
      />
    </div>
  )
}

export default App
