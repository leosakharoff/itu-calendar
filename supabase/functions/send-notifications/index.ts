import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  // Verify authorization (service role key or cron secret)
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get all users with Discord notifications enabled
  const { data: notifSettings, error: settingsError } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('discord_enabled', true)
    .not('discord_webhook_url', 'is', null)

  if (settingsError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch notification settings' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!notifSettings || notifSettings.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No users with Discord enabled' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const today = new Date()
  const todayStr = formatDate(today)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = formatDate(tomorrow)

  let totalSent = 0
  const errors: string[] = []

  for (const ns of notifSettings) {
    try {
      // Determine which dates to check
      const dates: string[] = []
      if (ns.notify_same_day) dates.push(todayStr)
      if (ns.notify_day_before) dates.push(tomorrowStr)

      if (dates.length === 0) continue

      // Get the user's courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name, color')
        .eq('user_id', ns.user_id)

      if (!courses || courses.length === 0) continue

      const courseIds = courses.map((c: { id: string }) => c.id)
      const courseMap = new Map(courses.map((c: { id: string; name: string; color: string }) => [c.id, c]))

      // Get events for the relevant dates
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .in('course_id', courseIds)
        .in('date', dates)
        .order('date')
        .order('start_time')

      if (!events || events.length === 0) continue

      // Filter events by user's selected event types
      const allowedTypes: string[] = ns.notify_event_types ?? ['deliverable', 'exam']
      const filteredEvents = events.filter((e: CalendarEvent) => allowedTypes.includes(e.type))

      if (filteredEvents.length === 0) continue

      // Group events by date
      const todayEvents = filteredEvents.filter((e: CalendarEvent) => e.date === todayStr)
      const tomorrowEvents = filteredEvents.filter((e: CalendarEvent) => e.date === tomorrowStr)

      // Build Discord embeds
      const embeds: DiscordEmbed[] = []

      if (todayEvents.length > 0 && ns.notify_same_day) {
        embeds.push(buildEmbed(`Today — ${todayStr}`, todayEvents, courseMap, 0x007AFF))
      }

      if (tomorrowEvents.length > 0 && ns.notify_day_before) {
        embeds.push(buildEmbed(`Tomorrow — ${tomorrowStr}`, tomorrowEvents, courseMap, 0xFF9500))
      }

      if (embeds.length === 0) continue

      // Send to Discord
      const res = await fetch(ns.discord_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds }),
      })

      if (res.ok) {
        totalSent++
      } else {
        errors.push(`User ${ns.user_id}: Discord returned ${res.status}`)
      }
    } catch (err) {
      errors.push(`User ${ns.user_id}: ${(err as Error).message}`)
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, errors }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

interface DiscordEmbed {
  title: string
  description: string
  color: number
  footer?: { text: string }
}

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string
  notes: string | null
  course_id: string | null
  start_time: string | null
  end_time: string | null
}

function buildEmbed(
  title: string,
  events: CalendarEvent[],
  courseMap: Map<string, { name: string; color: string }>,
  color: number,
): DiscordEmbed {
  const lines = events.map(e => {
    const course = e.course_id ? courseMap.get(e.course_id) : null
    const courseName = course ? course.name : ''
    const time = e.start_time
      ? (e.end_time ? `${e.start_time}–${e.end_time}` : e.start_time)
      : ''
    const parts = [
      time ? `\`${time}\`` : '',
      `**${e.title}**`,
      courseName ? `(${courseName})` : '',
      e.type !== 'lecture' ? `[${e.type}]` : '',
    ].filter(Boolean)
    return parts.join(' ')
  })

  return {
    title,
    description: lines.join('\n'),
    color,
    footer: { text: 'ITU Calendar' },
  }
}

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
