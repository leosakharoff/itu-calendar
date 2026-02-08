import { generateCalendarData, formatDateForDB, type MonthData, type DayInfo } from '../lib/dates'
import type { Course, CalendarEvent } from '../types/database'
import './Calendar.css'

interface CalendarProps {
  events: CalendarEvent[]
  courses: Course[]
  activeCourseIds: Set<string>
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

interface MonthColumnProps {
  month: MonthData
  events: CalendarEvent[]
  courses: Course[]
  activeCourseIds: Set<string>
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

interface DayRowProps {
  day: DayInfo
  isOddWeek: boolean
  events: CalendarEvent[]
  courses: Course[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
}

function MonthColumn({ month, events, courses, activeCourseIds, onDayClick, onEventClick }: MonthColumnProps) {
  let currentWeek = -1
  let weekIndex = 0

  // Filter events for this month and active courses
  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    const inMonth = eventDate.getFullYear() === month.year && eventDate.getMonth() === (new Date(`${month.name} 1, ${month.year}`).getMonth())
    const isHoliday = e.type === 'holiday'
    const courseActive = e.course_id ? activeCourseIds.has(e.course_id) : true
    return inMonth && (isHoliday || courseActive)
  })

  return (
    <div className="month-column">
      <div className="month-header">
        {month.name} {month.year}
      </div>
      <div className="month-days">
        {month.days.map((day) => {
          if (day.weekNumber !== currentWeek) {
            currentWeek = day.weekNumber
            weekIndex++
          }
          const isOddWeek = weekIndex % 2 === 1
          const dayDateStr = formatDateForDB(day.date)
          const dayEvents = monthEvents.filter(e => e.date === dayDateStr)

          return (
            <DayRow
              key={day.day}
              day={day}
              isOddWeek={isOddWeek}
              events={dayEvents}
              courses={courses}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          )
        })}
      </div>
    </div>
  )
}

function DayRow({ day, isOddWeek, events, courses, onDayClick, onEventClick }: DayRowProps) {
  const getCourseColor = (courseId: string | null) => {
    if (!courseId) return '#666'
    const course = courses.find(c => c.id === courseId)
    return course?.color || '#666'
  }

  const handleDayClick = (e: React.MouseEvent) => {
    // Only trigger if clicking on the day row itself, not an event
    if ((e.target as HTMLElement).closest('.event-item')) return
    onDayClick?.(day.date)
  }

  return (
    <div
      className={`day-row ${isOddWeek ? 'odd-week' : ''}`}
      onClick={handleDayClick}
    >
      <span className="day-weekday">{day.weekday}</span>
      <span className="day-number">{day.day}</span>
      <div className="day-events">
        {events.map((event) => (
          <div
            key={event.id}
            className="event-item"
            onClick={(e) => {
              e.stopPropagation()
              onEventClick?.(event)
            }}
          >
            <span
              className={`event-dot ${event.type}`}
              style={{ '--course-color': getCourseColor(event.course_id) } as React.CSSProperties}
            />
            <span className="event-label">{event.title}</span>
          </div>
        ))}
      </div>
      {day.isLastDayOfWeek && (
        <span className="week-number">{day.weekNumber}</span>
      )}
    </div>
  )
}

export function Calendar({ events, courses, activeCourseIds, onDayClick, onEventClick }: CalendarProps) {
  const months = generateCalendarData()

  return (
    <div className="calendar">
      <div className="calendar-grid">
        {months.map((month) => (
          <MonthColumn
            key={month.name}
            month={month}
            events={events}
            courses={courses}
            activeCourseIds={activeCourseIds}
            onDayClick={onDayClick}
            onEventClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
