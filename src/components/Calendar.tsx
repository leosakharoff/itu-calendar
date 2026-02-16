import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import { generateCalendarData, formatDateForDB, type MonthData, type DayInfo } from '../lib/dates'
import type { Course, CalendarEvent } from '../types/database'
import './Calendar.css'

// Context for touch drag state
interface TouchDragContextType {
  draggingEventId: string | null
  setDraggingEventId: (id: string | null) => void
  dropTargetDate: string | null
  setDropTargetDate: (date: string | null) => void
}

const TouchDragContext = createContext<TouchDragContextType>({
  draggingEventId: null,
  setDraggingEventId: () => {},
  dropTargetDate: null,
  setDropTargetDate: () => {},
})

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun']

interface CalendarProps {
  events: CalendarEvent[]
  courses: Course[]
  activeCourseIds: Set<string>
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventMove?: (eventId: string, newDate: string) => void
}

interface MonthColumnProps {
  month: MonthData
  events: CalendarEvent[]
  courses: Course[]
  activeCourseIds: Set<string>
  todayStr: string
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventMove?: (eventId: string, newDate: string) => void
}

interface DayRowProps {
  day: DayInfo
  isOddWeek: boolean
  isToday: boolean
  events: CalendarEvent[]
  courses: Course[]
  onDayClick?: (date: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onEventMove?: (eventId: string, newDate: string) => void
}

function MonthColumn({ month, events, courses, activeCourseIds, todayStr, onDayClick, onEventClick, onEventMove }: MonthColumnProps) {
  let currentWeek = -1
  let weekIndex = 0

  // Filter events for this month and active courses
  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    const inMonth = eventDate.getFullYear() === month.year && eventDate.getMonth() === month.month
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
          // Sort events: holiday > lecture > presentation > exam > deliverable
          const eventTypeOrder: Record<string, number> = {
            holiday: 0,
            lecture: 1,
            presentation: 2,
            exam: 3,
            deliverable: 4
          }
          const dayEvents = monthEvents
            .filter(e => e.date === dayDateStr)
            .sort((a, b) => (eventTypeOrder[a.type] ?? 5) - (eventTypeOrder[b.type] ?? 5))
          const isToday = dayDateStr === todayStr

          return (
            <DayRow
              key={day.day}
              day={day}
              isOddWeek={isOddWeek}
              isToday={isToday}
              events={dayEvents}
              courses={courses}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
              onEventMove={onEventMove}
            />
          )
        })}
      </div>
    </div>
  )
}

function DayRow({ day, isOddWeek, isToday, events, courses, onDayClick, onEventClick, onEventMove }: DayRowProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { draggingEventId, setDraggingEventId, dropTargetDate, setDropTargetDate } = useContext(TouchDragContext)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const longPressTimerRef = useRef<number | null>(null)

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

  const isSubscribedEvent = (event: CalendarEvent) => {
    if (!event.course_id) return false
    const course = courses.find(c => c.id === event.course_id)
    return course?.isSubscribed === true
  }

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    if (isSubscribedEvent(event)) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('text/plain', event.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const eventId = e.dataTransfer.getData('text/plain')
    if (eventId && onEventMove) {
      onEventMove(eventId, formatDateForDB(day.date))
    }
  }

  // Touch event handlers for mobile drag
  const handleTouchStart = (e: React.TouchEvent, event: CalendarEvent) => {
    if (isSubscribedEvent(event)) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }

    // Start long press timer (300ms)
    longPressTimerRef.current = window.setTimeout(() => {
      setDraggingEventId(event.id)
      // Vibrate on supported devices
      if (navigator.vibrate) navigator.vibrate(50)
    }, 300)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Cancel long press if moved too much before timer fires
    if (touchStartRef.current && longPressTimerRef.current) {
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - touchStartRef.current.x)
      const dy = Math.abs(touch.clientY - touchStartRef.current.y)
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }
    }

    // If dragging, find the day row under the touch point
    if (draggingEventId) {
      e.preventDefault()
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const dayRow = element?.closest('.day-row') as HTMLElement | null
      if (dayRow) {
        const dateStr = dayRow.dataset.date
        if (dateStr) {
          setDropTargetDate(dateStr)
        }
      } else {
        setDropTargetDate(null)
      }
    }
  }

  const handleTouchEnd = () => {
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }

    // If we were dragging and have a drop target, move the event
    if (draggingEventId && dropTargetDate && onEventMove) {
      onEventMove(draggingEventId, dropTargetDate)
    }

    // Reset drag state
    setDraggingEventId(null)
    setDropTargetDate(null)
    touchStartRef.current = null
  }

  const dayDateStr = formatDateForDB(day.date)
  const isTouchDragOver = dropTargetDate === dayDateStr

  const classes = ['day-row']
  if (isOddWeek) classes.push('odd-week')
  if (isToday) classes.push('today')
  if (isDragOver || isTouchDragOver) classes.push('drag-over')

  return (
    <div
      className={classes.join(' ')}
      data-date={dayDateStr}
      onClick={handleDayClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="day-weekday">{day.weekday}</span>
      <span className="day-number">{day.day}</span>
      <div className="day-events">
        {events.map((event) => {
          const subscribed = isSubscribedEvent(event)
          return (
          <div
            key={event.id}
            className={`event-item ${event.notes ? 'has-notes' : ''} ${draggingEventId === event.id ? 'dragging' : ''}`}
            title={event.notes ? `${event.title}\n${event.notes}` : event.title}
            draggable={!subscribed}
            onDragStart={(e) => handleDragStart(e, event)}
            onTouchStart={(e) => handleTouchStart(e, event)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
              e.stopPropagation()
              // Don't open modal if we just finished dragging
              if (!draggingEventId) onEventClick?.(event)
            }}
          >
            <span
              className={`event-dot ${event.type}`}
              style={{ '--course-color': getCourseColor(event.course_id) } as React.CSSProperties}
            />
            <span className="event-label">{event.title}</span>
          </div>
          )
        })}
      </div>
      {day.isLastDayOfWeek && (
        <span className="week-number">{day.weekNumber}</span>
      )}
    </div>
  )
}

function useIsPortraitMobile() {
  const [isPortrait, setIsPortrait] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches
  })

  useEffect(() => {
    const check = () => {
      setIsPortrait(window.innerWidth <= 768 && window.matchMedia('(orientation: portrait)').matches)
    }
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  return isPortrait
}

export function Calendar({ events, courses, activeCourseIds, onDayClick, onEventClick, onEventMove }: CalendarProps) {
  const months = generateCalendarData()
  const [todayStr, setTodayStr] = useState(() => formatDateForDB(new Date()))
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null)
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null)
  const [startMonthIndex, setStartMonthIndex] = useState(0)
  const isPortraitMobile = useIsPortraitMobile()

  // Swipe handling refs
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Update today marker at midnight
  useEffect(() => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      setTodayStr(formatDateForDB(new Date()))
    }, msUntilMidnight)

    return () => clearTimeout(timeout)
  }, [todayStr])

  // Swipe handlers for portrait mobile
  const handleSwipeStart = useCallback((e: React.TouchEvent) => {
    if (!isPortraitMobile || draggingEventId) return
    const touch = e.touches[0]
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [isPortraitMobile, draggingEventId])

  const handleSwipeEnd = useCallback((e: React.TouchEvent) => {
    if (!isPortraitMobile || !swipeStartRef.current || draggingEventId) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - swipeStartRef.current.x
    const dy = touch.clientY - swipeStartRef.current.y

    // Only count horizontal swipes (dx > dy threshold)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0 && startMonthIndex < 4) {
        setStartMonthIndex(prev => prev + 1)
      } else if (dx > 0 && startMonthIndex > 0) {
        setStartMonthIndex(prev => prev - 1)
      }
    }
    swipeStartRef.current = null
  }, [isPortraitMobile, startMonthIndex, draggingEventId])

  const gridStyle = isPortraitMobile
    ? { transform: `translateX(-${startMonthIndex * 100}%)` }
    : undefined

  const pairLabel = isPortraitMobile
    ? `${MONTH_NAMES[startMonthIndex]} — ${MONTH_NAMES[startMonthIndex + 1]}`
    : ''

  return (
    <TouchDragContext.Provider value={{ draggingEventId, setDraggingEventId, dropTargetDate, setDropTargetDate }}>
      <div
        className={`calendar ${draggingEventId ? 'touch-dragging' : ''}`}
        onTouchStart={handleSwipeStart}
        onTouchEnd={handleSwipeEnd}
      >
        <div className="calendar-grid" ref={gridRef} style={gridStyle}>
          {months.map((month) => (
            <MonthColumn
              key={month.name}
              month={month}
              events={events}
              courses={courses}
              activeCourseIds={activeCourseIds}
              todayStr={todayStr}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
              onEventMove={onEventMove}
            />
          ))}
        </div>
        <div className="month-indicator">
          <div className="month-indicator-dots">
            {[0, 1, 2, 3, 4].map(i => (
              <button
                key={i}
                className={`month-indicator-dot ${i === startMonthIndex ? 'active' : ''}`}
                onClick={() => setStartMonthIndex(i)}
              />
            ))}
          </div>
          <span className="month-indicator-label">{pairLabel}</span>
        </div>
      </div>
    </TouchDragContext.Provider>
  )
}
