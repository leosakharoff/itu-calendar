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

  // Look up the shared calendar
  const { data: share, error: shareError } = await supabase
    .from('shared_calendars')
    .select('*, courses(*)')
    .eq('share_token', token)
    .eq('is_active', true)
    .single()

  if (shareError || !share) {
    return new Response('Share link not found or inactive', { status: 404, headers: corsHeaders })
  }

  const course = share.courses
  if (!course) {
    return new Response('Course not found', { status: 404, headers: corsHeaders })
  }

  // Fetch events for the course
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('course_id', share.course_id)
    .order('date')

  if (eventsError) {
    return new Response('Failed to fetch events', { status: 500, headers: corsHeaders })
  }

  // Generate iCal content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ITU Calendar//EN',
    `X-WR-CALNAME:${escapeIcal(course.name)} - ITU`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]

  for (const event of events || []) {
    const dateCompact = event.date.replace(/-/g, '')
    const uid = `${event.id}@itu-cal`

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
    lines.push(`SUMMARY:${escapeIcal(event.title)}`)
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
      'Content-Disposition': `attachment; filename="${course.name.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
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
