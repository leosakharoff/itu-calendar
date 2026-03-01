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

  const isEn = navigator.language.startsWith('en')

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
          setError(isEn ? 'This share link is invalid or has been deactivated.' : 'Dette delingslink er ugyldigt eller er blevet deaktiveret.')
          return
        }

        const course = share.courses as Course
        if (!course) {
          setError(isEn ? 'Course not found.' : 'Kursus ikke fundet.')
          return
        }

        // Fetch events for the course
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('course_id', share.course_id)
          .order('date')

        if (eventsError) {
          setError(isEn ? 'Failed to load events.' : 'Kunne ikke indl\u00e6se begivenheder.')
          return
        }

        setData({ course, events: events || [] })
      } catch {
        setError(isEn ? 'Something went wrong.' : 'Noget gik galt.')
      } finally {
        setLoading(false)
      }
    }

    fetchShareData()
  }, [token, isEn])

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
          <a href="/" className="subscribe-home-link">{isEn ? 'Go to ITU Calendar' : 'G\u00e5 til ITU Calendar'}</a>
        </div>
      </div>
    )
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const icalUrl = `${supabaseUrl}/functions/v1/ical?token=${token}`
  const webcalUrl = icalUrl.replace(/^https?:\/\//, 'webcal://')
  const googleCalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(icalUrl)}`

  const eventTypeLabels: Record<string, { da: string; en: string }> = {
    lecture: { da: 'Forel\u00e6sning', en: 'Lecture' },
    deliverable: { da: 'Aflevering', en: 'Deliverable' },
    exam: { da: 'Eksamen', en: 'Exam' },
    presentation: { da: 'Pr\u00e6sentation', en: 'Presentation' },
    meeting: { da: 'M\u00f8de', en: 'Meeting' },
    holiday: { da: 'Helligdag', en: 'Holiday' }
  }

  const eventCount = data.events.length
  const subtitle = isEn
    ? `${eventCount} event${eventCount !== 1 ? 's' : ''} shared from ITU Calendar`
    : `${eventCount} begivenhed${eventCount !== 1 ? 'er' : ''} delt fra ITU Calendar`

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
        <p className="subscribe-subtitle">{subtitle}</p>

        <div className="subscribe-actions">
          <a href={webcalUrl} className="subscribe-btn subscribe-btn-primary">
            {isEn ? 'Subscribe in Apple Calendar' : 'Abonner i Apple Kalender'}
          </a>
          <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="subscribe-btn subscribe-btn-secondary">
            {isEn ? 'Subscribe in Google Calendar' : 'Abonner i Google Kalender'}
          </a>
          <a href="/" className="subscribe-btn subscribe-btn-tertiary">
            {isEn ? 'Open in ITU Calendar' : '\u00c5bn i ITU Calendar'}
          </a>
        </div>

        <div className="subscribe-events">
          <h2>{isEn ? 'Events' : 'Begivenheder'}</h2>
          <div className="subscribe-event-list">
            {data.events.map(event => {
              const typeLabel = eventTypeLabels[event.type]
              return (
                <div key={event.id} className="subscribe-event-item">
                  <span
                    className="subscribe-event-dot"
                    style={{ backgroundColor: data.course.color }}
                  />
                  <span className="subscribe-event-date">
                    {formatDate(event.date, isEn)}
                  </span>
                  <span className="subscribe-event-title">{event.title}</span>
                  <span className="subscribe-event-type">
                    {typeLabel ? (isEn ? typeLabel.en : typeLabel.da) : event.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string, isEn: boolean): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString(isEn ? 'en-GB' : 'da-DK', { month: 'short', day: 'numeric' })
}
