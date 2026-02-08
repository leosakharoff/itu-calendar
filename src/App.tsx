import { useState, useMemo } from 'react'
import { Calendar } from './components/Calendar'
import { CourseFilter } from './components/CourseFilter'
import { EventModal } from './components/EventModal'
import { CourseModal } from './components/CourseModal'
import { useCalendarData } from './hooks/useCalendarData'
import type { CalendarEvent, Course } from './types/database'
import './App.css'

function App() {
  const {
    courses, events, loading, error,
    addEvent, updateEvent, deleteEvent,
    addCourse, updateCourse, deleteCourse
  } = useCalendarData()

  const [activeCourseIds, setActiveCourseIds] = useState<Set<string>>(new Set())
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Initialize active courses when data loads
  useMemo(() => {
    if (courses.length > 0 && activeCourseIds.size === 0) {
      setActiveCourseIds(new Set(courses.filter(c => c.active).map(c => c.id)))
    }
  }, [courses, activeCourseIds.size])

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

  if (loading) {
    return <div className="app loading">Loading...</div>
  }

  if (error) {
    return <div className="app error">Error: {error}</div>
  }

  return (
    <div className="app">
      <CourseFilter
        courses={courses}
        activeCourseIds={activeCourseIds}
        onToggle={toggleCourse}
        onAddCourse={handleAddCourse}
        onEditCourse={handleEditCourse}
      />
      <Calendar
        events={events}
        courses={courses}
        activeCourseIds={activeCourseIds}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        courses={courses}
        initialDate={selectedDate}
        editingEvent={editingEvent}
      />
      <CourseModal
        isOpen={courseModalOpen}
        onClose={() => setCourseModalOpen(false)}
        onSave={handleSaveCourse}
        onDelete={editingCourse ? handleDeleteCourse : undefined}
        editingCourse={editingCourse}
      />
    </div>
  )
}

export default App
