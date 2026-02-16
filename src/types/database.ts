export type EventType = 'lecture' | 'deliverable' | 'exam' | 'presentation' | 'holiday'

export interface Course {
  id: string
  name: string
  color: string
  active: boolean
  sort_order: number
  created_at: string
  isSubscribed?: boolean
  subscriptionId?: string | null
}

export interface CalendarEvent {
  id: string
  course_id: string | null
  title: string
  date: string
  type: EventType
  notes: string | null
  created_at: string
}

export interface SharedCalendar {
  id: string
  user_id: string
  course_id: string
  share_token: string
  is_active: boolean
  created_at: string
}

export interface Subscription {
  id: string
  subscriber_id: string
  shared_calendar_id: string
  source_course_id: string
  source_user_id: string
  active: boolean
  sort_order: number
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  calendar_start: string // 'YYYY-MM'
  calendar_end: string   // 'YYYY-MM'
  week_start: 'monday' | 'sunday'
  language: 'da' | 'en'
  combined_share_token?: string | null
  created_at: string
}
