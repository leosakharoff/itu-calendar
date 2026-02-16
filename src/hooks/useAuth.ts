import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { prefetchedData } from './useCalendarData'
import type { Course, Subscription } from '../types/database'
import type { User, Session } from '@supabase/supabase-js'

function mergeWithSubscriptions(courses: Course[], subscriptions: Subscription[]): Course[] {
  const subMap = new Map(subscriptions.map(s => [s.source_course_id, s]))
  return courses.map(c => {
    const sub = subMap.get(c.id)
    if (sub) {
      return { ...c, isSubscribed: true, subscriptionId: sub.id, active: sub.active, sort_order: sub.sort_order }
    }
    return { ...c, isSubscribed: false, subscriptionId: null }
  })
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  // Block auth state updates while we prefetch data after sign-in
  const holdAuthRef = useRef(false)
  const pendingAuthRef = useRef<{ session: Session | null } | null>(null)

  const flushAuth = useCallback(() => {
    holdAuthRef.current = false
    const pending = pendingAuthRef.current
    pendingAuthRef.current = null
    if (pending) {
      setSession(pending.session)
      setUser(pending.session?.user ?? null)
    }
  }, [])

  useEffect(() => {
    // Get initial session — prefetch data before showing calendar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Prefetch calendar data so it's ready when the calendar renders
        const [c, e, s] = await Promise.all([
          supabase.from('courses').select('*').order('sort_order'),
          supabase.from('events').select('*').order('date'),
          supabase.from('subscriptions').select('*').eq('subscriber_id', session.user.id)
        ])
        if (!c.error && !e.error) {
          const subs: Subscription[] = s.error ? [] : (s.data || [])
          prefetchedData.courses = mergeWithSubscriptions(c.data || [], subs)
          prefetchedData.events = e.data
        }
      }
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (holdAuthRef.current) {
          // Queue this update — signInWithEmail will flush after prefetch
          pendingAuthRef.current = { session }
          return
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [flushAuth])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const signInWithEmail = async (email: string, password: string) => {
    // Hold auth state updates so the login screen stays visible during prefetch
    holdAuthRef.current = true
    pendingAuthRef.current = null

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) {
      flushAuth()
      throw error
    }

    // Prefetch calendar data while still showing the login screen
    if (data.session?.user) {
      const [c, e, s] = await Promise.all([
        supabase.from('courses').select('*').order('sort_order'),
        supabase.from('events').select('*').order('date'),
        supabase.from('subscriptions').select('*').eq('subscriber_id', data.session.user.id)
      ])
      if (!c.error && !e.error) {
        const subs: Subscription[] = s.error ? [] : (s.data || [])
        prefetchedData.courses = mergeWithSubscriptions(c.data || [], subs)
        prefetchedData.events = e.data
      }
    }

    // Now release — user sees calendar with data already loaded
    setSession(data.session)
    setUser(data.session?.user ?? null)
    holdAuthRef.current = false
    pendingAuthRef.current = null
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async ({ displayName, avatarUrl }: { displayName?: string; avatarUrl?: string }) => {
    const data: Record<string, string> = {}
    if (displayName !== undefined) data.display_name = displayName
    if (avatarUrl !== undefined) data.avatar_url = avatarUrl
    const { error } = await supabase.auth.updateUser({ data })
    if (error) throw error
    // Refresh local user state
    const { data: { user: refreshed } } = await supabase.auth.getUser()
    if (refreshed) setUser(refreshed)
  }

  const updateEmail = async (newEmail: string) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    updateEmail,
    updatePassword
  }
}
