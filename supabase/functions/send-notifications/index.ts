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

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Parse body for test mode check
  let body: Record<string, unknown> = {}
  try {
    body = await req.json()
  } catch {
    // empty body is fine for cron invocations
  }

  // --- Test mode: authenticated user can send a test SMS ---
  if (body.test_mode && body.test_type === 'sms') {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const phone = body.test_phone as string
    if (!phone) {
      return new Response(JSON.stringify({ error: 'No phone number provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    try {
      await sendSms(phone, 'ITU Calendar — Test: Your SMS notifications are working!')
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: (err as Error).message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  // --- Normal cron mode: verify authorization ---
  const authHeader = req.headers.get('Authorization')
  const cronSecret = Deno.env.get('CRON_SECRET')
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    if (authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }
  }

  // Get all users with any notification channel enabled
  const { data: notifSettings, error: settingsError } = await supabase
    .from('notification_settings')
    .select('*')
    .or('discord_enabled.eq.true,sms_enabled.eq.true')

  if (settingsError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch notification settings' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!notifSettings || notifSettings.length === 0) {
    return new Response(JSON.stringify({ sent: 0, message: 'No users with notifications enabled' }), {
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

      // --- Send Discord ---
      if (ns.discord_enabled && ns.discord_webhook_url) {
        const embeds: DiscordEmbed[] = []

        if (todayEvents.length > 0 && ns.notify_same_day) {
          embeds.push(buildEmbed(`Today — ${todayStr}`, todayEvents, courseMap, 0x007AFF))
        }

        if (tomorrowEvents.length > 0 && ns.notify_day_before) {
          embeds.push(buildEmbed(`Tomorrow — ${tomorrowStr}`, tomorrowEvents, courseMap, 0xFF9500))
        }

        if (embeds.length > 0) {
          try {
            const res = await fetch(ns.discord_webhook_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ embeds }),
            })
            if (res.ok) totalSent++
            else errors.push(`User ${ns.user_id}: Discord returned ${res.status}`)
          } catch (err) {
            errors.push(`User ${ns.user_id}: Discord error: ${(err as Error).message}`)
          }
        }
      }

      // --- Send SMS ---
      if (ns.sms_enabled && ns.sms_phone_number) {
        const lines: string[] = []

        if (todayEvents.length > 0 && ns.notify_same_day) {
          lines.push(`Today (${todayStr}):`)
          lines.push(...buildSmsLines(todayEvents, courseMap))
        }

        if (tomorrowEvents.length > 0 && ns.notify_day_before) {
          if (lines.length > 0) lines.push('')
          lines.push(`Tomorrow (${tomorrowStr}):`)
          lines.push(...buildSmsLines(tomorrowEvents, courseMap))
        }

        if (lines.length > 0) {
          try {
            await sendSms(ns.sms_phone_number, lines.join('\n'))
            totalSent++
          } catch (err) {
            errors.push(`User ${ns.user_id}: SMS error: ${(err as Error).message}`)
          }
        }
      }
    } catch (err) {
      errors.push(`User ${ns.user_id}: ${(err as Error).message}`)
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, errors }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

// --- Types ---

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

// --- Discord helpers ---

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

// --- SMS helpers ---

function buildSmsLines(
  events: CalendarEvent[],
  courseMap: Map<string, { name: string; color: string }>,
): string[] {
  return events.map(e => {
    const course = e.course_id ? courseMap.get(e.course_id) : null
    const courseName = course ? course.name : ''
    const time = e.start_time
      ? (e.end_time ? `${e.start_time}-${e.end_time}` : e.start_time)
      : ''
    const parts = [
      '•',
      time || '',
      e.title,
      courseName ? `(${courseName})` : '',
      e.type !== 'lecture' ? `[${e.type}]` : '',
    ].filter(Boolean)
    return parts.join(' ')
  })
}

async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!accountSid || !authToken || !from) {
    throw new Error('Twilio credentials not configured')
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const encoded = btoa(`${accountSid}:${authToken}`)

  const params = new URLSearchParams()
  params.set('To', to)
  params.set('From', from)
  params.set('Body', body)

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${encoded}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Twilio returned ${res.status}`)
  }
}

// --- Utilities ---

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
