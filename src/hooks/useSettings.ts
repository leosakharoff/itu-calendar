import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { UserSettings } from '../types/database'

const DEFAULTS: Omit<UserSettings, 'id' | 'user_id' | 'created_at'> = {
  calendar_start: '2026-01',
  calendar_end: '2026-06',
  week_start: 'monday',
  language: 'da',
}

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
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

      // Try to fetch existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (cancelled) return

      if (data && !error) {
        setSettings(data as UserSettings)
        setLoading(false)
        return
      }

      // No row found — insert defaults
      const { data: inserted, error: insertError } = await supabase
        .from('user_settings')
        .insert({ user_id: userId, ...DEFAULTS })
        .select()
        .single()

      if (cancelled) return

      if (inserted && !insertError) {
        setSettings(inserted as UserSettings)
      } else {
        // Fallback: use defaults locally even if insert fails
        setSettings({
          id: '',
          user_id: userId!,
          created_at: '',
          ...DEFAULTS,
        } as UserSettings)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [userId])

  const updateSettings = useCallback(async (partial: Partial<Pick<UserSettings, 'calendar_start' | 'calendar_end' | 'week_start' | 'language'>>) => {
    if (!settings || !userId) return

    // Optimistic update
    setSettings(prev => prev ? { ...prev, ...partial } : prev)

    const { error } = await supabase
      .from('user_settings')
      .update(partial)
      .eq('user_id', userId)

    if (error) {
      // Revert on failure — refetch
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (data) setSettings(data as UserSettings)
    }
  }, [settings, userId])

  return { settings, loading, updateSettings }
}
