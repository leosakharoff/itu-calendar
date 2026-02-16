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

  // Check if this is a test request from a logged-in user
  const body = await req.json().catch(() => ({}))

  if (body.test_mode && body.test_type === 'email') {
    return await handleEmailTest(req, supabase)
  }

  // Verify authorization (service role key or cron secret)
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
    .or('discord_enabled.eq.true,email_enabled.eq.true')

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

      // Send to Discord
      if (ns.discord_enabled && ns.discord_webhook_url) {
        const embeds: DiscordEmbed[] = []

        if (todayEvents.length > 0 && ns.notify_same_day) {
          embeds.push(buildEmbed(`Today — ${todayStr}`, todayEvents, courseMap, 0x007AFF))
        }

        if (tomorrowEvents.length > 0 && ns.notify_day_before) {
          embeds.push(buildEmbed(`Tomorrow — ${tomorrowStr}`, tomorrowEvents, courseMap, 0xFF9500))
        }

        if (embeds.length > 0) {
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
        }
      }

      // Send email via Resend
      if (ns.email_enabled) {
        const { data: userData } = await supabase.auth.admin.getUserById(ns.user_id)
        const userEmail = userData?.user?.email

        if (userEmail) {
          const html = buildEmailHtml(todayEvents, tomorrowEvents, courseMap, todayStr, tomorrowStr, ns)
          if (html) {
            const subject = `ITU Calendar — Events for ${todayStr}`
            const emailResult = await sendEmail(userEmail, subject, html)

            if (emailResult.ok) {
              totalSent++
            } else {
              errors.push(`User ${ns.user_id}: Email failed — ${emailResult.error}`)
            }
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

// Handle test email request from authenticated user
async function handleEmailTest(
  req: Request,
  supabase: ReturnType<typeof createClient>,
): Promise<Response> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing auth token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user?.email) {
    return new Response(JSON.stringify({ error: 'Could not resolve user email' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const result = await sendEmail(
    user.email,
    'ITU Calendar — Test Email',
    `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 8px; font-size: 18px; color: #1a1a1a;">ITU Calendar</h2>
      <p style="margin: 0; color: #555; font-size: 15px;">Your email notifications are working! You will receive event reminders at this address.</p>
    </div>`,
  )

  if (result.ok) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ error: result.error }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Send email via Resend API
async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'ITU Calendar <notifications@itucal.dk>',
        to,
        subject,
        html,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: body.message || `Resend returned ${res.status}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

// Build HTML email body
function buildEmailHtml(
  todayEvents: CalendarEvent[],
  tomorrowEvents: CalendarEvent[],
  courseMap: Map<string, { name: string; color: string }>,
  todayStr: string,
  tomorrowStr: string,
  ns: { notify_same_day: boolean; notify_day_before: boolean },
): string | null {
  const sections: string[] = []

  if (todayEvents.length > 0 && ns.notify_same_day) {
    sections.push(buildEmailSection(`Today (${todayStr})`, todayEvents, courseMap))
  }

  if (tomorrowEvents.length > 0 && ns.notify_day_before) {
    sections.push(buildEmailSection(`Tomorrow (${tomorrowStr})`, tomorrowEvents, courseMap))
  }

  if (sections.length === 0) return null

  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="margin: 0 0 16px; font-size: 18px; color: #1a1a1a;">ITU Calendar</h2>
  ${sections.join('')}
  <p style="margin: 16px 0 0; font-size: 12px; color: #999;">You can manage notifications at itucal.dk</p>
</div>`
}

function buildEmailSection(
  title: string,
  events: CalendarEvent[],
  courseMap: Map<string, { name: string; color: string }>,
): string {
  const items = events.map(e => {
    const course = e.course_id ? courseMap.get(e.course_id) : null
    const courseName = course ? ` (${course.name})` : ''
    const time = e.start_time
      ? (e.end_time ? `${e.start_time}\u2013${e.end_time}` : e.start_time)
      : ''
    const typeTag = e.type !== 'lecture' ? ` [${e.type}]` : ''
    const timeStr = time ? `<span style="color: #888;">${time}</span> ` : ''
    return `<li style="margin: 4px 0; font-size: 14px; color: #333;">${timeStr}<strong>${e.title}</strong>${courseName}${typeTag}</li>`
  })

  return `<div style="margin-bottom: 16px;">
  <h3 style="margin: 0 0 8px; font-size: 15px; color: #555;">${title}</h3>
  <ul style="margin: 0; padding: 0 0 0 20px;">${items.join('')}</ul>
</div>`
}

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
