import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response('Missing token parameter', { status: 400, headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Look up the user by combined_share_token
  const { data: userSettings, error: settingsError } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('combined_share_token', token)
    .single()

  if (settingsError || !userSettings) {
    return new Response('Invalid token', { status: 404, headers: corsHeaders })
  }

  const userId = userSettings.user_id

  // Fetch user's own courses
  const { data: ownCourses } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', userId)

  // Fetch user's subscriptions to get subscribed course IDs
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('source_course_id')
    .eq('subscriber_id', userId)

  // Build set of all course IDs (owned + subscribed)
  const courseMap = new Map<string, { name: string; color: string }>()
  for (const course of ownCourses || []) {
    courseMap.set(course.id, { name: course.name, color: course.color })
  }

  const subscribedCourseIds = (subscriptions || []).map(s => s.source_course_id)
  if (subscribedCourseIds.length > 0) {
    const { data: subCourses } = await supabase
      .from('courses')
      .select('*')
      .in('id', subscribedCourseIds)

    for (const course of subCourses || []) {
      courseMap.set(course.id, { name: course.name, color: course.color })
    }
  }

  // Fetch events for all courses
  const allCourseIds = Array.from(courseMap.keys())
  if (allCourseIds.length === 0) {
    // Empty calendar
    const ical = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ITU Calendar//EN', 'X-WR-CALNAME:ITU Calendar', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'END:VCALENDAR'].join('\r\n')
    return new Response(ical, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="itu-calendar.ics"',
      },
    })
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .in('course_id', allCourseIds)
    .order('date')

  if (eventsError) {
    return new Response('Failed to fetch events', { status: 500, headers: corsHeaders })
  }

  // Also fetch holiday events (course_id is null) owned by the user
  const { data: holidays } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'holiday')
    .is('course_id', null)
    .order('date')

  // Generate iCal content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ITU Calendar//EN',
    'X-WR-CALNAME:ITU Calendar',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  const allEvents = [...(events || []), ...(holidays || [])]

  for (const event of allEvents) {
    const dateCompact = event.date.replace(/-/g, '')
    const uid = `${event.id}@itu-cal`
    const courseName = event.course_id ? courseMap.get(event.course_id)?.name : null
    const summary = courseName ? `${courseName}: ${event.title}` : event.title

    lines.push('BEGIN:VEVENT')
    if (event.start_time) {
      const timeCompact = event.start_time.replace(/:/g, '') + '00'
      lines.push(`DTSTART:${dateCompact}T${timeCompact}`)
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dateCompact}`)
    }
    if (event.end_time) {
      const endTimeCompact = event.end_time.replace(/:/g, '') + '00'
      lines.push(`DTEND:${dateCompact}T${endTimeCompact}`)
    }
    lines.push(`SUMMARY:${escapeIcal(summary)}`)
    lines.push(`UID:${uid}`)
    if (event.location) {
      lines.push(`LOCATION:${escapeIcal(event.location)}`)
    }
    if (event.notes) {
      lines.push(`DESCRIPTION:${escapeIcal(event.notes)}`)
    }
    lines.push(`CATEGORIES:${event.type.toUpperCase()}`)
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const ical = lines.join('\r\n')

  return new Response(ical, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="itu-calendar.ics"',
    },
  })
})

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
