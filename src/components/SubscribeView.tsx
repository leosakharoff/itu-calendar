import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { CalendarEvent, Course } from '../types/database'
import './SubscribeView.css'

interface SubscribeViewProps {
  token: string
}

interface ShareData {
  course: Course
  events: CalendarEvent[]
}

export function SubscribeView({ token }: SubscribeViewProps) {
  const [data, setData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchShareData() {
      try {
        // Look up the shared calendar by token
        const { data: share, error: shareError } = await supabase
          .from('shared_calendars')
          .select('*, courses(*)')
          .eq('share_token', token)
          .eq('is_active', true)
          .single()

        if (shareError || !share) {
          setError('This share link is invalid or has been deactivated.')
          return
        }

        const course = share.courses as Course
        if (!course) {
          setError('Course not found.')
          return
        }

        // Fetch events for the course
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('course_id', share.course_id)
          .order('date')

        if (eventsError) {
          setError('Failed to load events.')
          return
        }

        setData({ course, events: events || [] })
      } catch {
        setError('Something went wrong.')
      } finally {
        setLoading(false)
      }
    }

    fetchShareData()
  }, [token])

  if (loading) {
    return (
      <div className="subscribe-page">
        <div className="subscribe-container">
          <p className="subscribe-loading">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="subscribe-page">
        <div className="subscribe-container">
          <h1>ITU Calendar</h1>
          <p className="subscribe-error">{error}</p>
          <a href="/" className="subscribe-home-link">Go to ITU Calendar</a>
        </div>
      </div>
    )
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const icalUrl = `${supabaseUrl}/functions/v1/ical?token=${token}`
  const webcalUrl = icalUrl.replace(/^https?:\/\//, 'webcal://')
  const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl)}`

  const eventTypeLabels: Record<string, string> = {
    lecture: 'Lecture',
    deliverable: 'Deliverable',
    exam: 'Exam',
    presentation: 'Presentation',
    holiday: 'Holiday'
  }

  return (
    <div className="subscribe-page">
      <div className="subscribe-container">
        <div className="subscribe-header">
          <div
            className="subscribe-color-dot"
            style={{ backgroundColor: data.course.color }}
          />
          <h1>{data.course.name}</h1>
        </div>
        <p className="subscribe-subtitle">
          {data.events.length} event{data.events.length !== 1 ? 's' : ''} shared from ITU Calendar
        </p>

        <div className="subscribe-actions">
          <a href={webcalUrl} className="subscribe-btn subscribe-btn-primary">
            Subscribe in Apple Calendar
          </a>
          <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="subscribe-btn subscribe-btn-secondary">
            Subscribe in Google Calendar
          </a>
          <a href="/" className="subscribe-btn subscribe-btn-tertiary">
            Open in ITU Calendar
          </a>
        </div>

        <div className="subscribe-events">
          <h2>Events</h2>
          <div className="subscribe-event-list">
            {data.events.map(event => (
              <div key={event.id} className="subscribe-event-item">
                <span
                  className="subscribe-event-dot"
                  style={{ backgroundColor: data.course.color }}
                />
                <span className="subscribe-event-date">
                  {formatDate(event.date)}
                </span>
                <span className="subscribe-event-title">{event.title}</span>
                <span className="subscribe-event-type">
                  {eventTypeLabels[event.type] || event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-DK', { month: 'short', day: 'numeric' })
}
