export type EventType = 'lecture' | 'deliverable' | 'exam' | 'presentation' | 'holiday'

export interface Course {
  id: string
  name: string
  color: string
  active: boolean
  created_at: string
}

export interface CalendarEvent {
  id: string
  course_id: string | null
  title: string
  date: string
  type: EventType
  created_at: string
}
