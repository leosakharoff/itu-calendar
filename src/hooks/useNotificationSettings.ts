import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { NotificationSettings } from '../types/database'

const DEFAULTS: Omit<NotificationSettings, 'id' | 'user_id' | 'created_at'> = {
  discord_webhook_url: null,
  discord_enabled: false,
  email_enabled: false,
  notify_event_types: ['deliverable', 'exam'],
  notify_day_before: true,
  notify_same_day: true,
  notify_time: '08:00',
}

export function useNotificationSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setSettings(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (cancelled) return

      if (data && !error) {
        setSettings(data as NotificationSettings)
        setLoading(false)
        return
      }

      // No row found — insert defaults
      const { data: inserted, error: insertError } = await supabase
        .from('notification_settings')
        .insert({ user_id: userId, ...DEFAULTS })
        .select()
        .single()

      if (cancelled) return

      if (inserted && !insertError) {
        setSettings(inserted as NotificationSettings)
      } else {
        setSettings({
          id: '',
          user_id: userId!,
          created_at: '',
          ...DEFAULTS,
        } as NotificationSettings)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const updateNotificationSettings = useCallback(async (partial: Partial<Omit<NotificationSettings, 'id' | 'user_id' | 'created_at'>>) => {
    if (!settings || !userId) return

    // Optimistic update
    setSettings(prev => prev ? { ...prev, ...partial } : prev)

    const { error } = await supabase
      .from('notification_settings')
      .update(partial)
      .eq('user_id', userId)

    if (error) {
      // Revert on failure — refetch
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (data) setSettings(data as NotificationSettings)
    }
  }, [settings, userId])

  const testEmail = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return { ok: false, error: 'Not logged in' }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const res = await fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ test_mode: true, test_type: 'email' }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return { ok: false, error: body.error || `Server returned ${res.status}` }
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }, [])

  const testDiscordWebhook = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const url = settings?.discord_webhook_url
    if (!url) return { ok: false, error: 'No webhook URL' }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: 'ITU Calendar — Test',
            description: 'Your Discord webhook is working! You will receive event reminders here.',
            color: 0x007AFF,
            timestamp: new Date().toISOString(),
          }],
        }),
      })

      if (!res.ok) {
        return { ok: false, error: `Discord returned ${res.status}` }
      }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }, [settings?.discord_webhook_url])

  return { settings, loading, updateNotificationSettings, testDiscordWebhook, testEmail }
}
